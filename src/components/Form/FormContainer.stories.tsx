import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { TextInput } from "@sito/dashboard";
import { FormContainer } from "./FormContainer";
import { ParagraphInput } from "./ParagraphInput";

type FormValues = {
  name: string;
  description: string;
};

type FormContainerStoryProps = {
  isLoading?: boolean;
  buttonEnd?: boolean;
};

const FormContainerStory = ({
  isLoading = false,
  buttonEnd = true,
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
