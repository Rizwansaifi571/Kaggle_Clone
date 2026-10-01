'use client';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function Submissions({ competitionId }: { competitionId: string }) {
  return (
    <div className="space-y-8">
      {/* Submit Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Make a Submission</h2>
          <p className="text-sm text-gray-500">Upload your `submission.csv` to be scored against the test data.</p>
        </div>
        <button className="w-full md:w-auto bg-kaggle-blue text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
          <UploadCloud className="w-5 h-5" /> Upload Predictions
        </button>
      </div>

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold">My Submissions</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="p-4 font-bold">File</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Score</th>
              <th className="p-4 font-bold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3].map(i => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">submission_v{4-i}.csv</span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3" /> Complete
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-bold text-gray-900">{0.9854 - (i * 0.005)}</td>
                <td className="p-4 text-right text-gray-400 text-sm">{i} days ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
