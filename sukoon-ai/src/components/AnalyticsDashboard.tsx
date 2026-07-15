import React, { useState, useEffect } from 'react';
import { Trophy, Activity, MessageCircle, AlertTriangle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading insights...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-slate-500">Failed to load insights. Make sure the backend is running.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] tracking-wider bg-[#5DADE2]/10 px-2 py-0.5 rounded-full">
          Impact Metrics
        </span>
        <h3 className="font-display font-bold text-lg text-[#2F3E46]">Community Insights</h3>
        <p className="font-body text-xs text-slate-500 font-semibold">
          Anonymized aggregate stats of how Sukoon AI is helping the community.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#5DADE2]/10 flex items-center justify-center text-[#5DADE2]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</p>
            <p className="text-2xl font-display font-extrabold text-[#2F3E46]">{stats.totalConversations}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crisis Interventions</p>
            <p className="text-2xl font-display font-extrabold text-[#2F3E46]">{stats.totalCrisisEvents}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <h4 className="font-display font-bold text-sm text-[#2F3E46] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#5DADE2]" />
          Top Stress Topics
        </h4>
        <div className="space-y-3">
          {stats.topTopics && stats.topTopics.length > 0 ? (
            stats.topTopics.map((topic: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 capitalize">{topic.topic_name}</span>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{topic.count} mentions</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No topics logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
