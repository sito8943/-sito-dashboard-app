# Table State

## 1. `TableOptionsProvider` Default State

- `currentPage`: `0`
- `pageSize`: `20`
- `pageSizes`: `[20, 50, 100]`
- `sortingBy`: `"id"`
- `sortingOrder`: `SortOrder.DESC`
- `filters`: `{}`
- `total`: `0`
- `hiddenColumns`: `[]` (or `defaultHiddenColumns` if provided)

You can override the initial state through `initialState`:

```tsx
import { SortOrder, TableOptionsProvider } from "@sito/dashboard";

type UserFilterKey = "name" | "role" | "status";
type UserColumnKey = "id" | "name" | "email" | "role" | "deletedAt";

<TableOptionsProvider<UserFilterKey, UserColumnKey>
  defaultHiddenColumns={["email"]}
  initialState={{
    currentPage: 0,
    pageSize: 50,
    pageSizes: [25, 50, 100],
    sortingBy: "id",
    sortingOrder: SortOrder.ASC,
    filters: { status: "active" },
  }}
>
  <UsersTable />
</TableOptionsProvider>;
```

## 2. Provider Props

| Prop                   | Type                                                           | Description                                                                                                     |
| ---------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `children`             | `ReactNode`                                                    | Required.                                                                                                       |
| `defaultHiddenColumns` | `TColumnKey[]`                                                 | Column keys hidden on mount and after reset.                                                                    |
| `initialState`         | `TableOptionsProviderInitialStateType<TFilterKey, TColumnKey>` | Optional initial values for `currentPage`, `pageSize`, `pageSizes`, `sortingBy`, `sortingOrder`, and `filters`. |

## 3. Typed Filters

`TableFilters` accepts a generic key union, so you can constrain valid filter keys instead of falling back to arbitrary strings.

```ts
import { type TableFilters, useTableOptions } from "@sito/dashboard";

type UserFilterKey = "name" | "role" | "status";
type UserFilters = TableFilters<UserFilterKey>;

const initialFilters: UserFilters = {
  status: "active",
  role: "admin",
};

const { filters, clearFilters } = useTableOptions<UserFilterKey>();

clearFilters("status");
// clearFilters("unknown"); // TypeScript error
```

`useTableOptions` also accepts an optional second generic for sortable and visible column keys.

```ts
type UserColumnKey = "id" | "name" | "email" | "role" | "deletedAt";

const { sortingBy, hiddenColumns, toggleColumn, setHiddenColumns } =
  useTableOptions<UserFilterKey, UserColumnKey>();

toggleColumn("email");
// toggleColumn("unknown"); // TypeScript error
```

## 4. Programmatic Access

Read and update table state from any component inside the provider:

```tsx
const {
  currentPage,
  pageSize,
  sortingBy,
  sortingOrder,
  filters,
  hiddenColumns,
  setCurrentPage,
  setPageSize,
  setSortingBy,
  setSortingOrder,
  setHiddenColumns,
  toggleColumn,
  clearFilters,
  resetTableOptions,
} = useTableOptions<UserFilterKey, UserColumnKey>();
```

## 5. Reset Behavior

When the reset button is clicked (`canReset`) or `resetTableOptions()` is called, the following state is restored:

- `hiddenColumns` -> `defaultHiddenColumns` (or `[]`)
- `sortingBy` -> `initialState.sortingBy` (or `"id"` if omitted)
- `sortingOrder` -> `initialState.sortingOrder` (or `SortOrder.DESC` if omitted)
- `filters` -> `initialState.filters` (or `{}` if omitted)
- `currentPage` -> `initialState.currentPage` (or `0` if omitted)
