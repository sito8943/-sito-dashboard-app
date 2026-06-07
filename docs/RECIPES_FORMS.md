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
  ConfirmationDialog,
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
    confirmation: {
      title: "Confirm product creation",
      message: "Create this product with the current form values?",
    },
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
    confirmation: {
      title: "Confirm product changes",
      message: "Save these changes to the product?",
      extraActions: [
        {
          id: "review-product",
          type: "button",
          variant: "outlined",
          color: "secondary",
          children: "Review",
          onClick: () => openReviewPanel(),
        },
      ],
    },
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

      {createDialog.confirmationProps ? (
        <ConfirmationDialog {...createDialog.confirmationProps} />
      ) : null}

      {editDialog.confirmationProps ? (
        <ConfirmationDialog {...editDialog.confirmationProps} />
      ) : null}
    </>
  );
}
```

Storybook reference: see `Hooks/Dialogs/FormDialogs` -> `StateModeSetValuesOnOpen` and `StateModeReopenWithSubmittedValues`.

`usePostDialog` and `usePutDialog` accept an optional `confirmation` config for
mutations that need a final review step. The form dialog stays open while the
confirmation dialog is open; the mutation runs only from the confirmation
submit action. Render `dialog.confirmationProps` in a sibling
`ConfirmationDialog`, and pass `confirmation.extraActions` when the confirmation
footer needs secondary actions.

For custom payload capture outside `usePostDialog` / `usePutDialog`, use
`useFormDialogConfirmation<TPayload>` directly and render its
`confirmationProps` with `ConfirmationDialog`.

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

      <Dialog
        open={open}
        title="Quick dialog"
        handleClose={handleClose}
        closeOnBackdropClick
      >
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

`Dialog` does not close on backdrop click unless `closeOnBackdropClick={true}` is provided. Keep the default when outside clicks would risk discarding work.

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
- For parent-owned state, use the component-level `extraFields` prop (see §4.2).

### 4.2 Component-level `extraFields` (parent-owned state)

Use `extraFields` directly on `ImportDialog` when state lives in the consumer, not the hook. Inputs render between preview and footer actions.

```tsx
import { useState } from "react";
import { ImportDialog } from "@sito/dashboard-app";

const [useCurrentAccount, setUseCurrentAccount] = useState(true);

<ImportDialog<TransactionImportPreviewDto>
  open={open}
  title="Import transactions"
  handleClose={close}
  handleSubmit={() => submitImport({ useCurrentAccount, items: previewItems })}
  fileProcessor={parseFile}
  extraFields={
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={useCurrentAccount}
        onChange={(e) => setUseCurrentAccount(e.target.checked)}
      />
      <span>Use current account</span>
    </label>
  }
