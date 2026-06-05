# Table Guide

## 1. Key `Table` Props

| Prop                        | Type                                       | Description                                          |
| --------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `entity`                    | `string`                                   | Logical entity identifier (recommended).             |
| `data`                      | `TRow[]`                                   | Rows to render.                                      |
| `columns`                   | `ColumnType<TRow>[]`                       | Column definitions.                                  |
| `actions`                   | `(row) => ActionType<TRow>[]`              | Row actions.                                         |
| `title`                     | `string`                                   | Header title.                                        |
| `toolbar`                   | `ReactNode`                                | Right area in header.                                |
| `isLoading`                 | `boolean`                                  | Loading state.                                       |
| `onSort`                    | `(prop, order) => void`                    | Sort callback.                                       |
| `onRowSelect`               | `(row, selected) => void`                  | Single-row selection callback.                       |
| `onSelectedRowsChange`      | `(rows) => void`                           | All selected rows callback.                          |
| `onRowExpand`               | `(expandedRow, collapsedRow) => ReactNode` | Expanded row content.                                |
| `expandedRowId`             | `TRow["id"] \| null`                       | External expanded row control.                       |
| `allowMultipleExpandedRows` | `boolean`                                  | Multiple expanded rows in uncontrolled mode.         |
| `onExpandedRowChange`       | `(expandedRow, collapsedRow) => void`      | Expansion state change callback.                     |
| `softDeleteProperty`        | `keyof TRow`                               | Soft-delete marker field (`"deletedAt"` by default). |
| `className`                 | `string`                                   | Main wrapper class.                                  |
| `contentClassName`          | `string`                                   | Scrollable table body class.                         |
| `canHideColumns`            | `boolean`                                  | Show column visibility menu in header.               |
| `canReset`                  | `boolean`                                  | Show reset button in header.                         |

## 2. Actions: Sticky vs Dropdown vs Bulk

- `sticky: true`: always visible next to the row.
- `sticky` omitted or `false`: rendered inside ellipsis menu (`ActionsDropdown`).
- `multiple: true`: shown in multi-selection bar.
- `onMultipleClick(rows)`: direct bulk action handler.

```tsx
const actions = (row: User): ActionType<User>[] => [
  {
    id: "edit",
    tooltip: "Edit",
    icon: <span>E</span>,
    onClick: () => openEditModal(row),
    sticky: true,
  },
  {
    id: "delete",
    tooltip: "Delete",
    icon: <span>X</span>,
    onClick: () => deleteUser(row),
    hidden: !!row.deletedAt,
  },
  {
    id: "export",
    tooltip: "Export selection",
    icon: <span>v</span>,
    onClick: () => undefined,
    multiple: true,
    onMultipleClick: (selectedRows) => exportUsers(selectedRows),
  },
];
```

## 3. Filter UI

`ColumnType<TRow>.key` is tied to the row shape, so each column key must come from `TRow`.

```ts
import { FilterTypes, type ColumnType } from "@sito/dashboard";

const columns: ColumnType<User>[] = [
  {
    key: "name",
    label: "Name",
    filterOptions: {
      type: FilterTypes.text,
      placeholder: "Search by name",
    },
  },
  {
    key: "role",
    label: "Role",
    filterOptions: {
      type: FilterTypes.select,
      options: [
        { id: "", value: "All" },
        { id: "admin", value: "Admin" },
      ],
    },
  },
];
```

Use `Table.filterOptions` when you need to control the filter dropdown state from outside the table.

```tsx
<Table
  filterOptions={{
    button: { hide: false },
    dropdown: {
      opened: openFilters,
      setOpened: setOpenFilters,
    },
  }}
  {...rest}
/>
```

## 4. Column Visibility UI

Enable the visibility menu and reset button from the table header:

```tsx
<TableOptionsProvider defaultHiddenColumns={["email"]}>
  <Table<User> data={rows} columns={columns} canHideColumns canReset />
</TableOptionsProvider>
```

Relevant `ColumnType` visibility props:

| Prop       | Type                  | Description                                            |
| ---------- | --------------------- | ------------------------------------------------------ |
| `display`  | `"visible" \| "none"` | Static visibility. `"none"` columns are always hidden. |
| `hideable` | `boolean`             | If `false`, column is excluded from the visibility UI. |

The exact reset behavior and the programmatic state API live in [table-state.md](./table-state.md).
