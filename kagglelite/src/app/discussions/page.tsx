'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    fetch('/api/discussions')
      .then(res => res.json())
      .then(data => setDiscussions(data.discussions || []));
  }, []);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discussions</h1>
        <button className="bg-kaggle-blue text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors">New Topic</button>
      </div>

      <div className="bg-white border border-kaggle-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-kaggle-border text-sm text-gray-600">
              <th className="p-4 font-semibold">Topic</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Replies</th>
              <th className="p-4 font-semibold">Votes</th>
            </tr>
          </thead>
          <tbody>
            {discussions.map((disc: any) => (
              <tr key={disc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <Link href={`/discussions/${disc.id}`} className="block">
                    <span className="font-bold text-base hover:text-kaggle-blue">{disc.title}</span>
                    <div className="text-sm text-gray-500 mt-1">by {disc.author_name}</div>
                  </Link>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{disc.category}</span>
                </td>
                <td className="p-4 text-gray-600">{disc.replies_count}</td>
                <td className="p-4 text-gray-600">{disc.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