/>;
```

Prefer §4.1 (`defaultExtra` + `renderExtraFields`) when extras are part of the import payload — the hook merges them as `{ items, override, ...extra }`.

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

Horizontal swipe is built in: swipe left advances, swipe right goes back, and navigation is clamped to the first/last step.

### 5.1 Onboarding Back button, icons, and per-action display flags

`Onboarding` auto-renders a Back button on every step except the first (decrements the active step). When composing `Step` standalone, pass `onClickBack` to enable it. Each action button renders a FontAwesome icon next to its label:

| Action         | Default icon       |
| -------------- | ------------------ |
| `back`         | `faArrowLeft`      |
| `next`         | `faArrowRight`     |
| `skip`         | `faForward`        |
| `startAsGuest` | `faUserSecret`     |
| `signIn`       | `faRightToBracket` |

Default responsive layout: icon-only below `28rem` (auto width), label-only at `>=28rem` (min-width `10rem`).

Four display flags + `icons` override the defaults. Each accepts a `boolean` (applies to every action) or `Partial<Record<actionKey, boolean>>` for per-action granularity:

| Prop                | Effect                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| `icons`             | Override the FontAwesome icon for any subset of actions                                |
| `alwaysShowIcon`    | Force icon visible on desktop (mobile already shows it)                                |
| `alwaysHideIcon`    | Force icon hidden at every breakpoint (label-only); label is also shown on mobile      |
| `alwaysHideLabel`   | Force label hidden at every breakpoint (icon-only); button width collapses to auto     |
| `showLabelOnMobile` | Render the label on mobile (default mobile is icon-only); button width expands to 100% |

`alwaysHideLabel` wins when it conflicts with icon display on the same action.

```tsx
import {
  faCircleQuestion,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { Onboarding } from "@sito/dashboard-app";

// Mobile: next/back stay icon-only, central guest CTA shows its label.
<Onboarding
  showLabelOnMobile={{ startAsGuest: true }}
  steps={[
    { title: "Welcome", body: "..." },
    { title: "Ready", body: "..." },
  ]}
/>;

// Override icons globally, force icons visible on desktop too.
<Onboarding
  alwaysShowIcon
  icons={{ next: faPaperPlane, skip: faCircleQuestion }}
  steps={[
    { title: "Step 1", body: "..." },
    { title: "Step 2", body: "..." },
  ]}
/>;

// Hide icons everywhere and show labels on mobile too.
<Onboarding
  alwaysHideIcon
  steps={[
    { title: "Step 1", body: "..." },
    { title: "Step 2", body: "..." },
  ]}
/>;
```

The same five controls can be set per-step on each `steps[]` entry. Step values are merged on top of onboarding-level values per-action — step keys win, missing keys inherit. When the onboarding-level value is a `boolean` and the step value is a map, missing step keys inherit the boolean.

```tsx
<Onboarding
  // baseline applied to every step
  alwaysShowIcon={{ back: true, next: true }}
  alwaysHideIcon={{ skip: true }}
  icons={{ next: faPaperPlane }}
  steps={[
    {
      title: "Step 1",
      body: "Inherits baseline icon + flag settings.",
    },
    {
      title: "Step 2 (overridden)",
      body: "Shows labels on mobile and a custom skip icon.",
      showLabelOnMobile: true,
      icons: { skip: faCircleQuestion },
    },
    {
      title: "Final",
      body: "Final step collapses CTAs to icon-only.",
      alwaysHideLabel: { startAsGuest: true, signIn: true },
    },
  ]}
/>
```

When composing `Step` standalone (outside `Onboarding`), the same `icons`, `alwaysShowIcon`, `alwaysHideIcon`, `alwaysHideLabel`, and `showLabelOnMobile` props are available, plus `onClickBack` to render the Back button.

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

      {/* Multiple call-to-actions (array form, v0.0.79+) */}
      <Empty
        message="No records found"
        action={[
          {
            id: "create",
            tooltip: "Create item",
            icon: faPlus,
            onClick: () => {},
          },
          {
            id: "import",
            tooltip: "Import items",
            icon: faCloudUpload,
            onClick: () => {},
          },
        ]}
      />

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

## 9. Auth patterns with `useAuth` (`rememberMe`, session restore/logout)

```tsx
import { useAuth, type AuthDto } from "@sito/dashboard-app";

export function SignInForm() {
  const { logUser, logUserFromLocal, logoutUser } = useAuth();

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
    </div>
  );
}
```

### 9.1 Prefab auth route views

Use the shared auth views when the screen layout should be library-owned but
submission, notifications, redirects, and i18n stay consumer-owned. The views
route through `ConfigProvider`, so no React Router dependency is required by
the library.

Session entry/registration views use the session-focused `manager.Auth`
(`IAuthClient`) by default in this example. Password recovery and email
confirmation views use an `IAuthApiClient` (`RestAuthRecoveryClient`,
`SupabaseAuthApiClient`, or a compatible adapter).

```tsx
import {
  AuthRecoveryView,
  AuthSignInView,
  AuthSignUpConfirmationView,
  AuthSignUpView,
  buildAuthRedirectUrl,
  getAuthErrorMessage,
  useAuth,
  useConfig,
  useNotification,
} from "@sito/dashboard-app";

import { AppRoutes } from "../lib/routes";
import { authApi } from "../lib/authApi";
import { useManager } from "../providers";

