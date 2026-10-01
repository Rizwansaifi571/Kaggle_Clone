'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function DiscussionDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/discussions/${id}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [id]);

  if (!data || !data.discussion) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{data.discussion.title}</h1>
        <div className="flex gap-2 items-center text-sm text-gray-500">
          <span className="font-medium text-kaggle-blue">{data.discussion.author_name}</span>
          <span>•</span>
          <span>{new Date(data.discussion.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded">{data.discussion.category}</span>
        </div>
      </div>

      <div className="bg-white border border-kaggle-border rounded-2xl p-6 mb-8 shadow-sm flex flex-col gap-4">
        <p className="whitespace-pre-wrap">{data.discussion.body}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm text-gray-500 font-medium">
          <button className="hover:bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-2">👍 {data.discussion.votes}</button>
          <button className="hover:bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-2">💬 Reply</button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">{data.replies.length} Replies</h3>
      <div className="flex flex-col gap-6">
        {data.replies.map((reply: any) => (
          <div key={reply.id} className="bg-white border border-kaggle-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                {reply.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm">{reply.author_name}</div>
                <div className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</div>
              </div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{reply.body}</p>
          </div>
        ))}
        {data.replies.length === 0 && <div className="text-center py-10 text-gray-500">No replies yet.</div>}
      </div>
    </div>
  );
}
