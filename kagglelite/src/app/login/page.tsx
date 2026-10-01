'use client';
import { useState, Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type LoginForm = z.infer<typeof loginSchema>;

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const nextUrl = searchParams.get('next') || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    if (searchParams.get('error') === 'OAuthFailed') toast.error('GitHub sign in failed.');
    if (searchParams.get('requires2FA')) router.push(`/2fa?userId=${searchParams.get('userId')}&next=${encodeURIComponent(nextUrl)}`);
  }, [searchParams]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (res.ok) {
        if (result.requires2FA) {
          router.push(`/2fa?userId=${result.userId}&next=${encodeURIComponent(nextUrl)}`);
        } else {
          toast.success('Signed in successfully!');
          router.push(nextUrl);
          router.refresh();
        }
      } else {
        toast.error(result.error || 'Failed to sign in');
      }
    } catch (e) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  return (
    <AuthLayout title="Sign in to KaggleLite" subtitle="Welcome back! Please enter your details.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" onKeyDown={handleKeyDown}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
          <input 
            {...register('identifier')}
            type="text" 
            placeholder="demo@kagglelite.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
          />
          {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {capsLock && <p className="text-yellow-600 text-xs mt-1 font-medium">Caps Lock is ON</p>}
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('rememberMe')} className="rounded text-kaggle-blue focus:ring-kaggle-blue w-4 h-4" />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-kaggle-blue font-semibold hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
        </div>
        <div className="mt-6 flex gap-4">
          <a href="/api/auth/oauth/github" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> GitHub
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account? <Link href="/register" className="text-kaggle-blue font-semibold hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}


export default function LoginPage() {
  return <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-kaggle-blue w-8 h-8" /></div>}><Login /></Suspense>;
}
