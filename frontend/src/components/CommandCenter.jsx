import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Heart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { api } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

export default function CommandCenter() {
  const [market, setMarket] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
     let mounted = true;
     const fetchData = async () => {
         try {
             const mData = await api.marketSentiment();
             const hData = await api.healthCheck();
             if (mounted) {
                 setMarket(mData);
                 setHealthData(hData);
             }
         } catch (e) {
             console.error("Dashboard fetch error", e);
             if (mounted) setError("Failed to load dashboard data.");
         } finally {
             if (mounted) setLoading(false);
         }
     };
     fetchData();
     return () => { mounted = false; };
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const d = healthData.metrics || {};
  const score = d.score || 0;
  const dims = healthData.dimensions || {};

  return (
    <div className="w-full h-full overflow-y-auto pb-10 pr-2">
      <div className="w-full animate-in fade-in zoom-in-95 duration-500">
        
        <MessageBubble isAI={true} message={healthData.expert_advice || "Welcome to your command center."} />
        
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-ql-bg ml-2 sm:ml-12 mt-2 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-ql-primary/10 rounded-bl-full -z-0"></div>

          <div className="relative z-10">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-ql-dark tracking-tight">Command Center</h2>
                  <p className="text-sm text-slate-500 mt-1">Unified Wealth Analytics</p>
               </div>
               
               {market && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-inner-soft self-start md:self-auto">
                     <Activity size={18} className="text-slate-400" />
                     <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Market</div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-ql-dark text-sm">{market.ticker}</span>
                           <span className={`text-xs font-semibold flex items-center ${market.change_points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                             {market.change_points >= 0 ? <TrendingUp size={12} className="mr-0.5"/> : <TrendingDown size={12} className="mr-0.5"/>}
                             {market.change_pct}%
                           </span>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-ql-bg to-white p-5 rounded-2xl border border-ql-primary/30 shadow-sm">
                <div className="text-xs uppercase tracking-widest text-ql-dark/60 font-semibold mb-2 flex items-center gap-1.5">
                  <Heart size={14} className="text-ql-accent" /> Health Score
                </div>
                <div className="flex items-end gap-2">
                   <div className="text-4xl font-bold text-ql-dark leading-none">{score}</div>
                   <div className="text-sm font-medium text-slate-500 mb-1">/100</div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Runway
                </div>
                <div className="text-2xl font-bold text-ql-dark leading-none mt-2">{d.runway || '0 Months'}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-ql-dark mb-4 tracking-wider uppercase">The 6 Dimensions of Wealth</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
               {Object.entries(dims).length > 0 ? Object.entries(dims).map(([key, val]) => {
                  const status = val.status || 'Unknown';
                  const isPos = status === 'Strong' || status === 'On Track' || status === 'High' || status === 'Achievable';
                  const isAlert = status === 'Weak' || status === 'Critical';
                  
                  return (
                    <div key={key} className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{key.replace('_', ' ')}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                             isPos ? 'bg-green-100 text-green-700' : (isAlert ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600')
                          }`}>{status}</span>
                       </div>
                       <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2" title={val.details}>{val.details}</p>
                    </div>
                  );
               }) : (
                 <div className="col-span-full text-center p-4 text-slate-500 text-sm">Upload a bank statement in the Chat to analyze your dimensions.</div>
               )}
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div className="text-xs text-slate-400 flex items-center gap-1">
                  <RefreshCw size={12} /> Profile Evolving Continuously
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
