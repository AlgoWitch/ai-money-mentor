import React from 'react';
import { TrendingUp, ShieldCheck, Target, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function Phase3Insights({ data, userProfile }) {
  const isGood = data.metrics.status === "On Track";

  return (
    <div className="w-full flex justify-start -mt-2">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        
        <MessageBubble isAI={true} message={data.nudge} />
        
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-ql-bg ml-11 md:ml-12 mt-2 relative overflow-hidden">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-ql-primary/20 rounded-bl-full -z-0"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-ql-dark mb-1">Financial Health</h2>
            <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
              {isGood ? <ShieldCheck size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-amber-500"/>}
              Status: <span className={isGood ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{data.metrics.status}</span>
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <TrendingUp size={14} /> Savings Rate
                </div>
                <div className="text-2xl font-bold text-ql-dark">{data.metrics.savings_rate}%</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Target size={14} /> Emergency
                </div>
                <div className="text-2xl font-bold text-ql-dark">{data.metrics.emergency_fund_progress}%</div>
              </div>
            </div>

            {/* Expert Advice Block */}
            <div className="insight-block">
              <div className="insight-label">The AI Mentor's Verdict</div>
              <div className="insight-value italic text-slate-600 font-medium mt-2">
                "{data.expert_advice}"
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
               <div className="text-xs text-slate-400">Profile: {userProfile.goal || 'Goal set'}</div>
               <button onClick={() => window.location.reload()} className="text-sm text-ql-dark font-semibold hover:text-black transition-colors underline decoration-ql-primary decoration-2 underline-offset-4">
                  Start Over
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
