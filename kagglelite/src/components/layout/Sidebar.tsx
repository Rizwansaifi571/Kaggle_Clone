'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Database, Cpu, Code2, MessageSquare, BookOpen, MoreHorizontal } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Competitions', icon: Trophy, href: '/competitions' },
  { label: 'Datasets', icon: Database, href: '/datasets' },
  { label: 'Models', icon: Cpu, href: '/models' },
  { label: 'Code', icon: Code2, href: '/code' },
  { label: 'Discussions', icon: MessageSquare, href: '/discussions' },
  { label: 'Learn', icon: BookOpen, href: '/learn' },
  { label: 'More', icon: MoreHorizontal, href: '/more' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-kaggle-border overflow-y-auto hidden md:block z-40">
      <div className="py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'text-kaggle-blue font-semibold border-r-4 border-kaggle-blue' : 'text-gray-600'}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
