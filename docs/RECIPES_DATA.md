# Data & CRUD Recipes for `@sito/dashboard-app`

CRUD pages, entity clients (`BaseClient` / `IndexedDBClient` / `SupabaseDataClient`), exports.

## 1. CRUD page with `Page`, `PageHeader`, `PrettyGrid`, and action hooks

```tsx
import { useMemo } from "react";
import {
  ConfirmationDialog,
  Page,
  PageHeader,
  PrettyGrid,
  useDeleteDialog,
  useEditAction,
  useRestoreDialog,
  type BaseEntityDto,
  type ButtonPropsType,
} from "@sito/dashboard-app";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

const QUERY_KEY = ["products"];

export function ProductsPage() {
  const rows: ProductDto[] = []; // from your query/api
  const isLoading = false;

  const deleteDialog = useDeleteDialog({
    queryKey: QUERY_KEY,
    mutationFn: (ids) => api.products.softDelete(ids),
  });

  const restoreDialog = useRestoreDialog({
    queryKey: QUERY_KEY,
    mutationFn: (ids) => api.products.restore(ids),
  });

  const { action: editAction } = useEditAction({
    onClick: (id) => openEditDialog(id),
  });

  const rowActions = useMemo(
    () => (item: ProductDto) => [
      editAction(item),
      deleteDialog.action(item),
      restoreDialog.action(item),
    ],
    [deleteDialog, editAction, restoreDialog],
  );

  const confirmExtraActions: ButtonPropsType[] = [
    {
      id: "review-ids",
      type: "button",
      variant: "outlined",
      color: "secondary",
      children: "Review selection",
      onClick: () => openSelectionPreview(),
    },
  ];

  return (
    <>
      <PageHeader<ProductDto> title="Products" />

      <Page<ProductDto>
        title="Products"
        isLoading={isLoading}
        queryKey={QUERY_KEY}
        addOptions={{ onClick: () => openCreateDialog() }}
      >
        <PrettyGrid<ProductDto>
          data={rows}
          renderComponent={(item) => (
            <ProductCard item={item} actions={rowActions(item)} />
          )}
        />
      </Page>

      <ConfirmationDialog
        open={deleteDialog.open}
        title={deleteDialog.title}
        isLoading={deleteDialog.isLoading}
        handleClose={deleteDialog.handleClose}
        handleSubmit={deleteDialog.handleSubmit}
        extraActions={confirmExtraActions}
      >
        Are you sure you want to delete the selected items?
      </ConfirmationDialog>

      <ConfirmationDialog
        open={restoreDialog.open}
        title={restoreDialog.title}
        isLoading={restoreDialog.isLoading}
        handleClose={restoreDialog.handleClose}
        handleSubmit={restoreDialog.handleSubmit}
      >
        Are you sure you want to restore the selected items?
      </ConfirmationDialog>
    </>
  );
}
```

### 1.1 Action primitives without dialog hooks

```tsx
import {
  Actions,
  useDeleteAction,
  useExportAction,
  useImportAction,
  useRestoreAction,
  type BaseEntityDto,
} from "@sito/dashboard-app";

export function ProductActionsBar({ record }: { record: BaseEntityDto }) {
  const { action: deleteAction } = useDeleteAction({
    onClick: (ids) => api.products.softDelete(ids),
  });

  const { action: restoreAction } = useRestoreAction({
    onClick: (ids) => api.products.restore(ids),
  });

  const { action: exportAction } = useExportAction({
    onClick: () => api.products.export(),
  });

  const { action: importAction } = useImportAction({
    onClick: () => openImportDialog(),
  });

  return (
    <Actions
      actions={[
        exportAction(),
        importAction(),
        deleteAction(record),
        restoreAction(record),
      ]}
    />
  );
}
```

## 2. Entity clients (`BaseClient`), offline fallback (`IndexedDBClient`), and Supabase (`SupabaseDataClient`)

```tsx
import {
  BaseClient,
  IndexedDBClient,
  SupabaseDataClient,
  type BaseCommonEntityDto,
  type BaseEntityDto,
  type BaseFilterDto,
  type DeleteDto,
  type ImportPreviewDto,
} from "@sito/dashboard-app";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

interface ProductCommonDto extends BaseCommonEntityDto {
  name: string;
}

type ProductCreateDto = Omit<
  ProductDto,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

type ProductUpdateDto = DeleteDto & ProductCreateDto;

interface ProductFilterDto extends BaseFilterDto {
  category?: string;
}

interface ProductImportPreviewDto extends ImportPreviewDto {
  id: number;
  name: string;
}

class ProductsClient extends BaseClient<
  "products",
  ProductDto,
  ProductCommonDto,
  ProductCreateDto,
  ProductUpdateDto,
  ProductFilterDto,
  ProductImportPreviewDto
> {
  constructor(baseUrl: string) {
    super("products", baseUrl);
  }
}

class ProductsIndexedDBClient extends IndexedDBClient<
  "products",
  ProductDto,
  ProductCommonDto,
  ProductCreateDto,
  ProductUpdateDto,
  ProductFilterDto,
  ProductImportPreviewDto
> {
  constructor() {
    super("products", "my-app-db");
  }
}

class ProductsSupabaseClient extends SupabaseDataClient<
  "products",
  ProductDto,
  ProductCommonDto,
  ProductCreateDto,
  ProductUpdateDto,
  ProductFilterDto,
  ProductImportPreviewDto
> {
  constructor(supabase: SupabaseClient) {
    super("products", supabase);
  }
}

export const productsClient = navigator.onLine
  ? new ProductsClient(import.meta.env.VITE_API_URL)
  : new ProductsIndexedDBClient();
```

