'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode, title: string, subtitle?: string }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-kaggle-blue to-blue-900 text-white overflow-hidden p-12 flex-col justify-between">
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-bold tracking-tighter">KaggleLite</Link>
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">Join the world's largest data science community.</h1>
            <p className="text-xl text-blue-100 opacity-90 max-w-md">
              Learn, compete, and share your models with millions of machine learning engineers around the globe.
            </p>
          </motion.div>
          
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-blue-900 bg-gray-200 flex items-center justify-center overflow-hidden z-${50-i*10}`}>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium">Over <span className="font-bold">14,000,000</span> members</div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Link href="/" className="text-3xl font-bold text-kaggle-blue tracking-tighter">KaggleLite</Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}
            
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
