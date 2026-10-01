'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [category, setCategory] = useState('All');
  const [q, setQ] = useState('');

  const tabs = ['All', 'Getting Started', 'Featured', 'Playground'];

  useEffect(() => {
    fetch(`/api/competitions?category=${category}&q=${q}`)
      .then(res => res.json())
      .then(data => setCompetitions(data.competitions || []));
  }, [category, q]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold">Competitions</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search competitions" 
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-kaggle-blue"
          />
        </div>
      </div>

      <div className="flex gap-6 border-b border-kaggle-border mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setCategory(tab)}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${category === tab ? 'border-kaggle-blue text-kaggle-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {competitions.map((comp: any) => (
          <Link key={comp.id} href={`/competitions/${comp.slug}`}>
            <div className="bg-white p-6 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold text-xl mb-1">{comp.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{comp.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{comp.category}</span>
                  {comp.tags.split(',').map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 shrink-0 text-sm">
                <span className="font-bold text-gray-800 text-lg">{comp.prize}</span>
                <span className="text-gray-500">{comp.teams_count} Teams</span>
              </div>
            </div>
          </Link>
        ))}
        {competitions.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No competitions found.
          </div>
        )}
      </div>
    </div>
  );
}
