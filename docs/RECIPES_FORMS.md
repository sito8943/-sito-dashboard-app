# Forms, Dialogs & UX Recipes for `@sito/dashboard-app`

Forms, dialogs, tabs/onboarding, navbar, feedback, notifications, auth, error guards, utility hooks, recommendations.

## 1. Form primitives (`useMutationForm` + `FormContainer` + input components)

```tsx
import { Controller } from "react-hook-form";
import {
  FormContainer,
  ParagraphInput,
  PasswordInput,
  State,
  TextInput,
  useMutationForm,
  type BaseEntityDto,
} from "@sito/dashboard-app";

type ProductForm = {
  name: string;
  description: string;
  adminPassword: string;
};

interface ProductDto extends BaseEntityDto {
  name: string;
  description: string;
}

type CreateProductDto = {
  name: string;
  description: string;
  adminPassword: string;
};

export function CreateProductForm() {
  const form = useMutationForm<
    ProductDto,
    CreateProductDto,
    ProductDto,
    ProductForm
  >({
    defaultValues: {
      name: "",
      description: "",
      adminPassword: "",
    },
    queryKey: ["products"],
    mutationFn: (payload) => api.products.insert(payload),
    formToDto: (values) => values,
    onSuccessMessage: "Product created",
  });

  return (
    <FormContainer<ProductForm> {...form}>
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <TextInput {...field} label="Name" placeholder="Product name" />
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <ParagraphInput
            {...field}
            label="Description"
            helperText="Explain what this product does"
            state={State.default}
            placeholder="Type details"
          />
        )}
      />

      <Controller
        name="adminPassword"
        control={form.control}
        render={({ field }) => (
          <PasswordInput
            {...field}
            state={State.default}
            label="Admin password"
            placeholder="Required to publish"
          />
        )}
      />
    </FormContainer>
  );
}
```

## 2. Form modal patterns: state, create, and edit

```tsx
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  FormDialog,
  useFormDialog,
  usePostDialog,
  usePutDialog,
  type BaseEntityDto,
  type DeleteDto,
  type ButtonPropsType,
} from "@sito/dashboard-app";

type ProductForm = {
  name: string;
  price: number;
};

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

type UpsertProductDto = DeleteDto & ProductForm;

type ProductFilters = {
  search: string;
  minPrice: number;
};

export function ProductDialogs() {
  const [tableFilters, setTableFilters] = useState<ProductFilters>({
    search: "",
    minPrice: 0,
  });
  const [lastSubmittedFilters, setLastSubmittedFilters] =
    useState<ProductFilters>({
      search: "",
      minPrice: 0,
    });

  const filtersDialog = useFormDialog<ProductFilters>({
    mode: "state",
    title: "Filters",
    defaultValues: { search: "", minPrice: 0 },
    reinitializeOnOpen: true,
    dtoToForm: (data) => ({ ...data, ...tableFilters }),
    onSubmit: (values) => {
      setTableFilters(values);
      setLastSubmittedFilters(values);
    },
  });

  const openFiltersWithLastSubmitted = () => {
    filtersDialog.openDialog({ values: lastSubmittedFilters });
  };

  const createDialog = usePostDialog<
    Omit<ProductDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
    ProductDto,
    ProductForm
  >({
    title: "Create product",
    defaultValues: { name: "", price: 0 },
    mutationFn: (dto) => api.products.insert(dto),
    formToDto: (form) => ({ name: form.name, price: form.price }),
    queryKey: ["products"],
  });

  const editDialog = usePutDialog<
    ProductDto,
    UpsertProductDto,
    ProductDto,
    ProductForm
  >({
    title: "Edit product",
    defaultValues: { name: "", price: 0 },
    getFunction: (id) => api.products.getById(id),
    dtoToForm: (dto) => ({ name: dto.name, price: dto.price }),
    mutationFn: (dto) => api.products.update(dto),
    formToDto: (form, dto) => ({ id: dto?.id ?? 0, ...form }),
    queryKey: ["products"],
  });

  const extraActions: ButtonPropsType[] = [
    {
      id: "save-draft",
      type: "button",
      variant: "outlined",
      color: "secondary",
      children: "Save draft",
      onClick: () => saveDraft(),
    },
  ];

  return (
    <>
      <button type="button" onClick={openFiltersWithLastSubmitted}>
        Open filters with last submitted values
      </button>

      <FormDialog<ProductFilters> {...filtersDialog}>
        <Controller
          name="search"
          control={filtersDialog.control}
          render={({ field }) => (
            <input {...field} className="text-input" placeholder="Search" />
          )}
        />
      </FormDialog>

      <FormDialog<ProductForm> {...createDialog} extraActions={extraActions}>
        <Controller
          name="name"
          control={createDialog.control}
          rules={{ required: true }}
          render={({ field }) => (
            <input {...field} className="text-input" placeholder="Name" />
          )}
        />
      </FormDialog>

      <FormDialog<ProductForm> {...editDialog}>
        <Controller
          name="name"
          control={editDialog.control}
          rules={{ required: true }}
          render={({ field }) => (
            <input {...field} className="text-input" placeholder="Name" />
          )}
        />
      </FormDialog>
    </>
  );
}
```

