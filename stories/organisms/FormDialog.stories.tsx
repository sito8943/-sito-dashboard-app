import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextInput, type ButtonPropsType } from "@sito/dashboard";
import { FormDialog } from "@/components/organisms/Dialog/FormDialog";

type FormData = Record<string, string>;

type FormDialogStoryProps = {
  title?: string;
  isLoading?: boolean;
  buttonEnd?: boolean;
  mobileFullScreen?: boolean;
  extraActions?: ButtonPropsType[];
  /* extra text fields rendered to make the dialog taller than the viewport */
  extraFields?: number;
};

const FormDialogStory = ({
  title = "Edit Description",
  isLoading = false,
  buttonEnd = true,
  mobileFullScreen = false,
  extraActions = [],
  extraFields = 0,
}: FormDialogStoryProps) => {
  const [open, setOpen] = useState(true);
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { description: "" },
  });

  return (
    <div>
      <button
        className="button submit primary mb-4"
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </button>
      <FormDialog<FormData>
        title={title}
        open={open}
        handleSubmit={handleSubmit}
        onSubmit={() => setOpen(false)}
        handleClose={() => setOpen(false)}
        isLoading={isLoading}
        buttonEnd={buttonEnd}
        mobileFullScreen={mobileFullScreen}
        extraActions={extraActions}
      >
        <TextInput
          value={""}
          label="Description"
          placeholder="Type here"
          {...register("description")}
        />
        {Array.from({ length: extraFields }, (_, index) => (
          <TextInput
            key={index}
            value={""}
            label={`Field ${index + 1}`}
            placeholder="Type here"
            {...register(`field${index + 1}`)}
          />
        ))}
      </FormDialog>
    </div>
  );
};

const meta = {
  title: "Organisms/Dialog/FormDialog",
  component: FormDialogStory,
  tags: ["autodocs"],
  args: {
    title: "Edit Description",
    isLoading: false,
    buttonEnd: true,
    mobileFullScreen: false,
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

export const MobileFullScreen: Story = {
  args: {
    mobileFullScreen: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

export const TallForm: Story = {
  args: {
    title: "Form taller than the viewport",
    extraFields: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fields taller than the viewport scroll inside the dialog, so submit/cancel stay reachable.",
      },
    },
  },
};

export const MobileFullScreenTallForm: Story = {
  args: {
    title: "Full screen form",
    mobileFullScreen: true,
    extraFields: 20,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
