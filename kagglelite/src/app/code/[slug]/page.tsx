'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NotebookDetail() {
  const { slug } = useParams();
  const [nb, setNb] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/notebooks/${slug}`)
      .then(res => res.json())
      .then(data => setNb(data.notebook));
  }, [slug]);

  if (!nb) return <div className="py-10 text-center">Loading...</div>;

  let content = [];
  try {
    content = JSON.parse(nb.content_json);
  } catch(e) {}

  return (
    <div>
      <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-2xl border border-kaggle-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-2">{nb.title}</h1>
          <p className="text-gray-500">by <span className="font-medium text-kaggle-blue">{nb.author_name}</span> in {nb.language}</p>
        </div>
        <div className="flex gap-4">
          <button className="border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50 flex items-center gap-2 font-medium">👍 {nb.upvotes}</button>
          <button className="bg-gray-800 text-white px-6 py-1.5 rounded-full font-bold hover:bg-opacity-90">Copy & Edit</button>
        </div>
      </div>
      
      <div className="bg-white border border-kaggle-border rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col gap-6">
        {content.map((cell: any, i: number) => (
          <div key={i} className="flex flex-col gap-2">
            {cell.type === 'markdown' ? (
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: cell.source.replace('# ', '<h1 class="text-2xl font-bold mb-4">') + '</h1>' }} />
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm border border-gray-200">
                  <span className="text-gray-400 select-none mr-4">In [{i}]:</span> {cell.source}
                </div>
                {cell.output && (
                  <div className="px-4 py-2 font-mono text-sm">
                    {cell.output}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
