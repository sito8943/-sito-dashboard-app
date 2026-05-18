import type { Meta, StoryObj } from "@storybook/react";
import { Button, TextInput } from "@sito/dashboard";
import { useForm } from "react-hook-form";
import { FormContainer } from "./FormContainer";
import { ParagraphInput } from "./ParagraphInput";

type FormValues = {
  name: string;
  description: string;
};

type FormContainerStoryProps = {
  isLoading?: boolean;
  buttonEnd?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  actionsClassName?: string;
};

const FormContainerStory = ({
  isLoading = false,
  buttonEnd = true,
  submitLabel,
  cancelLabel,
  submitDisabled,
  cancelDisabled,
  actionsClassName,
}: FormContainerStoryProps) => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  return (
    <FormContainer<FormValues>
      isLoading={isLoading}
      buttonEnd={buttonEnd}
      handleSubmit={handleSubmit}
      onSubmit={() => {}}
      reset={reset}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      submitDisabled={submitDisabled}
      cancelDisabled={cancelDisabled}
      actionsClassName={actionsClassName}
    >
      <div className="grid gap-3 max-w-xl">
        <TextInput
          value={""}
          label="Name"
          placeholder="Write a name"
          {...register("name")}
        />
        <ParagraphInput
          label="Description"
          placeholder="Write a description"
          {...register("description")}
        />
      </div>
    </FormContainer>
  );
};

const meta = {
  title: "Components/Form/FormContainer",
  component: FormContainerStory,
  tags: ["autodocs"],
  args: {
    isLoading: false,
    buttonEnd: true,
  },
} satisfies Meta<typeof FormContainerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ButtonsAlignedStart: Story = {
  args: {
    buttonEnd: false,
  },
};

export const CustomLabelsAndDisabled: Story = {
  args: {
    submitLabel: "Save changes",
    cancelLabel: "Back",
    submitDisabled: false,
    cancelDisabled: true,
  },
};

const CustomActionsStory = () => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  return (
    <FormContainer<FormValues>
      handleSubmit={handleSubmit}
      onSubmit={() => {}}
      reset={reset}
      renderActions={({ onCancel, buttonProps }) => (
        <div className="form-actions end max-sm:flex-col-reverse">
          <Button
            type={buttonProps.submit.type}
            disabled={buttonProps.submit.disabled}
            name={buttonProps.submit.name}
            aria-label={buttonProps.submit["aria-label"]}
          >
            Save
          </Button>
          <Button
            type={buttonProps.cancel.type}
            disabled={buttonProps.cancel.disabled}
            onClick={onCancel}
            name={buttonProps.cancel.name}
            aria-label={buttonProps.cancel["aria-label"]}
            variant="outlined"
          >
            Cancel
          </Button>
        </div>
      )}
    >
      <div className="grid gap-3 max-w-xl">
        <TextInput
          value={""}
          label="Name"
          placeholder="Write a name"
          {...register("name")}
        />
        <ParagraphInput
          label="Description"
          placeholder="Write a description"
          {...register("description")}
        />
      </div>
    </FormContainer>
  );
};

export const CustomActionsSlot: Story = {
  render: () => <CustomActionsStory />,
};