export function SignInRoute() {
  const manager = useManager();
  const { logUser } = useAuth();
  const { showErrorNotification } = useNotification();

  return (
    <AuthSignInView
      title="Sign in"
      emailLabel="Email"
      passwordLabel="Password"
      rememberLabel="Remember me"
      submitLabel="Sign in"
      signUpQuestion="Need an account?"
      signUpLabel="Create one"
      signUpTo={AppRoutes.SignUp}
      recoveryQuestion="Forgot your password?"
      recoveryLabel="Reset it"
      recoveryTo={AppRoutes.Recovery}
      onSubmit={async (values) => {
        const session = await manager.Auth.login(values);
        logUser(session, values.rememberMe);
      }}
      onError={(error) =>
        showErrorNotification({
          message: getAuthErrorMessage(error) || "Sign in failed",
        })
      }
    />
  );
}

export function SignUpRoute() {
  const manager = useManager();
  const { logUser } = useAuth();
  const { navigate } = useConfig();
  const { showErrorNotification } = useNotification();

  return (
    <AuthSignUpView
      title="Create account"
      nameLabel="Name"
      emailLabel="Email"
      passwordLabel="Password"
      confirmPasswordLabel="Confirm password"
      passwordMismatchMessage="Passwords do not match"
      submitLabel="Create account"
      signInQuestion="Already have an account?"
      signInLabel="Sign in"
      signInTo={AppRoutes.SignIn}
      onSubmit={async ({ confirmPassword, ...values }) => {
        const session = await manager.Auth.register({
          ...values,
          rPassword: confirmPassword,
        });
        logUser(session, false);
      }}
      onError={(error) => {
        if (
          error instanceof Error &&
          error.message === "Email confirmation required"
        ) {
          navigate(AppRoutes.SignUpConfirmation);
          return;
        }

        showErrorNotification({
          message: getAuthErrorMessage(error) || "Sign up failed",
        });
      }}
    />
  );
}

export function RecoveryRoute() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  return (
    <AuthRecoveryView
      title="Recover password"
      description="Enter your email and we will send a reset link."
      emailLabel="Email"
      submitLabel="Send reset link"
      signInQuestion="Remember your password?"
      signInLabel="Sign in"
      signInTo={AppRoutes.SignIn}
      onSubmit={async (values) => {
        await authApi.forgotPassword({
          ...values,
          redirectTo: buildAuthRedirectUrl(AppRoutes.UpdatePassword),
        });
        showSuccessNotification({ message: "Reset email sent" });
      }}
      onError={(error) =>
        showErrorNotification({
          message: getAuthErrorMessage(error) || "Recovery failed",
        })
      }
    />
  );
}

export function SignUpConfirmationRoute({ email }: { email: string }) {
  const { navigate } = useConfig();

  return (
    <AuthSignUpConfirmationView
      title="Check your email"
      description="Confirm your address before signing in."
      toSignInLabel="Back to sign in"
      resendLabel="Resend email"
      onSignIn={() => navigate(AppRoutes.SignIn)}
      onResendConfirmEmail={() =>
        authApi.resendConfirmEmail({
          email,
          redirectTo: buildAuthRedirectUrl(AppRoutes.ConfirmEmailSuccess),
        })
      }
    />
  );
}
```

Reset password and confirm-email verification views handle token parsing and
DTO creation internally. Pass translated text, route constants, and the
side-channel auth API adapter.

```tsx
import {
  AuthConfirmEmailErrorView,
  AuthConfirmEmailSuccessView,
  AuthUpdatePasswordView,
  getAuthErrorMessage,
  useNotification,
} from "@sito/dashboard-app";

import { authApi } from "../lib/authApi";
import { AppRoutes } from "../lib/routes";

export function UpdatePasswordRoute() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  return (
    <AuthUpdatePasswordView
      authApi={authApi}
      title="Update password"
      passwordLabel="Password"
      confirmPasswordLabel="Confirm password"
      passwordRequiredMessage="Password is required"
      confirmPasswordRequiredMessage="Confirm your password"
      passwordMismatchMessage="Passwords do not match"
      submitLabel="Save password"
      submitAriaLabel="Save password"
      signInQuestion="Remember your password?"
      signInLabel="Sign in"
      signInTo={AppRoutes.SignIn}
      onSuccess={() => showSuccessNotification({ message: "Password updated" })}
      onInvalidToken={() =>
        showErrorNotification({ message: "Recovery link is invalid" })
      }
      onPasswordMismatch={() =>
        showErrorNotification({ message: "Passwords do not match" })
      }
      onError={(error) =>
        showErrorNotification({
          message: getAuthErrorMessage(error) || "Password update failed",
        })
      }
    />
  );
}

