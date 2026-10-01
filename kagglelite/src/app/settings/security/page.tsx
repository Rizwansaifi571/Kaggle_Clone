'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, MonitorSmartphone, KeySquare, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/sessions')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const revokeSession = async (id: string) => {
    if (!confirm('Are you sure you want to log out of this device?')) return;
    try {
      const res = await fetch(`/api/auth/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(s => s.filter(x => x.id !== id));
        toast.success('Session revoked');
      } else {
        toast.error('Failed to revoke session');
      }
    } catch (e) {
      toast.error('Server error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">Security & Access</h1>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-gray-500" /> Password</h2>
            <p className="text-sm text-gray-500 mt-1">Change your password to keep your account secure.</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Change Password</button>
        </div>
        
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-gray-500" /> Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security using an authenticator app.</p>
          </div>
          <button className="px-4 py-2 border border-kaggle-blue text-kaggle-blue rounded-lg text-sm font-medium hover:bg-blue-50">Enable 2FA</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2"><MonitorSmartphone className="w-5 h-5 text-gray-500" /> Active Sessions</h2>
          <p className="text-sm text-gray-500 mt-1">Devices that are currently logged in to your account.</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active sessions found.</div>
          ) : (
            sessions.map((s, i) => (
              <div key={s.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    {s.device_label?.toLowerCase().includes('mobile') ? <MonitorSmartphone className="w-6 h-6" /> : <MonitorSmartphone className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.device_label || 'Unknown Device'} {i === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Current</span>}</p>
                    <p className="text-sm text-gray-500">{s.ip} • Last active {new Date(s.last_used_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {i !== 0 && (
                  <button onClick={() => revokeSession(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
