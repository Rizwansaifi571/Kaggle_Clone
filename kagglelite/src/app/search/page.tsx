'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setResults(data.results));
  }, [q]);

  if (!results) return <div className="py-10 text-center">Loading search results...</div>;

  const getResultsForTab = () => {
    if (activeTab === 'Competitions') return results.competitions;
    if (activeTab === 'Datasets') return results.datasets;
    if (activeTab === 'Notebooks') return results.notebooks;
    return [...results.competitions, ...results.datasets, ...results.notebooks];
  };

  const displayedResults = getResultsForTab();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Search Results for "{q}"</h1>
      <div className="flex gap-6 border-b border-kaggle-border mb-6">
        {['All', 'Competitions', 'Datasets', 'Notebooks'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-kaggle-blue text-kaggle-blue' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {displayedResults.map((item: any, i: number) => {
          const routePrefix = item.type === 'competition' ? '/competitions' : item.type === 'dataset' ? '/datasets' : '/code';
          return (
            <Link key={i} href={`${routePrefix}/${item.slug}`}>
              <div className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.type}</div>
                <h3 className="font-bold text-lg">{item.title}</h3>
              </div>
            </Link>
          );
        })}
        {displayedResults.length === 0 && (
          <div className="text-center py-20 text-gray-500">No results found in {activeTab}.</div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
