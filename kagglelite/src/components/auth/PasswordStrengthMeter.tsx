'use client';
import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

export function PasswordStrengthMeter({ password }: { password: string }) {
  const reqs = useMemo(() => [
    { label: 'At least 10 characters', met: password.length >= 10 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ], [password]);

  const strength = reqs.filter(r => r.met).length;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map(level => (
          <div 
            key={level} 
            className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
              strength >= level 
                ? strength === 4 ? 'bg-green-500' : strength === 3 ? 'bg-yellow-400' : 'bg-red-400'
                : 'bg-gray-200'
            }`} 
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
        {reqs.map((req, i) => (
          <div key={i} className={`flex items-center gap-1 ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
            {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
}
