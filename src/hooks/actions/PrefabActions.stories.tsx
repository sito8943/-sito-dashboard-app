import type { Meta, StoryObj } from "@storybook/react";

// components
import { Actions } from "components";

// hooks
import { useDeleteAction } from "./useDeleteAction";
import { useEditAction } from "./useEditAction";
import { useRestoreAction } from "./useRestoreAction";
import { useExportAction } from "./useExportAction";
import { useImportAction } from "./useImportAction";

// types
import type { BaseEntityDto } from "lib";

const activeRecord: BaseEntityDto = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const deletedRecord: BaseEntityDto = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
};

// --- Demo components ---

const EditActionDemo = ({ hidden = false }: { hidden?: boolean }) => {
  const { action } = useEditAction({
    onClick: (id) => alert(`Edit: ${id}`),
    hidden,
  });
  return <Actions actions={[action(activeRecord)]} showActionTexts />;
};

const DeleteActionDemo = ({
  hidden = false,
  disabled = false,
}: {
  hidden?: boolean;
  disabled?: boolean;
}) => {
  const { action } = useDeleteAction({
    onClick: (ids) => alert(`Delete: ${ids.join(", ")}`),
    hidden,
    disabled,
  });
  return (
    <div className="flex gap-4">
      <div>
        <p className="text-sm mb-1">Active record</p>
        <Actions actions={[action(activeRecord)]} showActionTexts />
      </div>
      <div>
        <p className="text-sm mb-1">Deleted record (hidden)</p>
        <Actions actions={[action(deletedRecord)]} showActionTexts />
      </div>
    </div>
  );
};

const RestoreActionDemo = ({ hidden = false }: { hidden?: boolean }) => {
  const { action } = useRestoreAction({
    onClick: (ids) => alert(`Restore: ${ids.join(", ")}`),
    hidden,
  });
  return (
    <div className="flex gap-4">
      <div>
        <p className="text-sm mb-1">Active record (hidden)</p>
        <Actions actions={[action(activeRecord)]} showActionTexts />
      </div>
      <div>
        <p className="text-sm mb-1">Deleted record</p>
        <Actions actions={[action(deletedRecord)]} showActionTexts />
      </div>
    </div>
  );
};

const ExportActionDemo = ({
  hidden = false,
  disabled = false,
  isLoading = false,
}: {
  hidden?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const { action } = useExportAction({
    onClick: () => alert("Export"),
    hidden,
    disabled,
    isLoading,
  });
  return <Actions actions={[action()]} showActionTexts />;
};

const ImportActionDemo = ({
  hidden = false,
  disabled = false,
  isLoading = false,
}: {
  hidden?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const { action } = useImportAction({
    onClick: () => alert("Import"),
    hidden,
    disabled,
    isLoading,
  });
  return <Actions actions={[action()]} showActionTexts />;
};

// --- Meta ---

const meta = {
  title: "Hooks/Actions/PrefabActions",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// --- Stories ---

export const Edit: Story = {
  render: () => <EditActionDemo />,
};

export const Delete: Story = {
  render: () => <DeleteActionDemo />,
};

export const Restore: Story = {
  render: () => <RestoreActionDemo />,
};

export const Export: Story = {
  render: () => <ExportActionDemo />,
};

export const Import: Story = {
  render: () => <ImportActionDemo />,
};
