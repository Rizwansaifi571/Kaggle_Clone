'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid Request" subtitle="No reset token provided.">
        <button onClick={() => router.push('/forgot-password')} className="text-kaggle-blue font-bold">Request a new link</button>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Password reset successfully!');
        router.push('/login');
      } else {
        toast.error(data.error || 'Failed to reset password');
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error('Server error');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Please enter your new password below.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input 
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </div>

        <button type="submit" disabled={isSubmitting || password.length < 10} className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
}


export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-kaggle-blue w-8 h-8" /></div>}><ResetPassword /></Suspense>;
}
