import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Auth error:", err);
      // Clean up common firebase error messages
      let msg = err.message || "Authentication failed.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) {
        msg = "Invalid email or password.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "An account with this email already exists.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <main className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-[#1a1a1a] rounded-xl p-stack-md relative overflow-hidden border border-outline-variant">
          {/* Decorative minimal glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container opacity-10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-stack-md relative z-10">
            <h1 className="font-display-lg text-display-lg text-primary mb-base tracking-tighter">TruthCheck AI</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Join the truth movement.</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-surface-container-highest p-1 rounded-lg mb-stack-md relative z-10">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 font-label-sm text-label-sm rounded shadow-sm transition-all ${
                isLogin
                  ? 'text-background bg-primary-container font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 font-label-sm text-label-sm rounded shadow-sm transition-all ${
                !isLogin
                  ? 'text-background bg-primary-container font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error/40 text-error rounded text-label-sm font-label-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-stack-sm relative z-10" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  className="w-full bg-black/20 border border-[#262626] rounded-lg pl-10 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-0 focus:outline-none focus:shadow-[0_0_12px_rgba(0,200,83,0.2)] transition-all"
                  id="email"
                  placeholder="analyst@domain.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="w-full bg-black/20 border border-[#262626] rounded-lg pl-10 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-0 focus:outline-none focus:shadow-[0_0_12px_rgba(0,200,83,0.2)] transition-all"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#">
                Forgot password?
              </a>
            </div>

            <button
              className="w-full bg-primary-container hover:bg-primary text-[#000000] font-headline-md text-headline-md py-3 rounded-lg mt-stack-md transition-colors glow-status-true flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {isLogin ? 'Access System' : 'Create Account'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
