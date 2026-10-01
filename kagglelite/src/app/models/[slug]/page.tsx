'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ThumbsUp, Terminal } from 'lucide-react';

export default function ModelDetail() {
  const { slug } = useParams();
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/models/${slug}`)
      .then(res => res.json())
      .then(data => setModel(data.model));
  }, [slug]);

  if (!model) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-6 bg-white p-8 rounded-2xl border border-kaggle-border shadow-sm flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{model.name}</h1>
            <span className="px-2 py-1 bg-gray-100 text-xs font-bold text-gray-500 rounded uppercase">{model.framework}</span>
          </div>
          <p className="text-gray-600 mb-6">{model.description}</p>
          <div className="flex gap-4">
            <button className="border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50 flex items-center gap-2 font-medium">
              <ThumbsUp className="h-4 w-4" /> {model.upvotes}
            </button>
            <div className="px-4 py-1.5 rounded-full flex items-center gap-2 text-gray-500 font-medium">
              <Download className="h-4 w-4" /> {model.downloads}
            </div>
          </div>
        </div>
        <button className="bg-kaggle-blue text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 flex items-center gap-2">
          <Download className="h-4 w-4" /> Download Model
        </button>
      </div>
      
      <div className="bg-white border border-kaggle-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Terminal className="h-5 w-5 text-gray-500" /> Usage</h2>
        <p className="mb-4 text-gray-700">Use this model in your code with {model.framework}:</p>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
          {model.framework === 'PyTorch' ? (
            <pre>{`import torch\nfrom transformers import AutoModel\n\nmodel = AutoModel.from_pretrained("kagglelite/${model.slug}")`}</pre>
          ) : (
            <pre>{`import tensorflow as tf\n\nmodel = tf.keras.models.load_model("kagglelite/${model.slug}")`}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
