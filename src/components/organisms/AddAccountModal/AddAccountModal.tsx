import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { SuccessCelebrationBackdrop } from '@/components/molecules/SuccessCelebrationBackdrop';
import { createBankAccount, verifyCif } from '@/services/accountService';
import type { BankAccountType, CifVerificationResult, EnrichedBankAccount } from '@/types';
import { formatAccountNumberDisplay } from '@/utils/accountRegistry';
import { formatPhoneDisplay } from '@/utils/accountNumber';
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
}

const EMPTY_FORM: FormState = {
  cif: '',
  accountType: '',
};

const ACCOUNT_TYPE_CREATE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: 'payment', label: 'Thanh toán' },
  { value: 'savings', label: 'Tiết kiệm' },
  { value: 'debit', label: 'Ghi nợ' },
  { value: 'overdraft', label: 'Thấu chi' },
];

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function SuccessCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function AccountSuccessView({
  account,
  onBack,
}: {
  account: EnrichedBankAccount;
  onBack: () => void;
}) {
  const typeLabel = ACCOUNT_TYPE_CREATE_OPTIONS.find(
    (option) => option.value === account.accountType,
  )?.label ?? account.accountTypeLabel;

  return (
    <div className="relative overflow-hidden">
      <SuccessCelebrationBackdrop />
      <div className="relative text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <SuccessCheckIcon className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-bold text-green-700">Tạo Tài Khoản Thành Công!</h2>
        <p className="mt-1 text-sm text-muted">Tài khoản đã được khởi tạo trong hệ thống</p>

        <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50 px-6 py-5">
          <p className="text-sm text-muted">Số tài khoản</p>
          <p className="mt-1 text-3xl font-bold tracking-wide text-primary-700">
            {formatAccountNumberDisplay(account.accountNumber)}
          </p>
          <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-700 shadow-sm">
            {typeLabel}
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-table-stripe px-5 py-4 text-left">
          <p className="mb-3 text-sm font-semibold text-muted">Thông tin tài khoản</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Số CIF</dt>
              <dd className="font-medium text-foreground">{account.cif}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Chủ tài khoản</dt>
              <dd className="font-medium text-foreground">{account.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Loại tài khoản</dt>
              <dd className="font-medium text-foreground">{typeLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Trạng thái</dt>
              <dd className="font-medium capitalize text-foreground">
                {account.status === 'active' ? 'Active' : 'Inactive'}
              </dd>
            </div>
          </dl>
        </div>

        <Button variant="primary" type="button" className="mt-6 w-full" onClick={onBack}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}

function AddAccountModalContent({
  defaultCif,
  onClose,
  onSuccess,
}: AddAccountModalContentProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, cif: defaultCif });
  const [verifiedCif, setVerifiedCif] = useState<CifVerificationResult | null>(null);
  const [createdAccount, setCreatedAccount] = useState<EnrichedBankAccount | null>(null);
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
  const isValid = Boolean(verifiedCif && form.accountType);

  const phonePreview = useMemo(() => {
    if (!verifiedCif?.phone.trim()) {
      return '—';
    }

    return formatPhoneDisplay(verifiedCif.phone);
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

  function handleBackToList() {
    onSuccess();
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
      const account = await createBankAccount({
        cif: verifiedCif.cif,
        accountType: form.accountType,
      });
      setCreatedAccount(account);
      setStep('success');
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

  if (step === 'success' && createdAccount) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-account-success-title"
          className="dashboard-card relative w-full max-w-xl overflow-hidden p-6"
        >
          <h2 id="add-account-success-title" className="sr-only">
            Tạo tài khoản thành công
          </h2>
          <AccountSuccessView account={createdAccount} onBack={handleBackToList} />
        </div>
      </div>
    );
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
                onChange={(event) => updateField('cif', event.target.value.replace(/\D/g, ''))}
                onBlur={() => {
                  if (!verifiedCif && canCheckCif) {
                    void handleCheckCif();
                  }
                }}
                className="form-input flex-1"
                placeholder="Nhập số CIF"
                inputMode="numeric"
              />
              {verifiedCif ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white">
                  <CheckIcon className="h-4 w-4" />
                  Hợp lệ
                </span>
              ) : (
                <Button
                  variant="secondary"
                  type="button"
                  className="shrink-0"
                  disabled={!canCheckCif || checkingCif}
                  onClick={handleCheckCif}
                >
                  {checkingCif ? 'Đang kiểm tra...' : 'Kiểm tra'}
                </Button>
              )}
            </div>
          </div>

          {verifiedCif && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs text-muted">Thông tin khách hàng</p>
              <p className="mt-1 text-base font-bold text-primary-700">{verifiedCif.fullName}</p>
              <p className="mt-0.5 text-sm text-foreground">
                SĐT: {verifiedCif.phone.trim() || '—'}
              </p>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Loại Tài Khoản <span className="text-red-600">*</span>
            </span>
            <Select
              value={form.accountType}
              onChange={(value) => updateField('accountType', value as BankAccountType | '')}
              options={[
                { value: '', label: 'Chọn loại tài khoản' },
                ...ACCOUNT_TYPE_CREATE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              disabled={!verifiedCif}
              aria-label="Loại tài khoản"
            />
          </label>

          {verifiedCif && (
            <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm">
              <p className="font-medium text-primary-700">Số tài khoản sẽ được hệ thống sinh tự động</p>
              <p className="mt-1 text-muted">
                Theo số điện thoại đăng ký: {phonePreview}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={saving}>
              Hủy
            </Button>
            <Button
              variant="green"
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
