'use client';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Leaderboard({ competitionId }: { competitionId: string }) {
  // Dummy data
  const entries = [
    { rank: 1, team: 'Data Wizards', score: 0.9854, entries: 14, last: '2h ago', trend: 'up' },
    { rank: 2, team: 'ML Mavericks', score: 0.9841, entries: 22, last: '5h ago', trend: 'same' },
    { rank: 3, team: 'Overfitters', score: 0.9822, entries: 45, last: '1d ago', trend: 'down' },
    { rank: 4, team: 'Ensemble Ensemble', score: 0.9810, entries: 8, last: '3h ago', trend: 'up' },
    { rank: 5, team: 'Gradient Boosters', score: 0.9799, entries: 19, last: '12h ago', trend: 'same' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Trophy className="w-5 h-5 text-yellow-500" /> Public Leaderboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">This leaderboard is calculated with approximately 30% of the test data.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-gray-900">14,500</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teams</div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="p-4 font-bold w-20 text-center">Rank</th>
              <th className="p-4 font-bold w-12 text-center">+/-</th>
              <th className="p-4 font-bold">Team Name</th>
              <th className="p-4 font-bold text-right">Score</th>
              <th className="p-4 font-bold text-right">Entries</th>
              <th className="p-4 font-bold text-right">Last</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.rank} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-4 text-center font-bold text-gray-900">
                  {entry.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                   entry.rank === 2 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                   entry.rank === 3 ? <Medal className="w-6 h-6 text-amber-700 mx-auto" /> : 
                   entry.rank}
                </td>
                <td className="p-4 text-center">
                  {entry.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                  {entry.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                  {entry.trend === 'same' && <Minus className="w-4 h-4 text-gray-300 mx-auto" />}
                </td>
                <td className="p-4 font-semibold text-gray-800 group-hover:text-kaggle-blue transition-colors">
                  {entry.team}
                </td>
                <td className="p-4 text-right font-mono font-bold text-gray-900">{entry.score.toFixed(4)}</td>
                <td className="p-4 text-right text-gray-500 font-medium">{entry.entries}</td>
                <td className="p-4 text-right text-gray-400 text-sm">{entry.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
        <button className="text-sm font-bold text-kaggle-blue hover:underline">View All 14,500 Teams</button>
      </div>
    </div>
  );
}
