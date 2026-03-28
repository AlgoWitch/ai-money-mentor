import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';
import Phase2Upload from '../components/Phase2Upload';
import { api } from '../utils/api';

export default function MainChat() {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [quizStep, setQuizStep] = useState(0); // 0: Age, 1: City, 2: Goal, 3: Chat Active
  
  const scrollRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await api.fetchChatHistory();
      if (history && history.length > 0) {
          const formatted = history.map(msg => ({
            isAI: msg.role === 'ai',
            text: msg.message,
            cards: msg.cards || []
          }));
          setChatHistory(formatted);
          setQuizStep(3); // History exists, skip onboarding
      } else {
          setChatHistory([{ 
            isAI: true, 
            text: `Namaste! I'm Niveshak, your AI Wealth Mentor. To provide bespoke advice, let's start quickly. What is your Age?`,
            cards: []
          }]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading, showUploader]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setChatHistory(prev => [...prev, { isAI: false, text: userMsg }]);
    setLoading(true);

    try {
        if (quizStep === 0) {
            await api.submitAnswer("age", parseInt(userMsg) || userMsg);
            setChatHistory(prev => [...prev, { isAI: true, text: "Got it. And what City do you live in?" }]);
            setQuizStep(1);
        } else if (quizStep === 1) {
            await api.submitAnswer("city", userMsg);
            setChatHistory(prev => [...prev, { isAI: true, text: "Beautiful. Finally, what is your primary Financial Goal?" }]);
            setQuizStep(2);
        } else if (quizStep === 2) {
            await api.submitAnswer("goal", userMsg);
            setChatHistory(prev => [...prev, { isAI: true, text: "Perfect. Now, please click the Paperclip icon below to Paste an SMS or Upload a Bank Statement so I can analyze your 6 Wealth Dimensions." }]);
            setQuizStep(3);
        } else {
            // Open Groq Chat
            const res = await api.chat(userMsg);
            setChatHistory(prev => [...prev, { 
              isAI: true, 
              text: res.text,
              cards: res.cards || []
            }]);
        }
    } catch (err) {
        setChatHistory(prev => [...prev, { isAI: true, text: "Wait, I lost my train of thought. Run that by me again?" }]);
    }
    setLoading(false);
  };

  const handleDocAnalysis = async (content, isText = false) => {
    setShowUploader(false);
    setLoading(true);
    setChatHistory(prev => [...prev, { isAI: false, text: isText ? "Sent an SMS log for analysis." : "Uploaded a financial document." }]);
    try {
      if (isText) {
        const data = await api.processSms(content);
        setChatHistory(prev => [...prev, { isAI: true, text: data.nudge || "I've analyzed that SMS." }]);
      } else {
        const data = await api.analyzeProfile(content);
        setChatHistory(prev => [...prev, { 
           isAI: true, 
           text: "I've successfully extracted the 6 Wealth Dimensions from your document! You can view the full report in the Command Center.",
           cards: [
             { type: "plan", title: "Document Verified", content: "Your evolving profile has been securely synced." }
           ]
        }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { isAI: true, text: "I couldn't verify that cleanly. Please ensure the text is clear." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] sm:bg-transparent relative rounded-3xl overflow-hidden shadow-inner-soft">
       {/* Simple header mimicking a mobile chat bar */}
       <header className="bg-ql-dark text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-ql-primary flex items-center justify-center font-bold text-ql-dark">AI</div>
             <div>
                <h2 className="font-bold text-sm tracking-wide">Niveshak Secure Chat</h2>
                <p className="text-xs text-white/60 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Mentor Online</p>
             </div>
          </div>
       </header>

      {/* CHAT AREA */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-6 chat-scroll relative flex flex-col gap-3">
        <AnimatePresence>
            {chatHistory.map((msg, idx) => (
             <MessageBubble key={idx} message={msg.text} isAI={msg.isAI} cards={msg.cards} />
            ))}
        </AnimatePresence>
        
        {loading && <LoadingSpinner />}

        {showUploader && !loading && (
           <div className="mt-4 animate-in slide-in-from-bottom-5">
              <Phase2Upload onUpload={handleDocAnalysis} />
              <button 
                 onClick={() => setShowUploader(false)} 
                 className="mt-2 w-full text-center text-xs text-slate-500 hover:text-ql-dark py-2"
              >
                 Cancel
              </button>
           </div>
        )}
      </main>

      {/* INPUT AREA */}
      <footer className="flex-shrink-0 p-3 bg-white border-t border-slate-200 shadow-soft">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
             <button title="Upload Document or Paste SMS" type="button" onClick={() => setShowUploader(!showUploader)} className={`p-2.5 transition-colors rounded-full ${showUploader ? 'bg-ql-primary text-ql-dark' : 'text-slate-400 hover:bg-slate-100 hover:text-ql-dark'}`}>
                <Paperclip size={20} />
             </button>
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={quizStep < 3 ? "Type your answer..." : "Message Niveshak..."}
               className="flex-grow bg-[#F0F2F5] px-4 py-3 rounded-full text-ql-dark placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ql-primary/50"
               disabled={loading}
             />
             <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="p-3 rounded-full bg-ql-dark text-white shadow-md disabled:bg-slate-300 disabled:shadow-none hover:bg-black transition-colors"
              >
                <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
             </button>
          </form>
      </footer>
    </div>
  );
}
