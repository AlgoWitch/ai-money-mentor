import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

export default function MessageBubble({ message, isAI }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-ql-primary flex items-center justify-center text-ql-dark shadow-soft">
            <Sparkles size={16} />
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`relative max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-soft ${
          isAI
            ? 'bg-white text-ql-text rounded-2xl rounded-tl-none border border-ql-bg'
            : 'bg-ql-dark text-white rounded-2xl rounded-tr-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{message}</div>
      </div>

      {/* User Avatar (Optional, currently hidden for cleaner look but logic is here) */}
      {!isAI && (
        <div className="flex-shrink-0 ml-3 mt-1 hidden sm:block">
          <div className="w-8 h-8 rounded-full bg-ql-card flex items-center justify-center text-ql-dark opacity-50">
            <User size={16} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
