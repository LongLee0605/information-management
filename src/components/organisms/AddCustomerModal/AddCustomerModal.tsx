import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { createUser } from '@/services/userService';
import type { CreateUserInput, Gender } from '@/types';
import { cn, parseVnDateInput } from '@/utils';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
}

const INITIAL_FORM: FormState = {
  citizenId: '',
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  address: '',
};

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

export function AddCustomerModal({ open, onClose, onSuccess }: AddCustomerModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isValid = useMemo(() => {
    return (
      /^\d{12}$/.test(form.citizenId)
      && form.fullName.trim().length > 0
      && parseVnDateInput(form.dateOfBirth) !== null
      && form.address.trim().length > 0
    );
  }, [form]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleClose() {
    if (saving) {
      return;
    }
    setForm(INITIAL_FORM);
    setError(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || saving) {
      return;
    }

    const isoDate = parseVnDateInput(form.dateOfBirth);
    if (!isoDate) {
      setError('Ngày sinh không hợp lệ. Định dạng: dd/MM/yyyy');
      return;
    }

    const input: CreateUserInput = {
      citizenId: form.citizenId,
      fullName: form.fullName.trim(),
      dateOfBirth: isoDate,
      gender: form.gender,
      address: form.address.trim(),
    };

    setSaving(true);
    setError(null);

    try {
      await createUser(input);
      setForm(INITIAL_FORM);
      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể lưu khách hàng. Vui lòng thử lại.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-customer-title"
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
              <UserPlusIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 id="add-customer-title" className="text-xl font-bold text-primary-700">
                Thêm Khách Hàng Mới
              </h2>
              <p className="mt-1 text-sm text-muted">Nhập thông tin khách hàng</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Số Căn Cước Công Dân <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={form.citizenId}
              onChange={(event) => updateField('citizenId', event.target.value.replace(/\D/g, ''))}
              className="form-input"
              placeholder="Nhập số CCCD"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Họ và Tên <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              className="form-input"
              placeholder="Nhập họ và tên"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Ngày / Tháng / Năm Sinh <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={form.dateOfBirth}
              onChange={(event) => updateField('dateOfBirth', event.target.value)}
              className="form-input"
              placeholder="dd/MM/yyyy"
            />
            <span className="mt-1 block text-xs text-muted">Định dạng: dd/MM/yyyy</span>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Giới Tính <span className="text-red-600">*</span>
            </legend>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === 'male'}
                  onChange={() => updateField('gender', 'male')}
                  className="h-4 w-4 accent-primary-600"
                />
                Nam
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === 'female'}
                  onChange={() => updateField('gender', 'female')}
                  className="h-4 w-4 accent-primary-600"
                />
                Nữ
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Địa Chỉ <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              className="form-input"
              placeholder="Nhập địa chỉ"
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
