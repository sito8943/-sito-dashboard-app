# Getting Started

## 1. Installation

```bash
npm install @sito/dashboard
```

Required peer dependencies:

- `react` `>=18.2 <20`
- `react-dom` `>=18.2 <20`

## 2. Minimum Required Setup

To use the library with `Table`, wrap your app (or at least the view rendering the table) with:

1. `TranslationProvider`
2. `TableOptionsProvider`

```tsx
import { TableOptionsProvider, TranslationProvider } from "@sito/dashboard";

const translations: Record<string, string> = {
  "_accessibility:buttons.applyFilters": "Apply filters",
  "_accessibility:buttons.clear": "Clear",
  "_accessibility:buttons.columns": "Columns",
  "_accessibility:buttons.filters": "Filters",
  "_accessibility:buttons.next": "Next",
  "_accessibility:buttons.openActions": "Open actions",
  "_accessibility:buttons.previous": "Previous",
  "_accessibility:buttons.reset": "Reset",
  "_accessibility:components.table.empty": "No results",
  "_accessibility:components.table.filters.range.end": "To",
  "_accessibility:components.table.filters.range.start": "From",
  "_accessibility:components.table.jumpToPage": "Go to page",
  "_accessibility:components.table.of": "of",
  "_accessibility:components.table.pageSizes": "Rows per page",
  "_accessibility:components.table.selectAllRows": "Select visible rows",
  "_accessibility:components.table.selectRow": "Select row",
  "_accessibility:components.table.selectedCount": "Selected {{count}} rows",
  "_accessibility:labels.actions": "Actions",
};

const t = (key: string, options?: Record<string, unknown>) => {
  const raw = translations[key] ?? key;
  if (typeof options?.count === "number") {
    return raw.replace("{{count}}", String(options.count));
  }
  return raw;
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider t={t} language="en">
      <TableOptionsProvider>{children}</TableOptionsProvider>
    </TranslationProvider>
  );
}
```

Common runtime errors when providers are missing:

- `translationContext must be used within a Provider`
- `tableOptionsContext must be used within a Provider`

## 3. Base Types You Must Respect

```ts
import type { BaseDto } from "@sito/dashboard";

type Row = BaseDto & {
  id: number;
  deletedAt?: string | Date | null;
};
```

`Table<TRow>` requires `TRow` to extend `BaseDto`.

## 4. Minimum Table Example

```tsx
import {
  Table,
  useTableOptions,
  type ActionType,
  type BaseDto,
  type ColumnType,
} from "@sito/dashboard";
import { useEffect, useState } from "react";

type User = BaseDto & {
  name: string;
  email: string;
  deletedAt?: string | null;
};

const columns: ColumnType<User>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
];

export function UsersTable() {
  const [rows, setRows] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentPage, pageSize, sortingBy, sortingOrder, setTotal } =
    useTableOptions();

  useEffect(() => {
    setIsLoading(true);
    fetchUsers({ currentPage, pageSize, sortingBy, sortingOrder })
      .then(({ data, total }) => {
        setRows(data);
        setTotal(total);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, pageSize, sortingBy, sortingOrder, setTotal]);

  const actions = (row: User): ActionType<User>[] => [
    {
      id: "edit",
      tooltip: "Edit",
      icon: <span>E</span>,
      onClick: () => openEditModal(row),
    },
  ];

  return (
    <Table<User>
      entity="user"
      title="Users"
      data={rows}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
    />
  );
}
```

## 5. Integration Checklist

1. Install `@sito/dashboard` and verify peer dependencies.
2. Wrap the app with `TranslationProvider`.
3. Wrap each table view with `TableOptionsProvider`.
4. Ensure each row has `id: number`.
5. Refetch when `currentPage`, `pageSize`, `sortingBy`, `sortingOrder`, or `filters` change.
6. Call `setTotal(total)` after every API response.
