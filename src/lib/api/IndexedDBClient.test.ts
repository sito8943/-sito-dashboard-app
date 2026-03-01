import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { IndexedDBClient } from "./IndexedDBClient";
import type {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportPreviewDto,
} from "lib";

// ─── DTOs ────────────────────────────────────────────────────────────────────

type UserDto = BaseEntityDto & { name: string; email: string };
type UserCommonDto = BaseCommonEntityDto & { name: string };
type UserAddDto = { name: string; email: string };
type UserUpdateDto = DeleteDto & { name: string; email: string };
type UserFilterDto = BaseFilterDto & { name?: string };
type UserImportPreviewDto = ImportPreviewDto & { row: number };

type AccountDto = BaseEntityDto & { userId: number; balance: number };
type AccountCommonDto = BaseCommonEntityDto & { balance: number };
type AccountAddDto = { userId: number; balance: number };
type AccountUpdateDto = DeleteDto & { userId: number; balance: number };
type AccountFilterDto = BaseFilterDto & { userId?: number };
type AccountImportPreviewDto = ImportPreviewDto & { row: number };

type TransactionDto = BaseEntityDto & {
  accountId: number;
  amount: number;
  description: string;
};
type TransactionCommonDto = BaseCommonEntityDto & { amount: number };
type TransactionAddDto = { accountId: number; amount: number; description: string };
type TransactionUpdateDto = DeleteDto & {
  accountId: number;
  amount: number;
  description: string;
};
type TransactionFilterDto = BaseFilterDto & { accountId?: number };
type TransactionImportPreviewDto = ImportPreviewDto & { row: number };

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Unique db name per test to ensure full isolation
let dbSeq = 0;
const freshDb = () => `idb-test-${++dbSeq}`;

const userClient = (db = freshDb()) =>
  new IndexedDBClient<
    "users",
    UserDto,
    UserCommonDto,
    UserAddDto,
    UserUpdateDto,
    UserFilterDto,
    UserImportPreviewDto
  >("users", db);

const accountClient = (db = freshDb()) =>
  new IndexedDBClient<
    "accounts",
    AccountDto,
    AccountCommonDto,
    AccountAddDto,
    AccountUpdateDto,
    AccountFilterDto,
    AccountImportPreviewDto
  >("accounts", db);

const transactionClient = (db = freshDb()) =>
  new IndexedDBClient<
    "transactions",
    TransactionDto,
    TransactionCommonDto,
    TransactionAddDto,
    TransactionUpdateDto,
    TransactionFilterDto,
    TransactionImportPreviewDto
  >("transactions", db);

// ─── User ─────────────────────────────────────────────────────────────────────

