'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).then(res => {
      if (res.ok) {
        setStatus('success');
        toast.success('Email verified successfully!');
      } else {
        setStatus('error');
        toast.error('Invalid or expired verification link.');
      }
    }).catch(() => {
      setStatus('error');
      toast.error('Network error. Please try again.');
    });
  }, [token]);

  return (
    <AuthLayout title="Email Verification" subtitle="We're verifying your email address.">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-kaggle-blue animate-spin mb-4" />
            <p className="text-gray-600">Please wait while we verify your email...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-xl font-bold mb-2">Email Verified!</p>
            <p className="text-gray-600 mb-6">Your account is now fully active.</p>
            <Link href="/login" className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all inline-block">
              Continue to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-xl font-bold mb-2">Verification Failed</p>
            <p className="text-gray-600 mb-6">The link is invalid, expired, or you're already verified.</p>
            <Link href="/forgot-password" className="text-kaggle-blue font-bold hover:underline">
              Request a new link
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}


export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-kaggle-blue w-8 h-8" /></div>}><VerifyEmail /></Suspense>;
}
