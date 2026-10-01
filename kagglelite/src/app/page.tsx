'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetch('/api/competitions?category=Featured')
      .then(res => res.json())
      .then(data => setCompetitions(data.competitions?.slice(0, 3) || []));
      
    fetch('/api/datasets?sort=Hottest')
      .then(res => res.json())
      .then(data => setDatasets(data.datasets?.slice(0, 3) || []));
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="bg-gradient-to-r from-kaggle-blue to-blue-500 rounded-2xl p-10 text-white shadow-md">
        <h1 className="text-4xl font-bold mb-4">Level up with the largest AI & ML community</h1>
        <p className="text-lg mb-6 opacity-90 max-w-2xl">Join KaggleLite to compete, find data, and build models. Dummy project for demo purposes.</p>
        <Link href="/register" className="bg-white text-kaggle-blue px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
          Register with Email
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Active Competitions</h2>
          <Link href="/competitions" className="text-kaggle-blue font-medium hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitions.map((comp: any) => (
            <Link key={comp.id} href={`/competitions/${comp.slug}`} className="block group">
              <div className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm group-hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-1 truncate">{comp.title}</h3>
                <p className="text-sm text-gray-500 mb-4 truncate">{comp.subtitle}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-800">{comp.prize}</span>
                  <span className="text-gray-500">{comp.teams_count} Teams</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending Datasets</h2>
          <Link href="/datasets" className="text-kaggle-blue font-medium hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datasets.map((dataset: any) => (
            <Link key={dataset.id} href={`/datasets/${dataset.slug}`} className="block group">
              <div className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm group-hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-1 truncate">{dataset.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{dataset.owner_name} • {dataset.size}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👍 {dataset.upvotes}</span>
                  <span>Usability {dataset.usability}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
