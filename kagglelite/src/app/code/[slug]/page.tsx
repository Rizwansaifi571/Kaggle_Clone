'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, MessageSquare, ThumbsUp } from 'lucide-react';

export default function NotebookDetail() {
  const { slug } = useParams();
  const [nb, setNb] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/notebooks/${slug}`)
      .then(res => res.json())
      .then(data => {
        setNb(data.notebook);
      });
    
    fetch(`/api/notebooks/${slug}/comments`)
      .then(res => res.json())
      .then(data => {
        if(data.comments) setComments(data.comments);
      });
  }, [slug]);

  if (!nb) return <div className="py-10 text-center">Loading...</div>;

  let content = [];
  try { content = JSON.parse(nb.content_json); } catch(e) {}

  const handleUpvote = async () => {
    const res = await fetch(`/api/notebooks/${slug}/upvote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setIsUpvoted(data.upvoted);
      setNb((prev: any) => ({ ...prev, upvotes: prev.upvotes + (data.upvoted ? 1 : -1) }));
    } else {
      if (res.status === 401) router.push('/login');
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);
    const res = await fetch(`/api/notebooks/${slug}/copy`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/code/${data.slug}`);
    } else {
      if (res.status === 401) router.push('/login');
      setIsCopying(false);
    }
  };

  const postComment = async () => {
    if(!newComment.trim()) return;
    const res = await fetch(`/api/notebooks/${slug}/comments`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newComment }) 
    });
    if (res.ok) {
      setNewComment('');
      fetch(`/api/notebooks/${slug}/comments`).then(r => r.json()).then(d => setComments(d.comments || []));
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-2xl border border-kaggle-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-2">{nb.title}</h1>
          <p className="text-gray-500">by <span className="font-medium text-kaggle-blue">{nb.author_name}</span> in {nb.language}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleUpvote} className={`border px-4 py-1.5 rounded-full flex items-center gap-2 font-medium transition-colors ${isUpvoted ? 'border-kaggle-blue bg-blue-50 text-kaggle-blue' : 'border-gray-300 hover:bg-gray-50'}`}>
            <ThumbsUp className="h-4 w-4" /> {nb.upvotes}
          </button>
          <button onClick={handleCopy} disabled={isCopying} className="bg-gray-800 text-white px-6 py-1.5 rounded-full font-bold hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50">
            <Copy className="h-4 w-4" /> {isCopying ? 'Copying...' : 'Copy & Edit'}
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-kaggle-border rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col gap-6 mb-8">
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

      <div className="bg-white p-6 rounded-2xl border border-kaggle-border shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments ({comments.length})</h3>
        
        <div className="flex flex-col gap-4 mb-8">
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-kaggle-blue focus:ring-1 focus:ring-kaggle-blue resize-none h-24"
            placeholder="Add a comment..."
          />
          <div className="flex justify-end">
            <button onClick={postComment} disabled={!newComment.trim()} className="bg-kaggle-blue text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50 hover:bg-opacity-90 transition-colors">
              Post Comment
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-4">
              <div className="w-10 h-10 bg-kaggle-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {c.author_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-gray-800">{c.author_name}</span>
                  <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