Storybook reference: see `Hooks/Dialogs/FormDialogs` -> `StateModeSetValuesOnOpen` and `StateModeReopenWithSubmittedValues`.

## 3. Base dialog control with `useDialog` + `DialogActions`

```tsx
import { Dialog, DialogActions, useDialog } from "@sito/dashboard-app";

export function RawDialogExample() {
  const { open, handleOpen, handleClose } = useDialog();

  return (
    <>
      <button type="button" onClick={handleOpen}>
        Open
      </button>

      <Dialog open={open} title="Quick dialog" handleClose={handleClose}>
        <p>Body content</p>
        <DialogActions
          primaryText="Confirm"
          cancelText="Cancel"
          onPrimaryClick={handleClose}
          onCancel={handleClose}
          extraActions={[
            {
              id: "secondary-help",
              type: "button",
              variant: "text",
              children: "Help",
              onClick: () => openHelp(),
            },
          ]}
        />
      </Dialog>
    </>
  );
}
```

## 4. Import flows with `ImportDialog` / `useImportDialog`

`ImportDialog` accepts `extraFields` to inject custom inputs between preview and footer actions.

`useImportDialog` adds optional third generic `TExtra` plus two props:

- `defaultExtra?: TExtra` — initial value.
- `renderExtraFields?: ({ values, setValue, setValues }) => ReactNode` — wired into `ImportDialog`'s `extraFields` slot.

Hook merges extra values into payload as `{ items, override, ...extra }`. `mutationFn` typed as `ImportDto<TPreview> & TExtra`.

```tsx
import {
  ImportDialog,
  useImportDialog,
  type BaseEntityDto,
  type ButtonPropsType,
  type ImportPreviewDto,
} from "@sito/dashboard-app";

interface ProductDto extends BaseEntityDto {
  name: string;
  price: number;
}

interface ProductImportPreviewDto extends ImportPreviewDto {
  id: number;
  name: string;
  price: number;
}

export function ProductsImport() {
  const importDialog = useImportDialog<ProductDto, ProductImportPreviewDto>({
    queryKey: ["products"],
    entity: "products",
    mutationFn: (payload) => api.products.import(payload),
    fileProcessor: (file, options) =>
      parseProductsCsv(file, options?.override ?? false),
    renderCustomPreview: (items) => (
      <ProductsPreviewTable items={items ?? []} />
    ),
  });

  const extraActions: ButtonPropsType[] = [
    {
      id: "download-template",
      type: "button",
      variant: "outlined",
      color: "secondary",
      children: "Download template",
      onClick: () => downloadTemplate(),
    },
  ];

  return (
    <>
      <button type="button" onClick={() => importDialog.action().onClick?.()}>
        Import
      </button>

      <ImportDialog<ProductImportPreviewDto>
        {...importDialog}
        extraActions={extraActions}
      />
    </>
  );
}
```

### 4.1 Extra fields wired by the hook

