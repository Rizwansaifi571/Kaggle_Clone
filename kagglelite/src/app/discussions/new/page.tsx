'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDiscussion() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    
    setIsSubmitting(true);
    const res = await fetch('/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category })
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/discussions/${data.id}`);
    } else {
      if (res.status === 401) router.push('/login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">New Topic</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 border border-kaggle-border rounded-2xl shadow-sm flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-kaggle-blue focus:ring-1 focus:ring-kaggle-blue"
            placeholder="What do you want to discuss?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-kaggle-blue"
          >
            <option>General</option>
            <option>Questions</option>
            <option>Product Feedback</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Body</label>
          <textarea 
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-kaggle-blue focus:ring-1 focus:ring-kaggle-blue h-64 resize-none"
            placeholder="Provide more details here..."
            required
          />
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-full">Cancel</button>
          <button type="submit" disabled={isSubmitting || !title.trim() || !body.trim()} className="bg-kaggle-blue text-white px-8 py-2 rounded-full font-bold hover:bg-opacity-90 disabled:opacity-50">
            {isSubmitting ? 'Posting...' : 'Post Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}
