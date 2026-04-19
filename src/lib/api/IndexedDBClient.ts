// types
import { QueryParam, QueryResult } from "./types";

// lib
import {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportDto,
  ImportPreviewDto,
  SoftDeleteScope,
} from "lib";

type StoreRegistryEntry = {
  stores: Set<string>;
  version: number;
};

const storeRegistry: Map<string, StoreRegistryEntry> = new Map();
const openLocks: Map<string, Promise<unknown>> = new Map();

const registerStore = (
  dbName: string,
  store: string,
  version: number,
): void => {
  const entry = storeRegistry.get(dbName);
  if (entry) {
    entry.stores.add(store);
    if (version > entry.version) entry.version = version;
    return;
  }
  storeRegistry.set(dbName, {
    stores: new Set([store]),
    version,
  });
};

const getRegisteredStores = (dbName: string): Set<string> =>
  storeRegistry.get(dbName)?.stores ?? new Set();

const getRegisteredVersion = (dbName: string): number =>
  storeRegistry.get(dbName)?.version ?? 1;

/** Run `task` serialized per `dbName` so concurrent opens don't race upgrades. */
const withOpenLock = async <T>(
  dbName: string,
  task: () => Promise<T>,
): Promise<T> => {
  const previous = openLocks.get(dbName) ?? Promise.resolve();
  const next = previous.then(task, task);
  openLocks.set(
    dbName,
    next.catch(() => undefined),
  );
  return next;
};

const probeDatabase = (
  dbName: string,
): Promise<{ version: number; stores: Set<string> }> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const version = db.version;
      const stores = new Set<string>(Array.from(db.objectStoreNames));
      db.close();
      resolve({ version, stores });
    };
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    request.onblocked = () => {
      reject(new Error(`IndexedDB probe blocked for ${dbName}`));
    };
  });

/** Generic IndexedDB-backed client mirroring BaseClient CRUD semantics. */
export class IndexedDBClient<
  Tables extends string,
  TDto extends BaseEntityDto,
  TCommonDto extends BaseCommonEntityDto,
  TAddDto,
  TUpdateDto extends DeleteDto,
  TFilter extends BaseFilterDto,
  TImportPreviewDto extends ImportPreviewDto,
