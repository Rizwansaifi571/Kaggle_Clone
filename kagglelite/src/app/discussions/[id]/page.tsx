'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThumbsUp, MessageSquare } from 'lucide-react';

export default function DiscussionDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(false);
  const router = useRouter();

  const fetchDiscussion = () => {
    fetch(`/api/discussions/${id}`)
      .then(res => res.json())
      .then(d => setData(d));
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  if (!data || !data.discussion) return <div className="py-10 text-center">Loading...</div>;

  const handleTopicUpvote = async () => {
    const res = await fetch(`/api/discussions/${id}/upvote`, { method: 'POST' });
    if (res.ok) {
      const result = await res.json();
      setIsUpvoted(result.upvoted);
      setData((prev: any) => ({
        ...prev,
        discussion: { ...prev.discussion, votes: prev.discussion.votes + (result.upvoted ? 1 : -1) }
      }));
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  const postReply = async () => {
    if (!replyBody.trim()) return;
    const res = await fetch(`/api/discussions/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody })
    });
    if (res.ok) {
      setReplyBody('');
      fetchDiscussion();
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
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
        <p className="whitespace-pre-wrap text-gray-800">{data.discussion.body}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm font-medium">
          <button onClick={handleTopicUpvote} className={`px-4 py-1.5 rounded-full flex items-center gap-2 border transition-colors ${isUpvoted ? 'border-kaggle-blue bg-blue-50 text-kaggle-blue' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
            <ThumbsUp className="h-4 w-4" /> {data.discussion.votes}
          </button>
          <a href="#reply" className="px-4 py-1.5 rounded-full flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600">
            <MessageSquare className="h-4 w-4" /> Reply
          </a>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">{data.replies.length} Replies</h3>
      
      <div className="flex flex-col gap-6 mb-8">
        {data.replies.map((reply: any) => (
          <div key={reply.id} className="bg-white border border-kaggle-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kaggle-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {reply.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-800">{reply.author_name}</div>
                  <div className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{reply.body}</p>
          </div>
        ))}
        {data.replies.length === 0 && <div className="text-center py-10 text-gray-500">No replies yet.</div>}
      </div>

      <div id="reply" className="bg-white border border-kaggle-border rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold mb-4">Your Reply</h4>
        <textarea 
          value={replyBody}
          onChange={e => setReplyBody(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-kaggle-blue focus:ring-1 focus:ring-kaggle-blue resize-none h-32 mb-4"
          placeholder="Type your reply here..."
        />
        <div className="flex justify-end">
          <button onClick={postReply} disabled={!replyBody.trim()} className="bg-kaggle-blue text-white px-8 py-2 rounded-full font-bold hover:bg-opacity-90 disabled:opacity-50">
            Post Reply
          </button>
        </div>
      </div>
    </div>
  );
}
