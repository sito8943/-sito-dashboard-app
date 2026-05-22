import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { AuthFormShell } from "./AuthFormShell";
import type { AuthFormFieldDefinitionType } from "./types";

vi.mock("@sito/dashboard", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  type TextInputMockProps = InputHTMLAttributes<HTMLInputElement> & {
    containerClassName?: string;
    helperText?: ReactNode;
    inputClassName?: string;
    label?: ReactNode;
    state?: string;
  };

  type CheckInputMockProps = InputHTMLAttributes<HTMLInputElement> & {
    containerClassName?: string;
    label?: ReactNode;
    state?: string;
  };

  type IconButtonMockProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
  };

  return {
    Button: ({
      children,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    CheckInput: React.forwardRef<HTMLInputElement, CheckInputMockProps>(
      ({ containerClassName, label, ...props }, ref) => (
        <label className={containerClassName}>
          <input ref={ref} type="checkbox" {...props} />
          {label}
        </label>
      ),
    ),
    IconButton: ({ icon, children, ...props }: IconButtonMockProps) => (
      <button {...props}>
        {icon}
        {children}
      </button>
    ),
    Loading: () => <span data-testid="loading" />,
    State: {
      default: "default",
      error: "error",
      good: "good",
    },
    TextInput: React.forwardRef<HTMLInputElement, TextInputMockProps>(
      (
        {
          containerClassName,
          helperText,
          inputClassName,
          label,
          state,
          ...props
        },
        ref,
      ) => (
        <label className={containerClassName}>
          {label}
          <input
            ref={ref}
            aria-label={typeof label === "string" ? label : undefined}
            className={inputClassName}
            {...props}
          />
          {helperText && <span>{helperText}</span>}
          {state && <span data-testid="state">{state}</span>}
        </label>
      ),
    ),
    classNames: (...values: Array<string | false | null | undefined>) =>
      values.filter(Boolean).join(" "),
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

type SignInForm = {
  email: string;
};

const fields: AuthFormFieldDefinitionType<SignInForm>[] = [
  {
    kind: "text",
    name: "email",
    label: "Email",
  },
];

const AuthFormShellHarness = ({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (values: SignInForm) => void | Promise<void>;
}) => {
  const { control, handleSubmit } = useForm<SignInForm>({
    defaultValues: {
      email: "person@example.com",
    },
  });

  return (
    <AuthFormShell<SignInForm>
      title="Sign in"
      control={control}
      fields={fields}
      disabled={disabled}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      actions={<button type="submit">Submit</button>}
    />
  );
};

describe("AuthFormShell", () => {
  it("keeps form values when rendered inputs are disabled", async () => {
    const onSubmit = vi.fn();

    render(<AuthFormShellHarness disabled onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          email: "person@example.com",
        },
        expect.anything(),
      );
    });
  });
});
