import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-navy tracking-finance uppercase">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Sign in to your AI Money Mentor tracking dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-premium sm:rounded-2xl sm:px-10 border border-slate/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-md">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-navy">Email address</label>
              <div className="mt-1">
                <input type="email" required onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-2 border border-slate/20 rounded-lg shadow-sm placeholder-slate/40 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">Password</label>
              <div className="mt-1">
                <input type="password" required onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-2 border border-slate/20 rounded-lg shadow-sm placeholder-slate/40 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold tracking-wide text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors disabled:opacity-50">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate">Don't have an account? </span>
            <Link to="/register" className="font-medium text-gold hover:text-gold/80 hover:underline transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
