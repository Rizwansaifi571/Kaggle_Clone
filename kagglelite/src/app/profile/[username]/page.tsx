'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [username]);

  if (!data || !data.user) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div>
      <div className="bg-white border border-kaggle-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 bg-kaggle-blue rounded-full flex flex-shrink-0 items-center justify-center text-5xl font-bold text-white shadow-md border-4 border-white">
          {data.user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{data.user.username}</h1>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">{data.user.tier}</span>
          <p className="mt-4 text-gray-600 max-w-2xl">{data.user.bio || 'Data Scientist and ML enthusiast.'}</p>
          <p className="mt-2 text-sm text-gray-500">Joined {new Date(data.user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Competitions', count: data.stats.competitions },
          { label: 'Datasets', count: data.stats.datasets },
          { label: 'Notebooks', count: data.stats.notebooks },
          { label: 'Discussions', count: data.stats.discussions },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-kaggle-border rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold mb-1">{stat.count}</div>
            <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
