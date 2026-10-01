'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [sort, setSort] = useState('Hottest');
  const [q, setQ] = useState('');

  const sortOptions = ['Hottest', 'Most Votes', 'Newest'];

  useEffect(() => {
    fetch(`/api/datasets?sort=${sort}&q=${q}`)
      .then(res => res.json())
      .then(data => setDatasets(data.datasets || []));
  }, [sort, q]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold">Datasets</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search datasets" 
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-kaggle-blue"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-kaggle-border mb-6 overflow-x-auto items-center">
        <span className="text-sm font-medium text-gray-500">Sort by:</span>
        {sortOptions.map(option => (
          <button 
            key={option}
            onClick={() => setSort(option)}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${sort === option ? 'border-kaggle-blue text-kaggle-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset: any) => (
          <Link key={dataset.id} href={`/datasets/${dataset.slug}`}>
            <div className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="mb-4 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                    {dataset.owner_avatar ? (
                      <img src={dataset.owner_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{dataset.owner_name.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{dataset.owner_name}</span>
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{dataset.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{dataset.size}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dataset.tags.split(',').slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  👍 <span className="font-medium">{dataset.upvotes}</span>
                </div>
                <div>
                  Usability <span className="font-medium text-gray-700">{dataset.usability}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {datasets.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No datasets found.
        </div>
      )}
    </div>
  );
}
