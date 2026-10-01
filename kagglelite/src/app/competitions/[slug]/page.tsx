'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CompetitionDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [comp, setComp] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [score, setScore] = useState('');

  useEffect(() => {
    fetch(`/api/competitions/${slug}`)
      .then(res => res.json())
      .then(data => setComp(data.competition));
      
    fetch(`/api/competitions/${slug}/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []));
  }, [slug]);

  const handleJoin = async () => {
    const res = await fetch(`/api/competitions/${slug}/join`, { method: 'POST' });
    if (res.status === 401) {
      router.push('/login');
    } else {
      alert('Joined competition!');
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/competitions/${slug}/leaderboard`, {
      method: 'POST',
      body: JSON.stringify({ score: parseFloat(score) }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 401) {
      router.push('/login');
    } else {
      alert('Score submitted!');
      fetch(`/api/competitions/${slug}/leaderboard`).then(res => res.json()).then(data => setLeaderboard(data.leaderboard || []));
      setScore('');
    }
  };

  if (!comp) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div>
      <div className="bg-white border border-kaggle-border rounded-2xl p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{comp.title}</h1>
            <p className="text-gray-600">{comp.subtitle}</p>
          </div>
          <button onClick={handleJoin} className="bg-kaggle-blue text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-colors shrink-0">
            Join Competition
          </button>
        </div>
        <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
          <div><div className="text-sm text-gray-500">Prize</div><div className="font-bold text-lg">{comp.prize}</div></div>
          <div><div className="text-sm text-gray-500">Teams</div><div className="font-bold text-lg">{comp.teams_count}</div></div>
          <div><div className="text-sm text-gray-500">Deadline</div><div className="font-bold text-lg">{new Date(comp.deadline).toLocaleDateString()}</div></div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-kaggle-border mb-6">
        {['Overview', 'Data', 'Leaderboard', 'Discussion'].map(tab => (
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
        {activeTab === 'Overview' && <div><h2 className="text-xl font-bold mb-4">Overview</h2><p>{comp.description}</p></div>}
        {activeTab === 'Data' && <div><h2 className="text-xl font-bold mb-4">Data</h2><p>Data description goes here.</p></div>}
        {activeTab === 'Leaderboard' && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
              Leaderboard
            </h2>
            <form onSubmit={handleSubmitScore} className="mb-6 flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="number" step="0.00001" required value={score} onChange={e => setScore(e.target.value)} placeholder="Dummy Score (e.g. 0.85)" className="border border-gray-300 rounded px-3 py-1 outline-none" />
              <button type="submit" className="bg-kaggle-blue text-white px-4 py-1 rounded font-semibold hover:bg-opacity-90">Submit Prediction</button>
            </form>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Team Name</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Entries</th>
                  <th className="pb-2">Last</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row: any, i) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-bold">{i + 1}</td>
                    <td className="py-3 text-kaggle-blue font-medium">{row.team_name}</td>
                    <td className="py-3 font-mono">{row.score}</td>
                    <td className="py-3">{row.entries}</td>
                    <td className="py-3 text-sm text-gray-500">{new Date(row.last_submission).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'Discussion' && <div><h2 className="text-xl font-bold mb-4">Discussion</h2><p>Discussion forum...</p></div>}
      </div>
    </div>
  );
}
