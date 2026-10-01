'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { OtpInput } from '@/components/auth/OtpInput';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function TwoFactorLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = searchParams.get('userId');
  const nextUrl = searchParams.get('next') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !userId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Signed in successfully!');
        router.push(nextUrl);
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid 2FA token');
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error('Server error');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Two-Factor Authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      <form onSubmit={handleSubmit} className="space-y-8 flex flex-col items-center">
        <OtpInput value={otp} onChange={setOtp} length={6} />
        
        <button 
          type="submit" 
          disabled={otp.length < 6 || isSubmitting} 
          className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Verify Code
        </button>
      </form>
    </AuthLayout>
  );
}


export default function TwoFactorLoginPage() {
  return <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-kaggle-blue w-8 h-8" /></div>}><TwoFactorLogin /></Suspense>;
}
