import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { SuccessCelebrationBackdrop } from '@/components/molecules/SuccessCelebrationBackdrop';
import { createUser } from '@/services/userService';
import type { CreateUserInput, CreateUserResult, Gender } from '@/types';
import { cn, formatBirthDate, formatCitizenId, formatGender, parseVnDateInput } from '@/utils';
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
function BackIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </svg>);
}
function UserPlusIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M19 8v6"/>
      <path d="M22 11h-6"/>
    </svg>);
}
function SuccessCheckIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12l3 3 5-6"/>
    </svg>);
}
function CustomerSuccessView({ result, onBack, }: {
    result: CreateUserResult;
    onBack: () => void;
}) {
    const { user, cif } = result;
    return (<div className="relative overflow-hidden">
      <SuccessCelebrationBackdrop />
      <div className="relative text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <SuccessCheckIcon className="h-8 w-8"/>
        </div>

        <h2 className="text-xl font-bold text-green-700">Thêm Khách Hàng Thành Công!</h2>
        <p className="mt-1 text-sm text-muted">Khách hàng đã được thêm vào hệ thống</p>

        <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50 px-6 py-5">
          <p className="text-sm text-muted">Số CIF được cấp từ hệ thống</p>
          <p className="mt-1 text-3xl font-bold tracking-wide text-primary-700">{cif}</p>
        </div>

        <div className="mt-4 rounded-xl bg-table-stripe px-5 py-4 text-left">
          <p className="mb-3 text-sm font-semibold text-muted">Thông tin khách hàng</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">CCCD</dt>
              <dd className="font-medium text-foreground">{formatCitizenId(user.citizenId)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Họ và tên</dt>
              <dd className="font-medium text-foreground">{user.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Ngày sinh</dt>
              <dd className="font-medium text-foreground">{formatBirthDate(user.dateOfBirth)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Giới tính</dt>
              <dd className="font-medium text-foreground">{formatGender(user.gender)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Địa chỉ</dt>
              <dd className="max-w-[60%] text-right font-medium text-foreground">{user.address}</dd>
            </div>
          </dl>
        </div>

        <Button variant="primary" type="button" className="mt-6 w-full" onClick={onBack}>
          Quay lại danh sách
        </Button>
      </div>
    </div>);
}
export function AddCustomerModal({ open, onClose, onSuccess }: AddCustomerModalProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [createdResult, setCreatedResult] = useState<CreateUserResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const isValid = useMemo(() => {
        return (/^\d{12}$/.test(form.citizenId)
            && form.fullName.trim().length > 0
            && parseVnDateInput(form.dateOfBirth) !== null
            && form.address.trim().length > 0);
    }, [form]);
    function resetModal() {
        setStep('form');
        setForm(INITIAL_FORM);
        setCreatedResult(null);
        setError(null);
    }
    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        setError(null);
    }
    function handleClose() {
        if (saving) {
            return;
        }
        resetModal();
        onClose();
    }
    function handleBackToList() {
        resetModal();
        onSuccess();
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
            const result = await createUser(input);
            setCreatedResult(result);
            setStep('success');
        }
        catch (submitError) {
            setError(submitError instanceof Error
                ? submitError.message
                : 'Không thể lưu khách hàng. Vui lòng thử lại.');
        }
        finally {
            setSaving(false);
        }
    }
    if (!open) {
        return null;
    }
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="add-customer-title" className="dashboard-card relative w-full max-w-xl overflow-hidden p-6">
        {step === 'success' && createdResult ? (<CustomerSuccessView result={createdResult} onBack={handleBackToList}/>) : (<>
            <div className="mb-6 flex items-start gap-3">
              <button type="button" onClick={handleClose} className="mt-1 rounded-md p-1 text-muted transition-colors hover:bg-table-stripe hover:text-foreground" aria-label="Quay lại">
                <BackIcon className="h-5 w-5"/>
              </button>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-primary-600">
                  <UserPlusIcon className="h-6 w-6"/>
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
                <input type="text" inputMode="numeric" maxLength={12} value={form.citizenId} onChange={(event) => updateField('citizenId', event.target.value.replace(/\D/g, ''))} className="form-input" placeholder="Nhập số CCCD"/>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Họ và Tên <span className="text-red-600">*</span>
                </span>
                <input type="text" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} className="form-input" placeholder="Nhập họ và tên"/>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Ngày / Tháng / Năm Sinh <span className="text-red-600">*</span>
                </span>
                <input type="text" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} className="form-input" placeholder="dd/MM/yyyy"/>
                <span className="mt-1 block text-xs text-muted">Định dạng: dd/MM/yyyy</span>
              </label>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">
                  Giới Tính <span className="text-red-600">*</span>
                </legend>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input type="radio" name="gender" checked={form.gender === 'male'} onChange={() => updateField('gender', 'male')} className="h-4 w-4 accent-primary-600"/>
                    Nam
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input type="radio" name="gender" checked={form.gender === 'female'} onChange={() => updateField('gender', 'female')} className="h-4 w-4 accent-primary-600"/>
                    Nữ
                  </label>
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Địa Chỉ <span className="text-red-600">*</span>
                </span>
                <input type="text" value={form.address} onChange={(event) => updateField('address', event.target.value)} className="form-input" placeholder="Nhập địa chỉ"/>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={handleClose} disabled={saving}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={!isValid || saving} className={cn(!isValid && 'opacity-50')}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </form>
          </>)}
      </div>
    </div>);
}
