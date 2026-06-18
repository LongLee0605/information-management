import { Button } from '@/components/atoms/Button';
interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
export function ConfirmDialog({ open, title, message, confirmLabel = 'Xóa', cancelLabel = 'Hủy', loading = false, onConfirm, onCancel, }: ConfirmDialogProps) {
    if (!open) {
        return null;
    }
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="dashboard-card w-full max-w-md p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm text-foreground-soft">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>);
}
