'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const watchPassword = watch('password', '');
  const watchUsername = watch('username', '');

  const checkUsername = async (u: string) => {
    if (u.length < 3) return setUsernameStatus('idle');
    setUsernameStatus('checking');
    const res = await fetch(`/api/auth/check-username?u=${encodeURIComponent(u)}`);
    const data = await res.json();
    setUsernameStatus(data.available ? 'available' : 'taken');
  };

  const onSubmit = async (data: RegisterForm) => {
    if (usernameStatus === 'taken') return toast.error('Username is already taken');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (res.ok) {
        toast.success('Registration successful! Please check your email to verify.');
        router.push('/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (e) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start your journey in data science today.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            {...register('email')}
            type="email" 
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="relative">
            <input 
              {...register('username', { 
                onChange: (e) => {
                  const val = e.target.value;
                  // Debounce in a real app, simplified for demo
                  setTimeout(() => checkUsername(val), 500);
                }
              })}
              type="text" 
              placeholder="datascientist"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-kaggle-blue focus:ring-2 focus:ring-kaggle-blue/20 outline-none transition-all bg-gray-50 focus:bg-white"
            />
            <div className="absolute right-4 top-3.5">
              {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
              {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {usernameStatus === 'taken' && <XCircle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          {usernameStatus === 'taken' && <p className="text-red-500 text-xs mt-1">This username is already taken.</p>}
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
          <PasswordStrengthMeter password={watchPassword} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-kaggle-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account? <Link href="/login" className="text-kaggle-blue font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
