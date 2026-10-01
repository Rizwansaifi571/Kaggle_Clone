'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Code() {
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    fetch('/api/notebooks')
      .then(res => res.json())
      .then(data => setNotebooks(data.notebooks || []));
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold">Code</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search notebooks" 
            className="w-full bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-kaggle-blue"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {notebooks.map((nb: any) => (
          <Link key={nb.id} href={`/code/${nb.slug}`}>
            <div className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {nb.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{nb.title}</h3>
                  <div className="text-sm text-gray-500 flex gap-2 items-center">
                    <span>{nb.author_name}</span>
                    <span>•</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{nb.language}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span>👍 {nb.upvotes}</span>
                <span>💬 {nb.comments_count}</span>
              </div>
            </div>
          </Link>
        ))}
        {notebooks.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No notebooks found.
          </div>
        )}
      </div>
    </div>
  );
}