describe("User", () => {
  let client: ReturnType<typeof userClient>;

  beforeEach(() => {
    client = userClient();
  });

  it("insert returns dto with auto-incremented id", async () => {
    const user = await client.insert({ name: "Alice", email: "alice@test.com" });

    expect(user.id).toBe(1);
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@test.com");
  });

  it("getById retrieves the stored user", async () => {
    await client.insert({ name: "Bob", email: "bob@test.com" });

    const user = await client.getById(1);

    expect(user.id).toBe(1);
    expect(user.name).toBe("Bob");
  });

  it("getById throws when id does not exist", async () => {
    await expect(client.getById(99)).rejects.toThrow("Record 99 not found");
  });

  it("update persists new values and returns updated dto", async () => {
    await client.insert({ name: "Charlie", email: "charlie@test.com" });

    const updated = await client.update({ id: 1, name: "Charles", email: "charles@test.com" });

    const stored = await client.getById(1);
    expect(updated.name).toBe("Charles");
    expect(stored.name).toBe("Charles");
  });

  it("insertMany stores all items and returns the last one", async () => {
    const last = await client.insertMany([
      { name: "Dave", email: "dave@test.com" },
      { name: "Eva", email: "eva@test.com" },
      { name: "Frank", email: "frank@test.com" },
    ]);

    expect(last.name).toBe("Frank");
    const result = await client.get();
    expect(result.totalElements).toBe(3);
  });

  it("get returns paginated result with defaults", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });
    await client.insert({ name: "Bob", email: "bob@test.com" });

    const result = await client.get();

    expect(result.items).toHaveLength(2);
    expect(result.totalElements).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(0);
    expect(result.pageSize).toBe(10);
  });

  it("get respects pageSize and currentPage", async () => {
    for (let i = 1; i <= 5; i++)
      await client.insert({ name: `User${i}`, email: `u${i}@test.com` });

    const page0 = await client.get({ pageSize: 2, currentPage: 0 });
    const page1 = await client.get({ pageSize: 2, currentPage: 1 });

    expect(page0.items).toHaveLength(2);
    expect(page0.totalPages).toBe(3);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0]!.name).toBe("User3");
  });

  it("get sorts by field ascending and descending", async () => {
    await client.insert({ name: "Zara", email: "z@test.com" });
    await client.insert({ name: "Ana", email: "a@test.com" });
    await client.insert({ name: "Mike", email: "m@test.com" });

    const asc = await client.get({ sortingBy: "name", sortingOrder: "asc" as any });
    const desc = await client.get({ sortingBy: "name", sortingOrder: "desc" as any });

    expect(asc.items.map((u) => u.name)).toEqual(["Ana", "Mike", "Zara"]);
    expect(desc.items.map((u) => u.name)).toEqual(["Zara", "Mike", "Ana"]);
  });

  it("export returns all records without pagination", async () => {
    for (let i = 1; i <= 15; i++)
      await client.insert({ name: `User${i}`, email: `u${i}@test.com` });

    const all = await client.export();

    expect(all).toHaveLength(15);
  });

  it("export filters by field value", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });
    await client.insert({ name: "Bob", email: "bob@test.com" });
    await client.insert({ name: "Alice", email: "alice2@test.com" });

    const alices = await client.export({ name: "Alice" });

    expect(alices).toHaveLength(2);
    expect(alices.every((u) => u.name === "Alice")).toBe(true);
  });

  it("import with override=false adds all items", async () => {
    const count = await client.import({
      override: false,
      items: [
        { row: 1, existing: false },
        { row: 2, existing: false },
      ],
    });

    expect(count).toBe(2);
    const result = await client.get();
    expect(result.totalElements).toBe(2);
  });

  it("import with override=true upserts items", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });

    const count = await client.import({
      override: true,
      items: [{ id: 1, row: 1, existing: true } as any],
    });

    expect(count).toBe(1);
  });

  it("commonGet returns matching common DTOs", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });
    await client.insert({ name: "Bob", email: "bob@test.com" });

    const results = await client.commonGet({ name: "Alice" } as UserFilterDto);

    expect(results).toHaveLength(1);
    expect((results[0] as any).name).toBe("Alice");
  });

  it("softDelete sets deletedAt on matching ids", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });
    await client.insert({ name: "Bob", email: "bob@test.com" });

    const deleted = await client.softDelete([1, 2]);

    expect(deleted).toBe(2);
    const alice = await client.getById(1);
    expect(alice.deletedAt).toBeInstanceOf(Date);
  });

  it("softDelete skips ids that do not exist", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });

    const deleted = await client.softDelete([1, 99]);

    expect(deleted).toBe(1);
  });

  it("restore clears deletedAt on matching ids", async () => {
    await client.insert({ name: "Alice", email: "alice@test.com" });
    await client.softDelete([1]);

    const restored = await client.restore([1]);

    expect(restored).toBe(1);
    const alice = await client.getById(1);
    expect(alice.deletedAt).toBeNull();
  });
});

// ─── Account (1 User → N Accounts) ───────────────────────────────────────────

describe("Account (1 User → N Accounts)", () => {
  let accounts: ReturnType<typeof accountClient>;

  beforeEach(() => {
    accounts = accountClient();
  });

  it("inserts multiple accounts for the same userId", async () => {
    const userId = 1;

    await accounts.insert({ userId, balance: 1000 });
    await accounts.insert({ userId, balance: 2500 });
    await accounts.insert({ userId: 2, balance: 500 });

    const all = await accounts.get();
    expect(all.totalElements).toBe(3);
  });

  it("get filtered by userId returns only that user's accounts", async () => {
    const userId = 1;
    await accounts.insert({ userId, balance: 1000 });
    await accounts.insert({ userId, balance: 2500 });
    await accounts.insert({ userId: 2, balance: 500 });

    const result = await accounts.get(undefined, { userId });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((a) => a.userId === userId)).toBe(true);
  });

  it("export filtered by userId returns all user accounts without pagination", async () => {
    const userId = 3;
    for (let i = 0; i < 12; i++) await accounts.insert({ userId, balance: i * 100 });
    await accounts.insert({ userId: 99, balance: 0 });

    const userAccounts = await accounts.export({ userId });

    expect(userAccounts).toHaveLength(12);
    expect(userAccounts.every((a) => a.userId === userId)).toBe(true);
  });

  it("update changes account balance", async () => {
    await accounts.insert({ userId: 1, balance: 1000 });

    await accounts.update({ id: 1, userId: 1, balance: 1500 });

    const stored = await accounts.getById(1);
    expect(stored.balance).toBe(1500);
  });

  it("softDelete and restore work on accounts", async () => {
    await accounts.insert({ userId: 1, balance: 1000 });

    await accounts.softDelete([1]);
    let stored = await accounts.getById(1);
    expect(stored.deletedAt).toBeInstanceOf(Date);

    await accounts.restore([1]);
    stored = await accounts.getById(1);
    expect(stored.deletedAt).toBeNull();
  });
});

// ─── Transaction (1 Account → N Transactions) ────────────────────────────────