export function ConfirmEmailSuccessRoute() {
  return (
    <AuthConfirmEmailSuccessView
      authApi={authApi}
      title="Email confirmed"
      description="Your account is ready."
      verifyingLabel="Verifying email..."
      toSignInLabel="Sign in"
      toSignInAriaLabel="Go to sign in"
      signInTo={AppRoutes.SignIn}
      errorTo={AppRoutes.ConfirmEmailError}
      successTo={AppRoutes.ConfirmEmailSuccess}
    />
  );
}

export function ConfirmEmailErrorRoute() {
  return (
    <AuthConfirmEmailErrorView
      title="Confirmation failed"
      description="The confirmation link is invalid or expired."
      resendLabel="Request a new link"
      resendAriaLabel="Request a new confirmation link"
      toSignInLabel="Back to sign in"
      toSignInAriaLabel="Back to sign in"
      resendTo={AppRoutes.ForgotPassword}
      signInTo={AppRoutes.SignIn}
    />
  );
}
```

### 9.2 Auth form shell with prefab fields

Use `AuthFormShell` when the screen-specific submit logic stays local but the
visual form should match the shared auth layout.

```tsx
import { useForm } from "react-hook-form";
import {
  AuthFormShell,
  Button,
  type AuthFormFieldDefinitionType,
} from "@sito/dashboard-app";

type SignInForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export function SignInRoute() {
  const { control, handleSubmit } = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const fields: AuthFormFieldDefinitionType<SignInForm>[] = [
    {
      kind: "text",
      type: "email",
      name: "email",
      label: "Email",
      required: true,
      rules: { required: "Email is required" },
    },
    {
      kind: "password",
      name: "password",
      label: "Password",
      required: true,
      rules: { required: "Password is required" },
    },
    {
      kind: "checkbox",
      name: "rememberMe",
      label: "Remember me",
    },
  ];

  return (
    <AuthFormShell
      title="Sign in"
      control={control}
      fields={fields}
      onSubmit={(event) => {
        void handleSubmit((values) => signIn(values))(event);
      }}
      actions={
        <Button type="submit" color="primary" variant="submit">
          Sign in
        </Button>
      }
    />
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

## 11. Utility hooks (`useTimeAge`, `useScrollTrigger`, `useOnlineStatus`)

```tsx
import {
  OfflineBanner,
  useOnlineStatus,
  useScrollTrigger,
  useTimeAge,
} from "@sito/dashboard-app";

export function RelativeDateBadge({ createdAt }: { createdAt: Date }) {
  const { timeAge } = useTimeAge();
  const compact = useScrollTrigger(120);
  const { isOnline, isChecking } = useOnlineStatus({
    checkIntervalMs: 30_000,
    probeUrl: "/api/health",
  });

  return (
    <>
      <OfflineBanner
        isOnline={isOnline}
        message={isChecking ? "Checking connectivity..." : "Offline mode"}
      />
      <span>{compact ? "..." : timeAge(createdAt)}</span>
    </>
  );
}
```

Reusable connectivity types:

- `UseOnlineStatusOptions` for app-level wrappers around the polling config
- `OnlineStatus` for the compact hook result
- `OnlineStatusSnapshot` when you need browser connectivity and server reachability split out separately

## 12. Recipe usage recommendations

1. Keep provider order exactly as in `RECIPES_LAYOUT.md` §1.
2. Use the same `queryKey` between listing and mutate/dialog hooks.
3. Always pass generics for entity-driven components and hooks.
4. Reuse official extension points (`extraActions`, `renderCustomPreview`, `tabButtonProps`) before forking components.
5. Keep auth storage keys aligned between `AuthProvider` and `IManager`/client auth config.
6. Prefer `useExportActionMutate` for export flows to keep loading and notifications consistent.
