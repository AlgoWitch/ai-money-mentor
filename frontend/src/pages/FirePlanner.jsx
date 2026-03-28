import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import MessageBubble from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FirePlanner() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
     { isAI: true, text: "Ready to calculate exactly when you can retire? Let's build your FIRE plan in 5 quick steps. First, what is your current age?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    
    setChatLog(prev => [...prev, { isAI: false, text: userMsg }]);
    setLoading(true);

    try {
      if (step === 0) {
        const val = parseInt(userMsg);
        setProfile(prev => ({ ...prev, age: val || 30 }));
        await api.submitAnswer("age", val || 30);
        setChatLog(prev => [...prev, { isAI: true, text: `Excellent. And what is your total monthly income (in ₹)?` }]);
        setStep(1);
      } else if (step === 1) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, monthly_income: val || 100000 }));
        await api.submitAnswer("monthly_income", val || 100000);
        setChatLog(prev => [...prev, { isAI: true, text: `Got it. Roughly how much of that goes toward monthly expenses?` }]);
        setStep(2);
      } else if (step === 2) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, monthly_expenses: val || 50000 }));
        await api.submitAnswer("monthly_expenses", val || 50000);
        setChatLog(prev => [...prev, { isAI: true, text: `Okay. And what are your total current savings or investments right now?` }]);
        setStep(3);
      } else if (step === 3) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, current_savings: val || 200000 }));
        await api.submitAnswer("current_savings", val || 200000);
        setChatLog(prev => [...prev, { isAI: true, text: `Almost done. What is your 'FIRE' target number? (How much money do you want to retire with?)` }]);
        setStep(4);
      } else if (step === 4) {
        setProfile(prev => ({ ...prev, fire_goal: userMsg }));
        await api.submitAnswer("fire_goal", userMsg);
        await api.setGoal("Retirement FIRE", parseFloat(userMsg.replace(/[^0-9.]/g, '')) || 50000000); 
        
        setChatLog(prev => [...prev, { isAI: true, text: `Crunching numbers...` }]);
        
        const firePlanRes = await api.submitAnswer("trigger_fire_plan", "true"); 
        const rd = firePlanRes.roadmap || {};
        
        setChatLog(prev => [...prev, { 
            isAI: true, 
            text: rd.message || `Roadmap Generated! If you invest just ₹${Math.max(10000, ((profile.monthly_income || 100000)*0.3)).toFixed(0)} every month in an index fund, you will hit your FIRE goal in 15 years.`,
            cards: [
              { type: "plan", title: "FIRE Blueprint", content: `**Target Age:** ${rd.target_age || 'N/A'}\n**Required SIP:** ₹${rd.sip_amount || 0}/mo` }
            ]
        }]);
        setStep(5);
      }
    } catch (err) {
      setChatLog(prev => [...prev, { isAI: true, text: `Sorry, arithmetic error on my end. Say that again?` }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-soft p-4 md:p-8">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-ql-dark">SIP & FIRE Planner</h1>
         <p className="text-sm text-slate-500">Calculate your Financial Independence roadmap.</p>
      </div>

      <div className="flex-grow overflow-y-auto chat-scroll flex flex-col gap-4 mb-4">
        <AnimatePresence>
            {chatLog.map((msg, idx) => (
             <MessageBubble key={idx} message={msg.text} isAI={msg.isAI} cards={msg.cards} />
            ))}
        </AnimatePresence>
        {loading && <LoadingSpinner />}
      </div>
      
      {step < 5 && (
        <form onSubmit={handleSend} className="flex gap-2">
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Type your answer..."
             className="flex-grow bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-ql-dark focus:ring-2 outline-none focus:ring-ql-primary"
             disabled={loading}
           />
           <button type="submit" disabled={!input || loading} className="bg-ql-dark text-white px-6 font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50">
             Next
           </button>
        </form>
      )}
      {step === 5 && (
        <div className="text-center p-4 bg-green-50 rounded-xl text-green-700 font-bold border border-green-200">
           FIRE Roadmap Active. Check your Command Center!
        </div>
      )}
    </div>
  );
}
