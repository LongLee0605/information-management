import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { CUSTOMER_BANK_OPTIONS } from '@/constants/banks';
import { createBankAccount, verifyCif } from '@/services/accountService';
import type { BankAccountType, CifVerificationResult } from '@/types';
import { ACCOUNT_TYPE_FILTER_OPTIONS } from '@/utils/accountFilter';
import { cn } from '@/utils';

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCif?: string;
}

interface AddAccountModalContentProps {
  defaultCif: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  cif: string;
  accountType: BankAccountType | '';
  bankId: string;
}

const EMPTY_FORM: FormState = {
  cif: '',
  accountType: '',
  bankId: '',
};

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function AddAccountModalContent({
  defaultCif,
  onClose,
  onSuccess,
}: AddAccountModalContentProps) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, cif: defaultCif });
  const [verifiedCif, setVerifiedCif] = useState<CifVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingCif, setCheckingCif] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!defaultCif.trim()) {
      return;
    }

    let cancelled = false;

    async function autoVerifyCif() {
      setCheckingCif(true);
      try {
        const result = await verifyCif(defaultCif);
        if (!cancelled) {
          setVerifiedCif(result);
          setForm((current) => ({ ...current, cif: result.cif }));
        }
      } catch {
        if (!cancelled) {
          setVerifiedCif(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingCif(false);
        }
      }
    }

    void autoVerifyCif();

    return () => {
      cancelled = true;
    };
  }, [defaultCif]);

  const canCheckCif = form.cif.trim().length > 0;
  const isValid = Boolean(
    verifiedCif
    && form.accountType
    && form.bankId,
  );

  const cifHint = useMemo(() => {
    if (!verifiedCif) {
      return null;
    }

    return `Khách hàng: ${verifiedCif.fullName}`;
  }, [verifiedCif]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'cif') {
      setVerifiedCif(null);
    }
    setError(null);
  }

  function handleClose() {
    if (checkingCif || saving) {
      return;
    }

    onClose();
  }

  async function handleCheckCif() {
    if (!canCheckCif || checkingCif) {
      return;
    }

    setCheckingCif(true);
    setError(null);

    try {
      const result = await verifyCif(form.cif);
      setVerifiedCif(result);
      setForm((current) => ({ ...current, cif: result.cif }));
    } catch (checkError) {
      setVerifiedCif(null);
      setError(
        checkError instanceof Error
          ? checkError.message
          : 'Không thể kiểm tra CIF. Vui lòng thử lại.',
      );
    } finally {
      setCheckingCif(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || saving || !verifiedCif || !form.accountType) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createBankAccount({
        cif: verifiedCif.cif,
        accountType: form.accountType,
        bankId: form.bankId,
      });
      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể mở tài khoản. Vui lòng thử lại.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
        className="dashboard-card w-full max-w-xl p-6"
      >
        <div className="mb-6 flex items-start gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="mt-1 rounded-md p-1 text-muted transition-colors hover:bg-table-stripe hover:text-foreground"
            aria-label="Quay lại"
          >
            <BackIcon className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary-600">
              <CardIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 id="add-account-title" className="text-xl font-bold text-primary-700">
                Mở Tài Khoản Mới
              </h2>
              <p className="mt-1 text-sm text-muted">Nhập thông tin để tạo tài khoản</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Số CIF <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.cif}
                onChange={(event) => updateField('cif', event.target.value.toUpperCase())}
                className="form-input flex-1 uppercase"
                placeholder="Nhập số CIF"
              />
              <Button
                variant="secondary"
                type="button"
                className="shrink-0"
                disabled={!canCheckCif || checkingCif}
                onClick={handleCheckCif}
              >
                {checkingCif ? 'Đang kiểm tra...' : 'Kiểm Tra CIF'}
              </Button>
            </div>
            {cifHint && (
              <p className="mt-1.5 text-xs font-medium text-green-700">{cifHint}</p>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Loại Tài Khoản <span className="text-red-600">*</span>
            </span>
            <Select
              value={form.accountType}
              onChange={(value) => updateField('accountType', value as BankAccountType | '')}
              options={[
                { value: '', label: 'Chọn loại tài khoản' },
                ...ACCOUNT_TYPE_FILTER_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              disabled={!verifiedCif}
              aria-label="Loại tài khoản"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Ngân Hàng <span className="text-red-600">*</span>
            </span>
            <Select
              value={form.bankId}
              onChange={(value) => updateField('bankId', value)}
              options={[
                { value: '', label: 'Chọn ngân hàng' },
                ...CUSTOMER_BANK_OPTIONS.map((bank) => ({
                  value: bank.id,
                  label: bank.name,
                })),
              ]}
              disabled={!verifiedCif}
              aria-label="Ngân hàng"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={saving}>
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!isValid || saving}
              className={cn(!isValid && 'opacity-50')}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddAccountModal({
  open,
  onClose,
  onSuccess,
  defaultCif = '',
}: AddAccountModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AddAccountModalContent
      key={defaultCif || 'manual'}
      defaultCif={defaultCif}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