> {
  table: Tables;
  dbName: string;
  version: number;
  private db: IDBDatabase | null = null;

  /**
   * @param table - Object store name.
   * @param dbName - IndexedDB database name.
   * @param version - IndexedDB schema version.
   */
  constructor(table: Tables, dbName: string, version: number = 1) {
    this.table = table;
    this.dbName = dbName;
    this.version = version;
    registerStore(dbName, table, version);
  }

  close() {
    if (!this.db) return;
    this.db.onversionchange = null;
    this.db.close();
    this.db = null;
  }

  private open(): Promise<IDBDatabase> {
    if (this.db && this.db.objectStoreNames.contains(this.table)) {
      return Promise.resolve(this.db);
    }
    if (this.db) this.close();

    return withOpenLock(this.dbName, () => this.openLocked());
  }

  private async openLocked(): Promise<IDBDatabase> {
    if (this.db && this.db.objectStoreNames.contains(this.table))
      return this.db;
    if (this.db) this.close();

    const registered = getRegisteredStores(this.dbName);
    const { version: currentVersion, stores: currentStores } =
      await probeDatabase(this.dbName);

    let missing = false;
    for (const store of registered) {
      if (!currentStores.has(store)) {
        missing = true;
        break;
      }
    }

    const desired = Math.max(this.version, getRegisteredVersion(this.dbName));
    const targetVersion = missing
      ? Math.max(currentVersion + 1, desired)
      : Math.max(currentVersion, desired);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, targetVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        for (const store of registered) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.onversionchange = () => {
          this.close();
        };
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        reject(new Error(`IndexedDB upgrade blocked for ${this.dbName}`));
      };
    });
  }

  private async transaction(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.open();
    return db.transaction(this.table, mode).objectStore(this.table);
  }

  private request<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async insert(value: TAddDto): Promise<TDto> {
    const store = await this.transaction("readwrite");
    const id = await this.request(store.add(value as object));
    return { ...(value as object), id } as TDto;
  }

  async insertMany(data: TAddDto[]): Promise<TDto> {
    if (data.length === 0) throw new Error("insertMany requires items");

    const store = await this.transaction("readwrite");
    let lastId: IDBValidKey = 0;
    for (const item of data) {
      lastId = await this.request(store.add(item as object));
    }
    return { ...(data[data.length - 1] as object), id: lastId } as TDto;
  }

  async update(value: TUpdateDto): Promise<TDto>;
  async update(id: number, value: TUpdateDto): Promise<TDto>;
  async update(
    valueOrId: number | TUpdateDto,
    maybeValue?: TUpdateDto,
  ): Promise<TDto> {
    const value = typeof valueOrId === "number" ? maybeValue : valueOrId;
    if (!value) {
      throw new Error("IndexedDBClient.update requires a value payload");
    }

    const parsedValue =
      typeof valueOrId === "number"
        ? ({ ...value, id: value.id ?? valueOrId } as TUpdateDto)
        : value;

    const store = await this.transaction("readwrite");
    await this.request(store.put(parsedValue as object));
    return parsedValue as unknown as TDto;
  }

  async get(
    query?: QueryParam<TDto>,
    filters?: TFilter,
  ): Promise<QueryResult<TDto>> {
    const store = await this.transaction("readonly");
    const all: TDto[] = await this.request(store.getAll());

    const filtered = this.applyFilter(all, filters as Record<string, unknown>);

    const sortBy = (query?.sortingBy ?? "id") as keyof TDto;
    const order = (query?.sortingOrder?.toLowerCase() ?? "asc") as
      | "asc"
      | "desc";
    filtered.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av < bv) return order === "asc" ? -1 : 1;
      if (av > bv) return order === "asc" ? 1 : -1;
      return 0;
    });

    const requestedPageSize = query?.pageSize;
    const pageSize =
      typeof requestedPageSize === "number" && requestedPageSize > 0
        ? requestedPageSize
        : 10;
    const currentPage = query?.currentPage ?? 0;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const items = filtered.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize,
    );

    return {
      sort: sortBy,
      order,
      currentPage,
      pageSize,
      totalElements,
      totalPages,
      items,
    };
  }

  async export(filters?: TFilter): Promise<TDto[]> {
    const store = await this.transaction("readonly");
    const all: TDto[] = await this.request(store.getAll());
    return this.applyFilter(all, filters as Record<string, unknown>);
  }

  async import(data: ImportDto<TImportPreviewDto>): Promise<number> {
    const store = await this.transaction("readwrite");
    let count = 0;
    for (const item of data.items) {
      if (data.override) {
        await this.request(store.put(item as object));
      } else {
        await this.request(store.add(item as object));
      }
      count++;
    }
    return count;
  }

  async commonGet(query: TFilter): Promise<TCommonDto[]> {
    const store = await this.transaction("readonly");
    const all: TCommonDto[] = await this.request(store.getAll());
    return this.applyFilter(all, query as Record<string, unknown>);
  }

  async getById(id: number): Promise<TDto> {
    const store = await this.transaction("readonly");
    const result = await this.request(store.get(id));
    if (!result) throw new Error(`Record ${id} not found in ${this.table}`);
    return result as TDto;
  }

  async softDelete(ids: number[]): Promise<number> {
    const store = await this.transaction("readwrite");
    let count = 0;
    for (const id of ids) {
      const record = await this.request(store.get(id));
      if (record) {
        await this.request(store.put({ ...record, deletedAt: new Date() }));
        count++;
      }
    }
    return count;
  }

  async restore(ids: number[]): Promise<number> {
    const store = await this.transaction("readwrite");
    let count = 0;
    for (const id of ids) {
      const record = await this.request(store.get(id));
      if (record) {
        await this.request(store.put({ ...record, deletedAt: null }));
        count++;
      }
    }
    return count;
  }

  private applyFilter<T>(items: T[], filters?: Record<string, unknown>): T[] {
    if (!filters) return items;

    const scope = this.resolveSoftDeleteScope(filters.softDeleteScope);
    const scopedItems =
      scope === undefined
        ? items
        : items.filter((item) =>
            this.matchesSoftDeleteScope(
              scope,
              (item as Record<string, unknown>).deletedAt,
            ),
          );

    const appliedFilters = Object.entries(filters).filter(
      ([key, value]) => key !== "softDeleteScope" && value !== undefined,
    );

    if (appliedFilters.length === 0) return scopedItems;

    return scopedItems.filter((item) =>
      appliedFilters.every(([key, filterValue]) =>
        this.matchesFilterValue(
          filterValue,
          (item as Record<string, unknown>)[key],
        ),
      ),
    );
  }

  private matchesFilterValue(filterValue: unknown, itemValue: unknown) {
    if (filterValue instanceof Date) {
      if (itemValue instanceof Date)
        return itemValue.getTime() === filterValue.getTime();
      if (typeof itemValue === "string" || typeof itemValue === "number") {
        const parsed = new Date(itemValue);
        if (Number.isNaN(parsed.getTime())) return false;
        return parsed.getTime() === filterValue.getTime();
      }
      return false;
    }

    return itemValue === filterValue;
  }

  private resolveSoftDeleteScope(value: unknown): SoftDeleteScope | undefined {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toUpperCase();
    if (normalized === "ACTIVE") return "ACTIVE";
    if (normalized === "DELETED") return "DELETED";
    if (normalized === "ALL") return "ALL";
    return undefined;
  }

  private matchesSoftDeleteScope(scope: SoftDeleteScope, deletedAt: unknown) {
    if (scope === "ALL") return true;
    const isDeleted = deletedAt !== null && deletedAt !== undefined;
    if (scope === "DELETED") return isDeleted;
    return !isDeleted;
  }
}
