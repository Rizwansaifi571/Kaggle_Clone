'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function Models() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data.models || []));
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold">Models</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search models" 
            className="w-full bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-kaggle-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model: any) => (
          <div key={model.id} className="bg-white p-5 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-1">{model.name}</h3>
            <p className="text-sm text-gray-500 mb-4 h-10">{model.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{model.framework}</span>
              <div className="flex gap-3 text-gray-500">
                <span>⬇️ {model.downloads}</span>
                <span>👍 {model.upvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
