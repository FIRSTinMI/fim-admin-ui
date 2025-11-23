import { useState } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type DeleteConfirmProps = {
  streamName?: string;
  title?: string;
  confirmText?: string;
  action?: 'delete' | 'stop';
  onConfirm?: () => Promise<void> | void;
};

const DeleteConfirmModal = NiceModal.create(
  ({
    streamName,
    title = "Delete Stream",
    confirmText = "Delete",
    action = "delete",
    onConfirm,
  }: DeleteConfirmProps) => {
    const modal = useModal();
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
      modal.resolve(false);
      modal.hide();
    };

    const handleConfirm = async () => {
      try {
        setLoading(true);
        if (onConfirm) await onConfirm();
        modal.resolve(true);
        modal.hide();
      } catch (err) {
        modal.resolve(false);
        modal.hide();
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog
        open={modal.visible}
        onClose={handleCancel}
        aria-labelledby="delete-stream-dialog"
      >
        <DialogTitle id="delete-stream-dialog">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently {action} the livestream
            {streamName ? ` "${streamName}"` : ""}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleConfirm}
            loading={loading}
            autoFocus
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default DeleteConfirmModal;
