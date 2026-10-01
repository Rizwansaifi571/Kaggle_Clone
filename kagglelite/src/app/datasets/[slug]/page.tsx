'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DatasetDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Data Card');

  useEffect(() => {
    fetch(`/api/datasets/${slug}`)
      .then(res => res.json())
      .then(resData => setData(resData));
  }, [slug]);

  const handleUpvote = async () => {
    const res = await fetch(`/api/datasets/${slug}/upvote`, { method: 'POST' });
    if (res.status === 401) {
      router.push('/login');
    } else {
      const result = await res.json();
      setData({ ...data, dataset: { ...data.dataset, upvotes: result.upvoted ? data.dataset.upvotes + 1 : data.dataset.upvotes - 1 } });
    }
  };

  const handleDownload = () => {
    alert('Dummy download started!');
  };

  if (!data) return <div className="py-10 text-center">Loading...</div>;
  const { dataset, columns } = data;

  return (
    <div>
      <div className="bg-white border border-kaggle-border rounded-2xl p-8 mb-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{dataset.title}</h1>
          <p className="text-gray-600 mb-4">{dataset.owner_name} • {dataset.size}</p>
          <div className="flex gap-4">
            <button onClick={handleUpvote} className="border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50 flex items-center gap-2 font-medium">👍 {dataset.upvotes}</button>
            <button onClick={handleDownload} className="bg-kaggle-blue text-white px-6 py-1.5 rounded-full font-bold hover:bg-opacity-90">Download</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-kaggle-border mb-6">
        {['Data Card', 'Code', 'Discussion'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-kaggle-blue text-kaggle-blue' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-kaggle-border rounded-2xl p-6 shadow-sm min-h-[300px]">
        {activeTab === 'Data Card' && (
          <div>
            <h2 className="text-xl font-bold mb-4">About Dataset</h2>
            <p className="mb-8">{dataset.description}</p>
            <h3 className="text-lg font-bold mb-4">Columns ({columns.length})</h3>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border-b border-gray-200 font-semibold">Name</th>
                  <th className="p-3 border-b border-gray-200 font-semibold">Type</th>
                  <th className="p-3 border-b border-gray-200 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col: any) => (
                  <tr key={col.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium">{col.name}</td>
                    <td className="p-3 text-gray-500">{col.type}</td>
                    <td className="p-3 text-gray-600">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'Code' && <div>Related notebooks...</div>}
        {activeTab === 'Discussion' && <div>Discussion...</div>}
      </div>
    </div>
  );
}
