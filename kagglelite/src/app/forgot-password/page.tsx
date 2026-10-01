'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a password reset link to your email.">
        <div className="text-center">
          <p className="mb-6 text-gray-600">If an account exists for {email}, you will receive an email shortly.</p>
          <Link href="/login" className="text-kaggle-blue font-bold hover:underline">Return to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a password reset link.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email" 
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <button type="submit" disabled={isSubmitting || !email} className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Send Reset Link
        </button>
      </form>
      <div className="mt-8 text-center text-sm">
        <Link href="/login" className="text-gray-500 hover:text-gray-800 font-medium">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
