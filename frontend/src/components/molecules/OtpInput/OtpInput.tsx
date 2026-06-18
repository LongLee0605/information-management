import { useRef } from 'react';
import { cn } from '@/utils';
interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}
export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const digits = value.padEnd(length, ' ').slice(0, length).split('');
    function updateDigit(index: number, digit: string) {
        const sanitized = digit.replace(/\D/g, '').slice(-1);
        const next = digits.map((char, i) => (i === index ? sanitized : char.trim())).join('');
        onChange(next.slice(0, length));
        if (sanitized && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }
    function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }
    function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    }
    return (<div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (<input key={index} ref={(element) => {
                inputRefs.current[index] = element;
            }} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digits[index]?.trim() ?? ''} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} aria-label={`OTP số ${index + 1}`} className={cn('h-12 w-10 rounded-lg border-2 border-primary-500 bg-white text-center text-lg font-semibold text-foreground outline-none sm:h-14 sm:w-12')}/>))}
    </div>);
}