```tsx
import {
  ImportDialog,
  useImportDialog,
  type BaseEntityDto,
  type ImportPreviewDto,
} from "@sito/dashboard-app";

interface TransactionDto extends BaseEntityDto {
  amount: number;
  description: string;
}

interface TransactionImportPreviewDto extends ImportPreviewDto {
  amount: number;
  description: string;
}

type ExtraImport = {
  useCurrentAccount: boolean;
  note: string;
};

export function TransactionsImport({
  currentAccountId,
}: {
  currentAccountId: number;
}) {
  const importDialog = useImportDialog<
    TransactionDto,
    TransactionImportPreviewDto,
    ExtraImport
  >({
    queryKey: ["transactions"],
    entity: "transactions",
    fileProcessor: parseTransactionsFile,
    defaultExtra: { useCurrentAccount: true, note: "" },
    mutationFn: ({ items, override, useCurrentAccount, note }) =>
      api.transactions.import({
        items,
        override,
        accountId: useCurrentAccount ? currentAccountId : null,
        note,
      }),
    renderExtraFields: ({ values, setValue }) => (
      <div className="grid gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.useCurrentAccount}
            onChange={(e) => setValue("useCurrentAccount", e.target.checked)}
          />
          <span>Use current account</span>
        </label>
        <label className="grid gap-1">
          <span>Note</span>
          <input
            type="text"
            value={values.note}
            onChange={(e) => setValue("note", e.target.value)}
          />
        </label>
      </div>
    ),
  });

  return (
    <>
      <button type="button" onClick={() => importDialog.action().onClick?.()}>
        Import transactions
      </button>
      <ImportDialog<TransactionImportPreviewDto> {...importDialog} />
    </>
  );
}
```

Notes:

- Hook returns `extraFields` and spreads via `{...importDialog}`. Don't duplicate manually.
- `defaultExtra` resets the form on close/submit.
- For parent-owned state, use the component-level `extraFields` prop (see `CONSUMER_GUIDE.md` §5.4.1).

## 5. Tabs and onboarding flows (`TabsLayout` + `Onboarding`)

```tsx
import { useState } from "react";
import { Onboarding, TabsLayout } from "@sito/dashboard-app";

const tabs = [
  { id: 1, label: "General", content: <div>General settings</div> },
  { id: 2, label: "Permissions", content: <div>Permissions settings</div> },
];

export function SettingsTabs() {
  const [tab, setTab] = useState(1);

  return (
    <TabsLayout
      tabs={tabs}
      currentTab={tab}
      onTabChange={(id) => setTab(Number(id))}
      useLinks={false}
      tabButtonProps={{ variant: "outlined", color: "secondary" }}
    />
  );
}

export function WelcomeOnboarding() {
  return (
    <Onboarding
      remountStepOnChange
      steps={[
        {
          title: "Welcome",
          body: "This flow explains the main features.",
        },
        {
          title: "Set up your workspace",
          body: "You can inject custom step content.",
          content: <WorkspaceChecklist />,
          image: "/images/onboarding-workspace.png",
          alt: "Workspace setup preview",
        },
      ]}
      signInPath="/auth/sign-in"
      guestPath="/"
    />
  );
}
```

`remountStepOnChange` opt-in (default `false`). Set `true` for wizard flows where each step replays entry animation (`onboarding-step-rise-in` title/body/content stagger 30/90/140ms; `onboarding-step-pop-in` actions stagger 180/230ms). Gated by `ConfigProvider.motion` and `prefers-reduced-motion`.

## 6. Dynamic navbar title/slot with `useNavbar`

```tsx
import { useEffect } from "react";
import { useNavbar } from "@sito/dashboard-app";

export function OrdersPage() {
  const { setTitle, setRightContent } = useNavbar();

  useEffect(() => {
    setTitle("Orders");
    setRightContent(<button type="button">New order</button>);

    return () => {
      setTitle("");
      setRightContent(null);
    };
  }, [setTitle, setRightContent]);

  return <div>...</div>;
}
```

## 7. Feedback patterns (`Error`, `Empty`, `SplashScreen`, `ToTop`, `IconButton`)

```tsx
import {
  Empty,
  Error as ErrorComponent,
  IconButton,
  SplashScreen,
  ToTop,
} from "@sito/dashboard-app";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

export function FeedbackExamples({
  isLoading,
  error,
  onRetry,
}: {
  isLoading: boolean;
  error: globalThis.Error | null;
  onRetry: () => void;
}) {
  if (isLoading) return <SplashScreen />;

  if (error) {
    return <ErrorComponent error={error} onRetry={onRetry} />;
    // Custom mode alternative:
    // return <ErrorComponent><MyCustomErrorPanel /></ErrorComponent>;
  }

  return (
    <>
      <Empty message="No records found" />

      <IconButton
        type="button"
        icon={faRotateRight}
        variant="outlined"
        color="secondary"
        onClick={onRetry}
      />

      <ToTop
        threshold={120}
        tooltip="Back to top"
        variant="outlined"
        color="secondary"
      />
    </>
  );
}
```

