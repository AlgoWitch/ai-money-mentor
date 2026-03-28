import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Shield } from 'lucide-react';
import { api } from '../utils/api';

export default function AuthModal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Prepare forms data for OAuth2 request
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);
        
        await api.login(params);
        onLoginSuccess();
      } else {
        await api.signup(formData.email, formData.password, formData.name);
        // Auto-login after signup
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);
        await api.login(params);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ql-dark/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-ql-bg rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-white/40"
      >
        <div className="p-8 text-center bg-white rounded-b-3xl shadow-soft relative z-10">
           <div className="w-12 h-12 bg-ql-primary mx-auto rounded-full flex items-center justify-center mb-4 shadow-soft">
              <Shield className="text-ql-dark" size={24} />
           </div>
           <h2 className="text-2xl font-bold text-ql-dark tracking-tight">
             {isLogin ? 'Welcome Back' : 'Private Wealth Access'}
           </h2>
           <p className="text-sm text-slate-500 mt-2">
             {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to build your personalized FIRE roadmap.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
             {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-white/50 pl-11 pr-4 py-3 rounded-2xl text-ql-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ql-primary/50 shadow-inner-soft"
                  />
                </div>
             )}
             
             <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-white/50 pl-11 pr-4 py-3 rounded-2xl text-ql-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ql-primary/50 shadow-inner-soft"
                />
             </div>
             
             <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white border border-white/50 pl-11 pr-4 py-3 rounded-2xl text-ql-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ql-primary/50 shadow-inner-soft"
                />
             </div>
          </div>

          <button 
             type="submit" 
             disabled={loading}
             className="w-full mt-6 bg-ql-dark text-white font-semibold py-3.5 rounded-2xl shadow-soft hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {loading ? 'Authenticating...' : (isLogin ? 'Secure Login' : 'Create Account')}
          </button>

          <div className="mt-6 text-center">
             <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-sm text-slate-500 hover:text-ql-dark transition-colors"
             >
                {isLogin ? "Don't have an account? Sign up" : "Already have access? Log in"}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