### 2.1 Sharing a `dbName` across multiple `IndexedDBClient` instances

Construct clients with the same `dbName` when they belong to one logical DB. Internal registry tracks every `table`; opens serialize per `dbName` so concurrent CRUD is safe and no registered store gets dropped by later opens.

```ts
class UsersIndexedDBClient extends IndexedDBClient<
  "users",
  UserDto,
  UserCommonDto,
  UserCreateDto,
  UserUpdateDto,
  UserFilterDto,
  UserImportPreviewDto
> {
  constructor() {
    super("users", "my-app-db");
  }
}

class AccountsIndexedDBClient extends IndexedDBClient<
  "accounts",
  AccountDto,
  AccountCommonDto,
  AccountCreateDto,
  AccountUpdateDto,
  AccountFilterDto,
  AccountImportPreviewDto
> {
  constructor() {
    super("accounts", "my-app-db");
  }
}

const users = new UsersIndexedDBClient();
const accounts = new AccountsIndexedDBClient();

await Promise.all([
  users.insert({ name: "Alice", email: "alice@test.com" }),
  accounts.insert({ userId: 1, balance: 100 }),
]);
```

Notes:

- Effective open version = `max(registered versions, current db version)`. Missing registered store at open bumps version once and creates all registered stores in one `onupgradeneeded` pass.
- Registering a new store post-existing DB is supported — next `open()` upgrades transparently.

## 3. Ready-to-use export action with `useExportActionMutate`

```tsx
import {
  Page,
  useExportActionMutate,
  type BaseEntityDto,
} from "@sito/dashboard-app";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

export function ProductsHeaderActions() {
  const exportProducts = useExportActionMutate<ProductDto[], "products", Error>(
    {
      entity: "products",
      mutationFn: () => api.products.export(),
      onSuccessMessage: "Export generated",
    },
  );

  return (
    <Page<ProductDto> title="Products" actions={[exportProducts.action()]}>
      {/* ... */}
    </Page>
  );
}
```

## 4. Export with configuration dialog using `useExportDialog`

Use when export needs extra config (date range, format, columns) before hitting backend. Hook owns dialog state, extra form, and mutation. Returned `action()` matches `useExportAction` — `Page`/`Actions`/`PrettyGrid` consume unchanged.

```tsx
import {
  ExportDialog,
  Page,
  useExportDialog,
  type BaseEntityDto,
} from "@sito/dashboard-app";

interface TransactionDto extends BaseEntityDto {
  amount: number;
  description: string;
}

type ExportExtra = {
  from: string;
  to: string;
  format: "csv" | "xlsx";
};

export function TransactionsHeaderActions() {
  const exportDialog = useExportDialog<TransactionDto, ExportExtra, Blob>({
    entity: "transactions",
    defaultExtra: { from: "", to: "", format: "csv" },
    mutationFn: ({ from, to, format }) =>
      api.transactions.exportRange({ from, to, format }),
    renderExtraFields: ({ values, setValue }) => (
      <div className="grid gap-2">
        <label className="grid gap-1">
          <span>From</span>
          <input
            type="date"
            value={values.from}
            onChange={(e) => setValue("from", e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span>To</span>
          <input
            type="date"
            value={values.to}
            onChange={(e) => setValue("to", e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span>Format</span>
          <select
            value={values.format}
            onChange={(e) =>
              setValue("format", e.target.value as ExportExtra["format"])
            }
          >
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
        </label>
      </div>
    ),
  });

  return (
    <>
      <Page<TransactionDto>
        title="Transactions"
        actions={[exportDialog.action()]}
      >
        {/* ... */}
      </Page>
      <ExportDialog {...exportDialog} title="Export transactions" />
    </>
  );
}
```

Notes:

- Hook does **not** invalidate queries — export doesn't mutate server state. If yours does (rare), invalidate in `onSuccess`.
- `defaultExtra` resets the form on close/submit.
- Opt out anytime: switch back to `useExportAction` + `useExportActionMutate`. The `action()` descriptor is interchangeable.
- Hook does **not** auto-trigger download. `mutationFn` returns whatever backend produces (Blob/url/void); handle download in consumer (e.g. anchor with Blob in `onSuccess`).
