'use client';
import Link from 'next/link';
import { Search, User, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-kaggle-border z-50 flex items-center px-6 justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Kaggle<span className="text-kaggle-blue">Lite</span>
        </Link>
        <div className="hidden md:flex relative group w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-kaggle-blue" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-kaggle-blue/50 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4 relative group cursor-pointer">
            <div className="w-8 h-8 bg-kaggle-blue text-white rounded-full flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden group-hover:block absolute right-0 top-10 w-48 bg-white border border-kaggle-border rounded-lg shadow-lg py-2">
              <Link href={`/profile/${user.username}`} className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</button>
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:text-kaggle-blue">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-kaggle-blue text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
