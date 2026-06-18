import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { ConfettiCelebration } from '@/components/molecules/ConfettiCelebration';
import { OtpInput } from '@/components/molecules/OtpInput';
import { SourceAccountSelect } from '@/components/molecules/SourceAccountSelect';
import {
  RECIPIENT_BANKS,
  TRANSFER_STEPS,
  type RecipientBankId,
} from '@/constants/transfer';
import { ROUTES, userTransactionsPath } from '@/constants';
import { createTransferTransaction } from '@/services';
import {
  fetchSourceAccounts,
  generateTransferId,
  lookupRecipientByAccount,
  type SourceAccount,
  type TransferDraft,
} from '@/utils/transferAccounts';
import { cn, formatCurrency, formatDate, formatVndInput, parseVndInput } from '@/utils';
import { subscribeDataChange } from '@/utils/dataChangeBus';
import type { TransactionWithUser } from '@/types';

interface TransferFlowProps {
  defaultUserId?: string;
  returnPath: string;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground-soft outline-none hover:bg-table-stripe"
      aria-label="Quay lại"
    >
      ←
    </button>
  );
}

const inputClassName = 'form-input';

export function TransferFlow({ defaultUserId, returnPath }: TransferFlowProps) {
  const navigate = useNavigate();
  const [sourceAccounts, setSourceAccounts] = useState<SourceAccount[]>([]);
  const [sourceUserId, setSourceUserId] = useState(defaultUserId ?? '');
  const [recipientInfo, setRecipientInfo] = useState<{
    userId: string;
    fullName: string;
    accountNumber: string;
  } | null>(null);
  const [step, setStep] = useState<number>(TRANSFER_STEPS.FORM);
  const [bankId, setBankId] = useState<RecipientBankId | ''>('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [content, setContent] = useState('');
  const [otp, setOtp] = useState('');
  const [draft, setDraft] = useState<TransferDraft | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<TransactionWithUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchSourceAccounts().then((accounts) => {
      if (cancelled) return;
      setSourceAccounts(accounts);
      if (!accounts.length) return;

      const preferred =
        accounts.find((account) => account.userId === defaultUserId) ?? accounts[0];
      setSourceUserId((current) =>
        accounts.some((account) => account.userId === current) ? current : preferred.userId,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [defaultUserId]);

  useEffect(() => {
    return subscribeDataChange('accounts', () => {
      fetchSourceAccounts().then(setSourceAccounts);
    });
  }, []);

  useEffect(() => {
    const normalized = recipientAccount.replace(/\D/g, '');
    if (!normalized) {
      setRecipientInfo(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      lookupRecipientByAccount(recipientAccount).then((info) => {
        if (!cancelled) setRecipientInfo(info);
      });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [recipientAccount]);

  const selectedAccount = sourceAccounts.find((account) => account.userId === sourceUserId);
  const selectedBank = RECIPIENT_BANKS.find((bank) => bank.id === bankId);
  const recipientName = recipientInfo?.fullName ?? '';
  const parsedAmount = parseVndInput(amount);

  const stepTitle =
    step === TRANSFER_STEPS.FORM
      ? 'Chuyển Tiền'
      : step === TRANSFER_STEPS.OTP
        ? 'Xác Thực OTP'
        : 'Chuyển Tiền Thành Công!';

  const stepSubtitle =
    step === TRANSFER_STEPS.FORM
      ? 'Bước 1/3 — Thông tin chuyển tiền'
      : step === TRANSFER_STEPS.OTP
        ? 'Bước 2/3 — Nhập mã xác thực'
        : 'Giao dịch của bạn đã được xử lý thành công';

  function handleBack() {
    if (step === TRANSFER_STEPS.OTP) {
      setStep(TRANSFER_STEPS.FORM);
      return;
    }
    navigate(returnPath);
  }

  function handleNextStep() {
    if (!selectedAccount) {
      setFormError('Vui lòng chọn tài khoản chuyển.');
      return;
    }

    if (!bankId) {
      setFormError('Vui lòng chọn ngân hàng nhận.');
      return;
    }

    if (!recipientAccount.trim()) {
      setFormError('Vui lòng nhập số tài khoản nhận.');
      return;
    }

    if (!recipientName) {
      setFormError('Số tài khoản nhận không hợp lệ hoặc chưa được xác minh.');
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setFormError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    if (parsedAmount > selectedAccount.balance) {
      setFormError('Số dư khả dụng không đủ để thực hiện giao dịch.');
      return;
    }

    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung chuyển tiền.');
      return;
    }

    setFormError(null);
    setStep(TRANSFER_STEPS.OTP);
  }

  async function handleConfirmOtp() {
    if (!/^\d{6}$/.test(otp) || !selectedAccount || !selectedBank) {
      return;
    }

    const recipient = await lookupRecipientByAccount(recipientAccount);
    if (!recipient) {
      setFormError('Số tài khoản nhận không hợp lệ hoặc chưa được xác minh.');
      return;
    }

    if (recipient.userId === selectedAccount.userId) {
      setFormError('Không thể chuyển đến tài khoản của cùng khách hàng.');
      return;
    }

    const transferDraft: TransferDraft = {
      sourceUserId: selectedAccount.userId,
      sourceAccountNumber: selectedAccount.accountNumber,
      sourceUserName: selectedAccount.fullName,
      availableBalance: selectedAccount.balance,
      bankId: selectedBank.id,
      bankName: selectedBank.shortName,
      bankFullName: selectedBank.fullName,
      recipientAccount: recipient.accountNumber,
      recipientUserId: recipient.userId,
      recipientName: recipient.fullName,
      amount: parsedAmount,
      content: content.trim(),
      transactionId: generateTransferId(),
    };

    setSubmitting(true);
    setFormError(null);

    try {
      const transaction = await createTransferTransaction(transferDraft);
      setDraft(transferDraft);
      setCreatedTransaction(transaction);
      setStep(TRANSFER_STEPS.SUCCESS);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Không thể tạo giao dịch. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start gap-3">
        {step !== TRANSFER_STEPS.SUCCESS && <BackButton onClick={handleBack} />}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{stepTitle}</h1>
          <p className="mt-1 text-sm text-muted">{stepSubtitle}</p>
        </div>
      </div>

      {step === TRANSFER_STEPS.FORM && selectedAccount && (
        <div className="dashboard-card space-y-6 p-6 sm:p-8">
          <SourceAccountSelect
            accounts={sourceAccounts}
            value={sourceUserId}
            onChange={setSourceUserId}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Ngân hàng nhận</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {RECIPIENT_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setBankId(bank.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors',
                    bankId === bank.id ? bank.accentClass : 'border-border bg-white hover:bg-table-stripe',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      bank.logoClass,
                    )}
                  >
                    {bank.logoText}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{bank.shortName}</span>
                    <span className="mt-0.5 block text-xs text-muted">{bank.fullName}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Thông tin tài khoản nhận</p>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Số tài khoản nhận</span>
              <input
                type="text"
                inputMode="numeric"
                value={recipientAccount}
                placeholder="Nhập số tài khoản người nhận"
                onChange={(event) => setRecipientAccount(event.target.value.replace(/\D/g, ''))}
                className={inputClassName}
              />
            </label>

            {recipientAccount.trim() && recipientName && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <span aria-hidden="true">✓</span>
                {recipientName}
              </div>
            )}

            {recipientAccount.trim() && !recipientName && (
              <p className="text-sm text-amber-600">
                Không tìm thấy tài khoản. Nhập đủ 10–11 số, ví dụ: 09876543210 hoặc 9876543210
              </p>
            )}

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Số tiền (VNĐ)</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                placeholder="Nhập số tiền chuyển"
                onChange={(event) => setAmount(formatVndInput(event.target.value))}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Nội dung chuyển tiền</span>
              <input
                type="text"
                value={content}
                placeholder="Nhập nội dung chuyển khoản"
                onChange={(event) => setContent(event.target.value)}
                className={inputClassName}
              />
            </label>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
          )}

          <Button variant="primary" type="button" className="w-full py-3" onClick={handleNextStep}>
            Tiếp Theo →
          </Button>
        </div>
      )}

      {step === TRANSFER_STEPS.OTP && selectedBank && (
        <div className="dashboard-card p-6 sm:p-8">
          <div className="rounded-xl bg-blue-50 px-5 py-4">
            <p className="text-sm text-muted">Chuyển đến</p>
            <p className="mt-1 text-lg font-bold text-foreground">{recipientName}</p>
            <p className="text-sm text-muted">
              {selectedBank.shortName} — {recipientAccount}
            </p>
            <p className="mt-2 text-xl font-bold text-primary-600">
              {formatCurrency(parsedAmount)}
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-semibold text-foreground">Nhập mã OTP gồm 6 chữ số</p>
            <p className="mt-1 text-xs text-muted">
              Mã OTP đã được gửi đến số điện thoại đăng ký của bạn
            </p>
            <div className="mt-6">
              <OtpInput value={otp} onChange={setOtp} />
            </div>
          </div>

          {formError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
          )}

          <Button
            variant="primary"
            type="button"
            className="mt-8 w-full py-3"
            disabled={otp.length !== 6 || submitting}
            onClick={() => void handleConfirmOtp()}
          >
            {submitting ? 'Đang xử lý...' : 'Xác Nhận'}
          </Button>
        </div>
      )}

      {step === TRANSFER_STEPS.SUCCESS && draft && createdTransaction && (
        <>
          <ConfettiCelebration active />
          <div className="relative dashboard-card overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              {Array.from({ length: 24 }).map((_, index) => (
                <span
                  key={index}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    top: `${(index * 17) % 100}%`,
                    left: `${(index * 29) % 100}%`,
                    backgroundColor: ['#3b82f6', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5],
                  }}
                />
              ))}
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
              <h2 className="mt-4 text-2xl font-bold text-green-600">Chuyển Tiền Thành Công!</h2>
              <p className="mt-2 text-sm text-muted">
                Giao dịch đã được ghi nhận ngày {formatDate(createdTransaction.date)}
              </p>
              <p className="text-sm text-muted">
                Giao dịch đã được thêm vào danh sách của {draft.sourceUserName}
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-xs text-muted">Mã giao dịch</p>
                <p className="text-lg font-bold text-primary-600">{createdTransaction.id}</p>
              </div>

              <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
                {[
                  ['Ngân hàng nhận', draft.bankFullName],
                  ['Tài khoản nhận', draft.recipientAccount],
                  ['Tên người nhận', draft.recipientName],
                  ['Số tiền', formatCurrency(draft.amount)],
                  ['Số dư còn lại', formatCurrency(Math.max(0, draft.availableBalance - draft.amount))],
                  ['Nội dung', draft.content],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-border py-2">
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <Link
                to={
                  defaultUserId
                    ? userTransactionsPath(draft.sourceUserId)
                    : ROUTES.TRANSACTIONS
                }
                className="mt-8 block"
              >
                <Button variant="primary" type="button" className="w-full py-3">
                  Về Trang Quản Lý Giao Dịch
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
