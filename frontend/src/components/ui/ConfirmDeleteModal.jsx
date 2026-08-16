import Modal from "./Modal";
import Button from "@/components/common/Button";
import Icon from "./Icons";

/**
 * Premium confirmation dialog for destructive actions (delete / remove).
 *
 * Glass-toned modal with a warning icon, a short description and Cancel /
 * Delete buttons. While `loading` is true the dialog cannot be dismissed and
 * the Delete button shows a spinner, so duplicate deletes are impossible.
 * Success / error feedback is handled by the caller's mutation toasts.
 */
const ConfirmDeleteModal = ({
  open = false,
  title = "Delete this item?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const close = () => {
    if (!loading) onCancel?.();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      tone="glass"
      size="sm"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={close} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (!loading) onConfirm?.();
            }}
            loading={loading}
            loadingLabel="Deleting…"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_35px_rgba(239,68,68,0.12)]">
          <Icon name="trash" size={26} />
        </span>

        {description && (
          <p className="max-w-sm text-sm leading-relaxed text-[#B8B2A5]">{description}</p>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;