# `@sito/dashboard` Consumer Guide

Use this file as an index for the consumer-facing docs:

- [getting-started.md](./getting-started.md) for installation, required providers, base types, and the first table example.
- [table-guide.md](./table-guide.md) for `Table` props, actions, filter UI, and column visibility controls.
- [table-state.md](./table-state.md) for `TableOptionsProvider`, generic filter and column keys, reset behavior, and `useTableOptions`.
- [style-customization.md](./style-customization.md) for CSS variables, theming, and class overrides.
- [translations-reference.md](./translations-reference.md) for the required translation keys.

## 1. Form Components (Quick API)

All inputs expose style hooks (`containerClassName`, `inputClassName`, etc.).

```tsx
import {
  AutocompleteInput,
  CheckInput,
  FileInput,
  SelectInput,
  TextInput,
  type Option,
} from "@sito/dashboard";

const options: Option[] = [
  { id: "", value: "Select..." },
  { id: "admin", value: "Admin" },
];

<TextInput
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  label="Email"
/>;

<SelectInput
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={options}
  label="Role"
/>;

<AutocompleteInput
  value={country}
  onChange={setCountry}
  options={[
    { id: "es", name: "Spain" },
    { id: "us", name: "USA" },
  ]}
  label="Country"
  autoSelectOnBlur
/>;

<CheckInput
  checked={active}
  onChange={(e) => setActive(e.target.checked)}
  label="Active"
/>;

<FileInput
  id="csv"
  label="Upload CSV"
  onChange={(e) => console.log(e.target.files)}
/>;
```

`autoSelectOnBlur` defaults to `true`. In single-select mode, blur selects the matching option when the typed text exactly matches an option label, ignoring case and surrounding spaces.

For custom upload UIs (for example profile photo pickers), render only the native input:

```tsx
<FileInput
  id="profile-photo-file-input"
  unstyled
  inputClassName="hidden"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => onUpload(e.currentTarget.files?.[0] ?? null)}
/>
```

`hiddenContainer` is available as an alias of `unstyled`.

`Option` shape expected by selection components:

```ts
type Option = {
  id: number | string;
  value?: number | string;
  name?: string;
};
```

## 2. Quick UI Components (Outside Table)

```tsx
import {
  Action,
  Actions,
  ActionsDropdown,
  Badge,
  Button,
  Chip,
  Dropdown,
  IconButton,
  Loading,
  Tooltip,
} from "@sito/dashboard";
import { useRef, useState } from "react";

<Button variant="submit" color="primary">
  Save
</Button>;

<IconButton icon={<span>*</span>} color="secondary" aria-label="Settings" />;

<Tooltip content="Delete">
  <IconButton icon={<span>X</span>} aria-label="Delete" />
</Tooltip>;

<Badge count={3} />;

<Chip text="Active" onDelete={() => console.log("delete")} />;

<Action
  id="view"
  tooltip="View"
  icon={<span>eye</span>}
  onClick={() => console.log("view")}
/>;

{
  /* Prevent click from bubbling to parent handlers (e.g. row onClick) */
}
<Action
  id="edit"
  tooltip="Edit"
  icon={<span>E</span>}
  onClick={() => console.log("edit")}
  stopPropagation
/>;

<Actions
  actions={[
    { id: "edit", tooltip: "Edit", icon: <span>E</span>, onClick: () => {} },
    {
      id: "remove",
      tooltip: "Delete",
      icon: <span>X</span>,
      onClick: () => {},
    },
  ]}
/>;

<ActionsDropdown
  actions={[
    {
      id: "archive",
      tooltip: "Archive",
      icon: <span>A</span>,
      onClick: () => {},
    },
  ]}
/>;

function ExampleDropdown() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)}>
        Open menu
      </button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={triggerRef.current}
        closeOnClick
      >
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </Dropdown>
    </>
  );
}

<Loading className="h-20" />;
```
