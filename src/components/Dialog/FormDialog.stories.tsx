import type { Meta, StoryObj } from "@storybook/react";
import React, { BaseSyntheticEvent } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FormDialog } from "./FormDialog";
import { TextInput } from "@sito/dashboard";

type FormData = { description: string };

const meta = {
  title: "Components/Dialog/FormDialog",
  component: FormDialog,
  tags: ["autodocs"],
  args: {
    title: "Edit Description",
    open: true,
  },
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: true,
    handleClose: () => {},
    onSubmit: (
      data: FieldValues,
      event?: BaseSyntheticEvent<object, any, any> | undefined
    ) => {},
    handleSubmit:
      (onValid: SubmitHandler<FieldValues>) =>
      async (e?: BaseSyntheticEvent<object, any, any> | undefined) => {},
  },
  render: (args) => {
    const { register, handleSubmit } = useForm<FormData>({
      defaultValues: { description: "" },
    });
    return (
      <FormDialog
        {...args}
        handleSubmit={handleSubmit}
        onSubmit={(data) => alert(JSON.stringify(data))}
        handleClose={() => alert("Closed")}
      >
        <TextInput
          value={""}
          label="Description"
          placeholder="Type here"
          {...register("description")}
        />
      </FormDialog>
    );
  },
};
