import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userEmail = user?.email || 'analyst@domain.com';

  const [stats, setStats] = useState({ total: 0, fake: 0, real: 0 });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch ALL analyses to compute stats
        const allQ = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid)
        );
        const allSnapshot = await getDocs(allQ);

        let total = allSnapshot.size;
        let fake = 0, real = 0;
        allSnapshot.forEach((doc) => {
          const v = (doc.data().verdict || '').toUpperCase();
          if (v === 'FAKE') fake++;
          else if (v === 'REAL') real++;
        });
        setStats({ total, fake, real });

        // Fetch recent 3 analyses
        const recentQ = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const recentSnapshot = await getDocs(recentQ);
        const items = recentSnapshot.docs.map((doc) => {
          const data = doc.data();
          const v = (data.verdict || 'FAKE').toUpperCase();
          let type = 'false';
          if (v === 'REAL') type = 'true';
          if (v === 'MISLEADING') type = 'warning';

          return {
            id: doc.id,
            title: data.title || 'Untitled Article',
            date: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })
              : 'Today',
            score: `${data.confidence ?? 85}%`,
            verdict: data.verdict || 'Fake',
            type,
          };
        });
        setRecentAnalyses(items);
      } catch (err) {
        console.log('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col bg-background text-on-surface">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">

        {/* Welcome Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md bg-surface-level-1 p-6 rounded-xl border border-outline-variant">
          <div>
            <span className="text-label-sm font-label-sm text-primary uppercase font-bold tracking-wider">Dashboard Overview</span>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mt-1">
              Welcome back, <span className="text-primary">{userEmail}</span>
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              System Status: <span className="text-primary font-bold">Operational</span>. Ready for verification tasks.
            </p>
          </div>

          <button
            onClick={() => navigate('/verify')}
            className="w-full md:w-auto bg-primary-container text-black px-8 py-4 rounded-xl font-headline-md text-body-lg font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-[0_0_20px_rgba(0,200,83,0.3)] glow-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Check New Article
          </button>
        </header>

        {/* 3 Quick Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="surface-card rounded-xl p-6 border border-outline-variant flex flex-col justify-between gap-base hover:glow-primary transition-all">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Checked</span>
              <span className="material-symbols-outlined text-primary">find_in_page</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface font-bold">
                {loading ? '—' : stats.total}
              </span>
              <span className="text-label-sm text-on-surface-variant">Articles</span>
            </div>
          </div>

          <div className="surface-card rounded-xl p-6 border border-outline-variant flex flex-col justify-between gap-base glow-false relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="flex justify-between items-center text-on-surface-variant pl-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Fake Detected</span>
              <span className="material-symbols-outlined text-error">cancel</span>
            </div>
            <div className="flex items-baseline gap-2 pl-2">
              <span className="font-display-lg text-display-lg text-error font-bold">
                {loading ? '—' : stats.fake}
              </span>
              <span className="text-label-sm text-on-surface-variant">Flawed claims</span>
            </div>
          </div>

          <div className="surface-card rounded-xl p-6 border border-outline-variant flex flex-col justify-between gap-base glow-true relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex justify-between items-center text-on-surface-variant pl-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Real Verified</span>
              <span className="material-symbols-outlined text-primary">check_circle</span>
            </div>
            <div className="flex items-baseline gap-2 pl-2">
              <span className="font-display-lg text-display-lg text-primary font-bold">
                {loading ? '—' : stats.real}
              </span>
              <span className="text-label-sm text-on-surface-variant">Authenticated</span>
            </div>
          </div>
        </section>

        {/* Recent 3 Analyses */}
        <section className="surface-card rounded-xl p-6 border border-outline-variant">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">Recent Verifications</h2>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Latest 3 analyses</p>
            </div>
            <Link
              to="/archives"
              className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1 uppercase font-bold"
            >
              View Full History ({stats.total})
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
              Loading recent analyses…
            </div>
          ) : recentAnalyses.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <span className="material-symbols-outlined text-5xl text-outline">inbox</span>
              <p className="text-body-lg text-on-surface-variant">No analyses yet. Check your first article!</p>
              <button
                onClick={() => navigate('/verify')}
                className="mt-1 bg-primary-container text-black px-6 py-2.5 rounded-full font-label-sm font-bold uppercase tracking-wider hover:bg-primary transition-all cursor-pointer"
              >
                Start Verifying
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {recentAnalyses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/verify', { state: { initialText: item.title } })}
                  className={`surface-level-1 border border-outline-variant rounded-xl p-5 flex flex-col justify-between gap-4 status-bar-${item.type} hover:bg-surface-variant/30 transition-all cursor-pointer`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`badge-${item.type} text-status-badge font-status-badge px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 text-[12px]`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {item.type === 'false' ? 'cancel' : item.type === 'true' ? 'check_circle' : 'warning'}
                        </span>
                        {item.verdict}
                      </span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant text-[12px]">{item.date}</span>
                    </div>
                    <h3 className="text-body-md font-bold text-on-surface line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/40 text-label-sm text-on-surface-variant">
                    <span>Confidence: <strong className="text-on-surface">{item.score}</strong></span>
                    <span className="text-primary text-[12px] flex items-center">
                      Inspect <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-stack-lg border-t border-outline-variant mt-auto">
        <div>
          <span className="text-headline-md font-extrabold text-primary block mb-1">TruthCheck AI</span>
          <p className="text-body-md text-on-surface-variant">© 2024 TruthCheck AI. Clinical Verification for a Digital Age.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/verify" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Verify</Link>
          <Link to="/archives" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Archives</Link>
          <Link to="/profile" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Profile</Link>
        </div>
      </footer>
    </div>
  );
}
