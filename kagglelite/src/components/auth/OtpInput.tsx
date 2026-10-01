'use client';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newValue = value.split('');
    newValue[index] = val.charAt(val.length - 1);
    onChange(newValue.join(''));

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      if (newValue[index]) {
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={2}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue outline-none transition-all bg-gray-50 focus:bg-white"
        />
      ))}
    </div>
  );
}
