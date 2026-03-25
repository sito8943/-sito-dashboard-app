import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextInput, type ButtonPropsType } from "@sito/dashboard";
import { FormDialog } from "./FormDialog";

type FormData = { description: string };

type FormDialogStoryProps = {
  title?: string;
  isLoading?: boolean;
  buttonEnd?: boolean;
  extraActions?: ButtonPropsType[];
};

const FormDialogStory = ({
  title = "Edit Description",
  isLoading = false,
  buttonEnd = true,
  extraActions = [],
}: FormDialogStoryProps) => {
  const [open, setOpen] = useState(true);
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { description: "" },
  });

  return (
    <FormDialog<FormData>
      title={title}
      open={open}
      handleSubmit={handleSubmit}
      onSubmit={() => setOpen(false)}
      handleClose={() => setOpen(false)}
      isLoading={isLoading}
      buttonEnd={buttonEnd}
      extraActions={extraActions}
    >
      <TextInput
        value={""}
        label="Description"
        placeholder="Type here"
        {...register("description")}
      />
    </FormDialog>
  );
};

const meta = {
  title: "Components/Dialog/FormDialog",
  component: FormDialogStory,
  tags: ["autodocs"],
  args: {
    title: "Edit Description",
    isLoading: false,
    buttonEnd: true,
  },
} satisfies Meta<typeof FormDialogStory>;

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

export const WithExtraActions: Story = {
  args: {
    extraActions: [
      {
        id: "save-draft-action",
        type: "button",
        variant: "outlined",
        color: "secondary",
        children: "Save draft",
        onClick: () => {},
      },
      {
        id: "discard-action",
        type: "button",
        variant: "text",
        children: "Discard",
        onClick: () => {},
      },
    ],
  },
};