describe("Transaction (1 Account → N Transactions)", () => {
  let txs: ReturnType<typeof transactionClient>;

  beforeEach(() => {
    txs = transactionClient();
  });

  it("inserts multiple transactions for the same accountId", async () => {
    const accountId = 1;

    await txs.insert({ accountId, amount: 50, description: "Coffee" });
    await txs.insert({ accountId, amount: 200, description: "Groceries" });
    await txs.insert({ accountId: 2, amount: 100, description: "Gas" });

    const all = await txs.get();
    expect(all.totalElements).toBe(3);
  });

  it("get filtered by accountId returns only that account's transactions", async () => {
    const accountId = 1;
    await txs.insert({ accountId, amount: 50, description: "Coffee" });
    await txs.insert({ accountId, amount: 200, description: "Groceries" });
    await txs.insert({ accountId: 2, amount: 100, description: "Gas" });

    const result = await txs.get(undefined, { accountId });

    expect(result.items).toHaveLength(2);
    expect(result.items.every((t) => t.accountId === accountId)).toBe(true);
  });

  it("export filtered by accountId returns all account transactions", async () => {
    const accountId = 5;
    for (let i = 0; i < 15; i++)
      await txs.insert({ accountId, amount: i * 10, description: `Tx${i}` });
    await txs.insert({ accountId: 99, amount: 999, description: "Other" });

    const accountTxs = await txs.export({ accountId });

    expect(accountTxs).toHaveLength(15);
    expect(accountTxs.every((t) => t.accountId === accountId)).toBe(true);
  });

  it("get sorts transactions by amount descending", async () => {
    const accountId = 1;
    await txs.insert({ accountId, amount: 50, description: "A" });
    await txs.insert({ accountId, amount: 300, description: "B" });
    await txs.insert({ accountId, amount: 150, description: "C" });

    const result = await txs.get(
      { sortingBy: "amount", sortingOrder: "desc" as any },
      { accountId }
    );

    expect(result.items.map((t) => t.amount)).toEqual([300, 150, 50]);
  });

  it("update changes transaction amount and description", async () => {
    await txs.insert({ accountId: 1, amount: 50, description: "Coffee" });

    await txs.update({ id: 1, accountId: 1, amount: 75, description: "Brunch" });

    const stored = await txs.getById(1);
    expect(stored.amount).toBe(75);
    expect(stored.description).toBe("Brunch");
  });

  it("insertMany stores a batch of transactions", async () => {
    const accountId = 1;
    const batch: TransactionAddDto[] = Array.from({ length: 5 }, (_, i) => ({
      accountId,
      amount: (i + 1) * 10,
      description: `Batch${i + 1}`,
    }));

    const last = await txs.insertMany(batch);

    expect(last.description).toBe("Batch5");
    const all = await txs.get();
    expect(all.totalElements).toBe(5);
  });

  it("softDelete marks transactions as deleted", async () => {
    await txs.insert({ accountId: 1, amount: 50, description: "Coffee" });
    await txs.insert({ accountId: 1, amount: 200, description: "Groceries" });

    const count = await txs.softDelete([1, 2]);

    expect(count).toBe(2);
    const tx1 = await txs.getById(1);
    const tx2 = await txs.getById(2);
    expect(tx1.deletedAt).toBeInstanceOf(Date);
    expect(tx2.deletedAt).toBeInstanceOf(Date);
  });
});

// ─── Full hierarchy ────────────────────────────────────────────────────────────

describe("Full hierarchy: User → Accounts → Transactions", () => {
  it("creates user with accounts and transactions, queries by relation", async () => {
    const users = userClient();
    const accounts = accountClient();
    const txs = transactionClient();

    // Create user
    const user = await users.insert({ name: "Alice", email: "alice@test.com" });
    expect(user.id).toBe(1);

    // Create 2 accounts for Alice
    const acc1 = await accounts.insert({ userId: user.id, balance: 5000 });
    const acc2 = await accounts.insert({ userId: user.id, balance: 1500 });

    // Create 3 transactions for acc1, 2 for acc2
    await txs.insert({ accountId: acc1.id, amount: 100, description: "Salary" });
    await txs.insert({ accountId: acc1.id, amount: -50, description: "Coffee" });
    await txs.insert({ accountId: acc1.id, amount: -200, description: "Groceries" });
    await txs.insert({ accountId: acc2.id, amount: 500, description: "Freelance" });
    await txs.insert({ accountId: acc2.id, amount: -30, description: "Bus" });

    // Alice has 2 accounts
    const aliceAccounts = await accounts.get(undefined, { userId: user.id });
    expect(aliceAccounts.items).toHaveLength(2);

    // acc1 has 3 transactions
    const acc1Txs = await txs.get(undefined, { accountId: acc1.id });
    expect(acc1Txs.items).toHaveLength(3);

    // acc2 has 2 transactions
    const acc2Txs = await txs.export({ accountId: acc2.id });
    expect(acc2Txs).toHaveLength(2);

    // Soft-delete acc2 and verify
    await accounts.softDelete([acc2.id]);
    const deletedAcc = await accounts.getById(acc2.id);
    expect(deletedAcc.deletedAt).toBeInstanceOf(Date);

    // Restore acc2
    await accounts.restore([acc2.id]);
    const restoredAcc = await accounts.getById(acc2.id);
    expect(restoredAcc.deletedAt).toBeNull();
  });
});
