import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import MessageBubble from './components/MessageBubble';
import LoadingSpinner from './components/LoadingSpinner';
import Phase2Upload from './components/Phase2Upload';
import Phase3Insights from './components/Phase3Insights';
import { api } from './utils/api';

function App() {
  const [phase, setPhase] = useState(1); // 1: Onboarding, 2: Document Input, 3: Reveal
  const [chatHistory, setChatHistory] = useState([
    { isAI: true, text: "Namaste! I'm Niveshak, your AI Money Mentor. To give you the best advice, I'll need a tiny bit of context. First, what's your age?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [quizStep, setQuizStep] = useState(0); // 0: Age, 1: City, 2: Goal, 3: Done
  const [profile, setProfile] = useState({ age: "", city: "", goal: "" });
  const [insightData, setInsightData] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading, phase]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI
    setChatHistory(prev => [...prev, { isAI: false, text: userMsg }]);
    setLoading(true);

    if (phase === 1) {
      await handleQuizFlow(userMsg);
    } else if (phase === 2) {
      // Paste SMS text handling
      await handleDocAnalysis(userMsg, true);
    }
    setLoading(false);
  };

  const handleQuizFlow = async (userMsg) => {
    try {
      if (quizStep === 0) {
        setProfile(prev => ({ ...prev, age: userMsg }));
        await api.submitAnswer("age", userMsg);
        setChatHistory(prev => [...prev, { isAI: true, text: `Great. And which city do you live in?` }]);
        setQuizStep(1);
      } else if (quizStep === 1) {
        setProfile(prev => ({ ...prev, city: userMsg }));
        await api.submitAnswer("city_type", userMsg);
        setChatHistory(prev => [...prev, { isAI: true, text: `Got it. Finally, what's your main financial goal right now? (e.g., Buy a bike, Emergency fund, Travel)` }]);
        setQuizStep(2);
      } else if (quizStep === 2) {
        setProfile(prev => ({ ...prev, goal: userMsg }));
        await api.setGoal(userMsg, 50000); // Default target amount for demo
        await api.submitAnswer("goal", userMsg);
        setChatHistory(prev => [...prev, { isAI: true, text: `Awesome. Now, to help me give you actionable advice, I need to understand your cash flow.` }]);
        setQuizStep(3);
        
        setTimeout(() => {
           setPhase(2);
        }, 1500);
      }
    } catch (error) {
       setChatHistory(prev => [...prev, { isAI: true, text: "I had a tiny hiccup saving that. Can you tell me again?" }]);
    }
  };

  const handleDocAnalysis = async (content, isText = false) => {
    setLoading(true);
    try {
      let data;
      if (isText) {
        data = await api.processSms(content);
      } else {
        data = await api.analyzeProfile(content);
      }
      
      // Fetch the final health check dashboard metrics
      const healthData = await api.healthCheck();
      
      setInsightData({
          ...healthData,
          nudge: data.nudge || data.ai_verification || "Ready to level up your finances?"
      });

      setPhase(3);
    } catch (e) {
      setChatHistory(prev => [...prev, { isAI: true, text: "Hmm, I couldn't read that properly. Could you try again?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-chat mx-auto bg-slate-50 sm:bg-transparent">
      
      {/* HEADER */}
      <header className="flex-shrink-0 p-4 sm:pt-8 pb-4 flex items-center justify-between z-10 sticky top-0 bg-ql-bg/80 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-white/20">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ql-dark flex items-center gap-2">
            Niveshak AI
            <span className="bg-ql-primary text-ql-dark text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-sm text-ql-text/80 font-medium">Your Private Wealth Mentor</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex gap-1.5 sm:gap-2 items-center">
            <span className={`stage-pill ${phase >= 1 ? 'stage-pill-active' : 'stage-pill-idle'}`}>Setup</span>
            <span className="text-slate-300 text-xs">→</span>
            <span className={`stage-pill ${phase >= 2 ? 'stage-pill-active' : (phase > 2 ? 'stage-pill-done' : 'stage-pill-idle')}`}>Verify</span>
            <span className="text-slate-300 text-xs">→</span>
            <span className={`stage-pill ${phase === 3 ? 'stage-pill-active' : 'stage-pill-idle'}`}>Insights</span>
        </div>
      </header>

      {/* CHAT AREA */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-6 chat-scroll relative flex flex-col gap-2">
        {chatHistory.map((msg, idx) => (
          <MessageBubble key={idx} message={msg.text} isAI={msg.isAI} />
        ))}
        
        {loading && <LoadingSpinner />}

        {phase === 2 && !loading && (
           <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-4">
              <Phase2Upload onUpload={handleDocAnalysis} />
           </motion.div>
        )}

        {phase === 3 && !loading && insightData && (
           <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="mt-4 mb-8">
              <Phase3Insights data={insightData} userProfile={profile} />
           </motion.div>
        )}
      </main>

      {/* INPUT AREA */}
      {phase !== 3 && (
        <footer className="flex-shrink-0 p-4 bg-white/50 backdrop-blur-md border-t border-slate-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-2 py-2 shadow-soft transition-all focus-within:border-ql-primary focus-within:ring-2 focus-within:ring-ql-primary/20"
          >
             <button type="button" className="p-2 text-slate-400 hover:text-ql-dark transition-colors rounded-full hover:bg-slate-50">
                <Paperclip size={20} />
             </button>
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={phase === 1 ? "Type your response..." : "Paste your SMS or statement text here..."}
               className="flex-grow bg-transparent border-none outline-none text-ql-text placeholder-slate-400 font-medium"
               disabled={loading || phase === 3}
             />
             <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-full bg-ql-dark text-white shadow-md disabled:bg-slate-300 disabled:shadow-none hover:bg-black transition-colors"
              >
                <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
             </button>
          </form>
          <div className="text-center mt-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
            Bank-Level Encryption <span className="w-1 h-1 bg-green-400 rounded-full inline-block"></span> Local AI
          </div>
        </footer>
      )}

    </div>
  );
}

export default App;