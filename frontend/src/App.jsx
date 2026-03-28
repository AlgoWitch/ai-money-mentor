import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './components/MessageBubble';
import LoadingSpinner from './components/LoadingSpinner';
import Phase2Upload from './components/Phase2Upload';
import CommandCenter from './components/CommandCenter';
import AuthModal from './components/AuthModal';
import { api } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const [phase, setPhase] = useState(1); // 1: Onboarding, 2: Chat/Proof, 3: Command Center
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  
  // 5-Step FIRE Planner
  const [quizStep, setQuizStep] = useState(0); 
  const [profile, setProfile] = useState({});
  const [insightData, setInsightData] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (localStorage.getItem('niveshak_token')) {
        const userData = await api.getMe();
        setUser(userData.profile);
        setIsAuthenticated(true);
        await initApp(userData);
      }
    } catch {
      localStorage.removeItem('niveshak_token');
      setIsAuthenticated(false);
    }
  };

  const initApp = async (userData) => {
      setLoading(true);
      try {
        setProfile({
            age: userData.profile?.age || "",
            monthly_income: userData.profile?.monthly_income || "",
            fire_goal: userData.profile?.fire_goal || ""
        });

        const history = await api.fetchChatHistory();
        if (history && history.length > 0) {
          const formatted = history.map(msg => ({
            isAI: msg.role === 'ai',
            text: msg.message,
            cards: msg.cards || []
          }));
          setChatHistory(formatted);
          setPhase(2); // Jump straight to chat if history exists
        } else {
          startChat(userData.profile?.name);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
  };

  const startChat = (name) => {
    setChatHistory([{ 
      isAI: true, 
      text: `Namaste ${name || ''}! I'm Niveshak, your Private Wealth Concierge. Let's build your FIRE (Financial Independence, Retire Early) roadmap. First, what is your current age?`,
      cards: []
    }]);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setChatHistory([]);
    setPhase(1);
    setQuizStep(0);
    setProfile({});
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading, phase]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setChatHistory(prev => [...prev, { isAI: false, text: userMsg }]);
    setLoading(true);

    if (phase === 1) {
      await handleQuizFlow(userMsg);
    } else if (phase === 2) {
      // Integrated AI Chat Logic
      try {
        const res = await api.chat(userMsg);
        setChatHistory(prev => [...prev, { 
          isAI: true, 
          text: res.text,
          cards: res.cards || []
        }]);
      } catch (err) {
        setChatHistory(prev => [...prev, { isAI: true, text: "Backend is taking a logic break. Try again?" }]);
      }
    }
    setLoading(false);
  };

  const handleQuizFlow = async (userMsg) => {
    try {
      if (quizStep === 0) {
        const val = parseInt(userMsg);
        setProfile(prev => ({ ...prev, age: val || 30 }));
        await api.submitAnswer("age", val || 30);
        setChatHistory(prev => [...prev, { isAI: true, text: `Excellent. And what is your total monthly income (in ₹)?` }]);
        setQuizStep(1);
      } else if (quizStep === 1) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, monthly_income: val || 100000 }));
        await api.submitAnswer("monthly_income", val || 100000);
        setChatHistory(prev => [...prev, { isAI: true, text: `Got it. Roughly how much of that goes toward monthly expenses?` }]);
        setQuizStep(2);
      } else if (quizStep === 2) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, monthly_expenses: val || 50000 }));
        await api.submitAnswer("monthly_expenses", val || 50000);
        setChatHistory(prev => [...prev, { isAI: true, text: `Okay. And what are your total current savings or investments right now?` }]);
        setQuizStep(3);
      } else if (quizStep === 3) {
        const val = parseFloat(userMsg.replace(/[^0-9.]/g, ''));
        setProfile(prev => ({ ...prev, current_savings: val || 200000 }));
        await api.submitAnswer("current_savings", val || 200000);
        setChatHistory(prev => [...prev, { isAI: true, text: `Almost done. What is your 'FIRE' target number? (How much money do you want to retire with?)` }]);
        setQuizStep(4);
      } else if (quizStep === 4) {
        setProfile(prev => ({ ...prev, fire_goal: userMsg }));
        await api.submitAnswer("fire_goal", userMsg);
        await api.setGoal("Retirement FIRE", 50000000); 
        
        setChatHistory(prev => [...prev, { isAI: true, text: `Generating your personalized SIP Roadmap using Niveshak AI Engine...` }]);
        const firePlanRes = await api.submitAnswer("trigger_fire_plan", "true"); 
        
        setChatHistory(prev => [...prev, { 
            isAI: true, 
            text: `Roadmap Generated! Based on your profile:\n\nIf you invest just ₹${Math.max(10000, ((profile.monthly_income || 100000)*0.3)).toFixed(0)} every month in a broad index fund (expected 12% returns), you will hit your FIRE goal in approximately 15 years.\n\nNow, let's verify your income structure. You can ask me financial questions, or click the Dashboard button for unified views.` 
        }]);
        
        setQuizStep(5);
        setTimeout(() => setPhase(2), 2000);
      }
    } catch (error) {
       setChatHistory(prev => [...prev, { isAI: true, text: `I had a tiny hiccup. Could you say that again?` }]);
    }
  };

  const loadCommandCenter = async () => {
    setLoading(true);
    try {
      const healthData = await api.healthCheck();
      setInsightData({
          ...healthData,
          nudge: healthData.expert_advice || "Ready to command your wealth?"
      });
      setPhase(3);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { isAI: true, text: "Failed to load command center." }]);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <AuthModal onLoginSuccess={checkAuth} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-chat mx-auto bg-slate-50 sm:bg-transparent">
      
      {/* HEADER */}
      <header className="flex-shrink-0 p-4 sm:pt-8 pb-4 flex items-center justify-between z-10 sticky top-0 bg-ql-bg/80 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-white/20">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ql-dark flex items-center gap-2">
            Niveshak AI
            <span className="bg-ql-primary text-ql-dark text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">FIRE</span>
          </h1>
          <p className="text-sm text-ql-text/80 font-medium">{user?.name ? `Command Center • ${user.name}` : 'Private Wealth Mentor'}</p>
        </div>
        
        <div className="flex gap-2.5 sm:gap-4 items-center">
            <div className="hidden sm:flex gap-1.5 items-center">
                <span className={`stage-pill ${phase >= 1 ? 'stage-pill-active' : 'stage-pill-idle'}`}>Setup</span>
                <span className="text-slate-300 text-xs">→</span>
                <span onClick={() => phase === 3 && setPhase(2)} className={`stage-pill cursor-pointer ${phase === 2 ? 'stage-pill-active' : (phase === 3 ? 'stage-pill-done' : 'stage-pill-idle')}`}>Chat</span>
                <span className="text-slate-300 text-xs">→</span>
                <span onClick={loadCommandCenter} className={`stage-pill cursor-pointer ${phase === 3 ? 'stage-pill-active' : 'stage-pill-idle'}`}>Dashboard</span>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white rounded-full shadow-soft text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-6 chat-scroll relative flex flex-col gap-2">
        <AnimatePresence>
            {chatHistory.map((msg, idx) => (
             <MessageBubble key={idx} message={msg.text} isAI={msg.isAI} cards={msg.cards} />
            ))}
        </AnimatePresence>
        
        {loading && <LoadingSpinner />}

        {phase === 3 && !loading && insightData && (
           <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="mt-4 mb-8">
              <CommandCenter data={insightData} userProfile={profile} />
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
               placeholder={phase === 1 ? "Type your response..." : "Ask your mentor anything..."}
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
            Bank-Level Encryption <span className="w-1 h-1 bg-green-400 rounded-full inline-block"></span> Groq Llama 3.1
          </div>
        </footer>
      )}

    </div>
  );
}

export default App;