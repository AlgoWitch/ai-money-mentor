import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full mb-4 justify-start"
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        <div className="w-8 h-8 rounded-full bg-ql-primary flex items-center justify-center text-ql-dark shadow-soft">
          <div className="w-4 h-4 rounded-full border-2 border-ql-dark border-t-transparent animate-spin"></div>
        </div>
      </div>
      <div className="relative px-4 py-3 bg-white text-ql-text rounded-2xl rounded-tl-none border border-ql-bg shadow-soft flex items-center gap-1.5 h-10 my-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-ql-accent animate-pulse-dot"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-ql-accent animate-pulse-dot" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-1.5 h-1.5 rounded-full bg-ql-accent animate-pulse-dot" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </motion.div>
  );
}
