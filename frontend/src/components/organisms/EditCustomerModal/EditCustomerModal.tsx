import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { updateUser } from '@/services/userService';
import type { UpdateUserInput, User } from '@/types';
import { cn, formatVndInput, parseVndInput } from '@/utils';

const MIN_BIRTH_DATE = '1900-01-01';

function getMaxBirthDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
}

function isIsoBirthDateValid(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    if (value < MIN_BIRTH_DATE || value > getMaxBirthDate()) {
        return false;
    }
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year
        && parsed.getMonth() === month - 1
        && parsed.getDate() === day;
}

function userToForm(user: User): UpdateUserInput {
    return {
        citizenId: user.citizenId,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phone: user.phone === '—' ? '' : user.phone,
        email: user.email === '—' ? '' : user.email,
        address: user.address,
        workplace: user.workplace === '—' ? '' : user.workplace,
        maritalStatus: user.maritalStatus === '—' ? '' : user.maritalStatus,
        education: user.education === '—' ? '' : user.education,
        monthlyIncomeAvg: user.monthlyIncomeAvg,
    };
}

interface EditCustomerModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditCustomerModal({ open, user, onClose, onSuccess }: EditCustomerModalProps) {
    const maxBirthDate = useMemo(() => getMaxBirthDate(), []);
    const [form, setForm] = useState<UpdateUserInput | null>(null);
    const [incomeInput, setIncomeInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !user) {
            return;
        }
        const nextForm = userToForm(user);
        setForm(nextForm);
        setIncomeInput(nextForm.monthlyIncomeAvg > 0 ? formatVndInput(String(nextForm.monthlyIncomeAvg)) : '');
        setError(null);
    }, [open, user]);

    const isValid = useMemo(() => {
        if (!form) {
            return false;
        }
        return (/^\d{12}$/.test(form.citizenId)
            && form.fullName.trim().length > 0
            && isIsoBirthDateValid(form.dateOfBirth)
            && form.address.trim().length > 0);
    }, [form]);

    function updateField<K extends keyof UpdateUserInput>(key: K, value: UpdateUserInput[K]) {
        setForm((current: UpdateUserInput | null) => (current ? { ...current, [key]: value } : current));
        setError(null);
    }

    function handleClose() {
        if (saving) {
            return;
        }
        onClose();
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!user || !form || !isValid || saving) {
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await updateUser(user.id, {
                ...form,
                monthlyIncomeAvg: parseVndInput(incomeInput) ?? 0,
            });
            onSuccess();
            onClose();
        }
        catch (submitError) {
            setError(submitError instanceof Error
                ? submitError.message
                : 'Không thể cập nhật khách hàng. Vui lòng thử lại.');
        }
        finally {
            setSaving(false);
        }
    }

    if (!open || !user || !form) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-customer-title"
                className="dashboard-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
            >
                <div className="mb-6">
                    <h2 id="edit-customer-title" className="text-xl font-bold text-primary-700">
                        Cập Nhật Thông Tin Khách Hàng
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Chỉnh sửa thông tin của {user.fullName}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
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
                        />
                    </label>

                    <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">
                            Họ và Tên <span className="text-red-600">*</span>
                        </span>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(event) => updateField('fullName', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">
                            Ngày sinh <span className="text-red-600">*</span>
                        </span>
                        <input
                            type="date"
                            value={form.dateOfBirth}
                            min={MIN_BIRTH_DATE}
                            max={maxBirthDate}
                            onChange={(event) => updateField('dateOfBirth', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-foreground">
                            Giới Tính <span className="text-red-600">*</span>
                        </legend>
                        <div className="flex items-center gap-6 pt-2">
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="radio"
                                    name="edit-gender"
                                    checked={form.gender === 'male'}
                                    onChange={() => updateField('gender', 'male')}
                                    className="h-4 w-4 accent-primary-600"
                                />
                                Nam
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="radio"
                                    name="edit-gender"
                                    checked={form.gender === 'female'}
                                    onChange={() => updateField('gender', 'female')}
                                    className="h-4 w-4 accent-primary-600"
                                />
                                Nữ
                            </label>
                        </div>
                    </fieldset>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Số điện thoại</span>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(event) => updateField('phone', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">
                            Địa Chỉ <span className="text-red-600">*</span>
                        </span>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(event) => updateField('address', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Nơi làm việc</span>
                        <input
                            type="text"
                            value={form.workplace}
                            onChange={(event) => updateField('workplace', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Tình trạng hôn nhân</span>
                        <input
                            type="text"
                            value={form.maritalStatus}
                            onChange={(event) => updateField('maritalStatus', event.target.value)}
                            className="form-input"
                            placeholder="Ví dụ: Độc thân, Đã kết hôn"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Học vấn</span>
                        <input
                            type="text"
                            value={form.education}
                            onChange={(event) => updateField('education', event.target.value)}
                            className="form-input"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-foreground">Thu nhập TB/tháng (VNĐ)</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={incomeInput}
                            onChange={(event) => setIncomeInput(formatVndInput(event.target.value))}
                            className="form-input"
                            placeholder="Nhập thu nhập trung bình"
                        />
                    </label>

                    {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                        <Button variant="secondary" type="button" onClick={handleClose} disabled={saving}>
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!isValid || saving}
                            className={cn(!isValid && 'opacity-50')}
                        >
                            {saving ? 'Đang lưu...' : 'Cập nhật'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
