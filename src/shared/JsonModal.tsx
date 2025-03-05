import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { JsonEditor } from 'json-edit-react'

const JsonModal = NiceModal.create(({ jsonData, title }: { jsonData: object, title: string }) => {
    const modal = useModal();

    return (
        <Dialog open={modal.visible} onClose={() => modal.hide()}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <JsonEditor data={jsonData} restrictEdit />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => modal.hide()}>Close</Button>
            </DialogActions>
        </Dialog>
    );
});

export default JsonModal;