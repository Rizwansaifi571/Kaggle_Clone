'use client';
import Link from 'next/link';
import { Search, LogOut, Trophy, Database, Code2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearchOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results);
          setIsSearchOpen(true);
          setActiveIndex(-1);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allResults = searchResults 
    ? [...searchResults.competitions, ...searchResults.datasets, ...searchResults.notebooks] 
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allResults.length) {
        const selected = allResults[activeIndex];
        const routePrefix = selected.type === 'competition' ? '/competitions' : selected.type === 'dataset' ? '/datasets' : '/code';
        router.push(`${routePrefix}/${selected.slug}`);
        setIsSearchOpen(false);
      } else if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'competition') return <Trophy className="h-4 w-4 text-gray-500" />;
    if (type === 'dataset') return <Database className="h-4 w-4 text-gray-500" />;
    return <Code2 className="h-4 w-4 text-gray-500" />;
  };

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
        <div className="hidden md:block relative w-96" ref={searchRef}>
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if(searchQuery.trim()) setIsSearchOpen(true) }}
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-kaggle-blue/50 transition-all"
          />
          {isSearchOpen && searchResults && (
            <div className="absolute top-12 left-0 w-full bg-white border border-kaggle-border rounded-xl shadow-lg overflow-hidden py-2 z-50 max-h-96 overflow-y-auto">
              {allResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found for "{searchQuery}"</div>
              ) : (
                <>
                  {['competitions', 'datasets', 'notebooks'].map(type => {
                    const items = searchResults[type];
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={type}>
                        <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">{type}</div>
                        {items.map((item: any) => {
                          const flatIndex = allResults.findIndex(r => r.slug === item.slug && r.type === item.type);
                          const isActive = flatIndex === activeIndex;
                          const routePrefix = item.type === 'competition' ? '/competitions' : item.type === 'dataset' ? '/datasets' : '/code';
                          return (
                            <Link 
                              key={`${item.type}-${item.slug}`} 
                              href={`${routePrefix}/${item.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                            >
                              {getIcon(item.type)}
                              <span className="text-sm font-medium text-gray-800">{item.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-100 mt-2">
                    <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={() => setIsSearchOpen(false)} className="block px-4 py-3 text-sm text-kaggle-blue font-medium hover:bg-gray-50 text-center">
                      View all results
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4 relative group cursor-pointer">
            <div className="w-8 h-8 bg-kaggle-blue text-white rounded-full flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden group-hover:block absolute right-0 top-10 w-48 bg-white border border-kaggle-border rounded-lg shadow-lg py-2">
              <Link href={`/profile/${user.username}`} className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</button>
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:text-kaggle-blue text-gray-600">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-kaggle-blue text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
