import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const email = user?.email || 'analyst@domain.com';

  // Derive real account creation date from Firebase Auth metadata
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      })
    : null;

  const [stats, setStats] = useState({ total: 0, fake: 0, real: 0, misleading: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats({ total: 0, fake: 0, real: 0, misleading: 0 });
        return;
      }

      try {
        const q = query(collection(db, 'searches'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        let total = snapshot.size;
        let fake = 0, real = 0, misleading = 0;
        snapshot.forEach((doc) => {
          const v = (doc.data().verdict || '').toUpperCase();
          if (v === 'FAKE') fake++;
          else if (v === 'REAL') real++;
          else if (v === 'MISLEADING') misleading++;
        });
        setStats({ total, fake, real, misleading });
      } catch (err) {
        console.error('Profile stats fetch error:', err);
      }
    };
    fetchStats();
  }, [user]);
  const initial = email.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-body-md text-body-md">
      {/* Main Content */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        {/* Profile Section */}
        <section className="flex justify-center">
          <div className="card-bg rounded-lg p-stack-md w-full max-w-md flex flex-col items-center text-center glow-true border border-outline-variant">
            <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display-lg text-display-lg mb-stack-sm font-bold">
              {initial}
            </div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-base text-on-surface">
              {email}
            </h1>
            {memberSince && (
              <p className="font-body-md text-body-md text-on-surface-variant">Member since {memberSince}</p>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="flex flex-col gap-stack-md">
          <h2 className="font-headline-md text-headline-md border-b border-outline-variant pb-base text-on-surface">
            Your Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Total Checked */}
            <div className="card-bg rounded-lg p-stack-md border border-outline-variant flex flex-col gap-base">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Checked</span>
                <span className="font-display-lg text-display-lg text-on-surface">{stats.total}</span>
            </div>
            {/* Fake Detected */}
            <div className="card-bg rounded-lg p-stack-md border border-outline-variant flex flex-col gap-base glow-false relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase pl-2">Fake Detected</span>
                <span className="font-display-lg text-display-lg text-error pl-2">{stats.fake}</span>
            </div>
            {/* Real Verified */}
            <div className="card-bg rounded-lg p-stack-md border border-outline-variant flex flex-col gap-base glow-true relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase pl-2">Real Verified</span>
                <span className="font-display-lg text-display-lg text-primary pl-2">{stats.real}</span>
            </div>
          </div>
        </section>

        {/* Verdicts Breakdown Section */}
        <section className="flex flex-col gap-stack-md">
          <div className="card-bg rounded-lg p-stack-md border border-outline-variant">
            <h3 className="font-headline-md text-headline-md mb-stack-md text-on-surface">Verdicts Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
              <div className="flex items-center justify-between p-base bg-surface-container rounded border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary font-status-badge text-status-badge rounded-full border border-primary/20 glow-true">
                    REAL
                  </span>
                </div>
                <span className="font-body-lg text-body-lg font-bold text-on-surface">{stats.real}</span>
              </div>
              <div className="flex items-center justify-between p-base bg-surface-container rounded border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-error/10 text-error font-status-badge text-status-badge rounded-full border border-error/20 glow-false">
                    FAKE
                  </span>
                </div>
                <span className="font-body-lg text-body-lg font-bold text-on-surface">{stats.fake}</span>
              </div>
              <div className="flex items-center justify-between p-base bg-surface-container rounded border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-tertiary-container/10 text-tertiary font-status-badge text-status-badge rounded-full border border-tertiary/20 glow-warning">
                    MISLEADING
                  </span>
                </div>
                <span className="font-body-lg text-body-lg font-bold text-on-surface">{stats.misleading}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Logout Action */}
        <section className="mt-auto pt-stack-lg">
          <button
            onClick={handleLogout}
            className="mx-auto flex bg-error text-on-error font-label-sm text-label-sm px-stack-md py-2 rounded-full font-bold hover:bg-error-container hover:text-on-error-container transition-colors duration-200 border border-error-container cursor-pointer uppercase"
          >
            Logout
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim dark:bg-surface-dim border-t border-outline-variant full-width bottom w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-md mt-stack-lg">
        <div className="text-on-surface-variant font-body-md text-body-md text-center md:text-left">
          © 2024 TruthCheck AI. Clinical-grade verification.
        </div>
        <div className="flex flex-wrap justify-center gap-stack-md font-label-sm text-label-sm">
          <a className="text-on-surface-variant hover:text-primary underline transition-all" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant hover:text-primary underline transition-all" href="#">Terms of Service</a>
          <a className="text-on-surface-variant hover:text-primary underline transition-all" href="#">Security Disclosure</a>
          <a className="text-on-surface-variant hover:text-primary underline transition-all" href="#">API Documentation</a>
        </div>
      </footer>
    </div>
  );
}