## 8. Notification patterns with `useNotification`

```tsx
import { useNotification } from "@sito/dashboard-app";
import { NotificationEnumType } from "@sito/dashboard-app";

export function SaveButton() {
  const {
    showSuccessNotification,
    showErrorNotification,
    showStackNotifications,
  } = useNotification();

  const onSave = async () => {
    try {
      await api.products.insert({ name: "Milk", price: 3 });
      showSuccessNotification({ message: "Saved" });
    } catch {
      showErrorNotification({ message: "Save failed" });
      showStackNotifications([
        { message: "Name is required", type: NotificationEnumType.error },
        { message: "Price must be positive", type: NotificationEnumType.error },
      ]);
    }
  };

  return (
    <button type="button" onClick={onSave}>
      Save
    </button>
  );
}
```

## 9. Auth patterns with `useAuth` (`rememberMe`, guest mode)

```tsx
import { useAuth, type AuthDto } from "@sito/dashboard-app";

export function SignInForm() {
  const { logUser, logUserFromLocal, logoutUser, isInGuestMode, setGuestMode } =
    useAuth();

  const onLogin = async () => {
    const credentials: AuthDto = {
      email: "user@mail.com",
      password: "secret",
      rememberMe: true,
    };

    const session = await api.auth.login(credentials);
    logUser(session, credentials.rememberMe);
  };

  return (
    <div>
      <button type="button" onClick={onLogin}>
        Sign in
      </button>
      <button type="button" onClick={() => logUserFromLocal()}>
        Restore session
      </button>
      <button type="button" onClick={() => logoutUser()}>
        Logout
      </button>
      <button type="button" onClick={() => setGuestMode(true)}>
        Continue as guest
      </button>
      <p>{isInGuestMode() ? "Guest mode" : "User mode"}</p>
    </div>
  );
}
```

## 10. Error handling guards (`isValidationError`, `isHttpError`)

```tsx
import {
  NotificationEnumType,
  isHttpError,
  isValidationError,
  useNotification,
} from "@sito/dashboard-app";

export function ApiActionButton() {
  const { showErrorNotification, showStackNotifications } = useNotification();

  const onClick = async () => {
    try {
      await api.products.insert({});
    } catch (error) {
      if (isValidationError(error)) {
        showStackNotifications(
          error.errors.map(([field, message]) => ({
            type: NotificationEnumType.error,
            message: `${field}: ${message}`,
          })),
        );
        return;
      }

      if (isHttpError(error)) {
        showErrorNotification({
          message: `${error.status} - ${error.message}`,
        });
        return;
      }

      showErrorNotification({ message: "Unknown error" });
    }
  };

  return (
    <button type="button" onClick={onClick}>
      Run API action
    </button>
  );
}
```

## 11. Utility hooks (`useTimeAge`, `useScrollTrigger`)

```tsx
import { useTimeAge, useScrollTrigger } from "@sito/dashboard-app";

export function RelativeDateBadge({ createdAt }: { createdAt: Date }) {
  const { timeAge } = useTimeAge();
  const compact = useScrollTrigger(120);

  return <span>{compact ? "..." : timeAge(createdAt)}</span>;
}
```

## 12. Recipe usage recommendations

1. Keep provider order exactly as in `RECIPES_LAYOUT.md` §1.
2. Use the same `queryKey` between listing and mutate/dialog hooks.
3. Always pass generics for entity-driven components and hooks.
4. Reuse official extension points (`extraActions`, `renderCustomPreview`, `tabButtonProps`) before forking components.
5. Keep auth storage keys aligned between `AuthProvider` and `IManager`/client auth config.
6. Prefer `update(value)` in `IndexedDBClient` consumers; keep `(id, value)` only for transitional code.
7. Prefer `useExportActionMutate` for export flows to keep loading and notifications consistent.
