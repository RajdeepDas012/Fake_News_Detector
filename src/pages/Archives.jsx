import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Archives() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};

    const loadHistory = async () => {
      if (!user) {
        setAnalyses([]);
        setLoading(false);
        return;
      }

      try {
        console.log("Firestore read START: Listening to 'searches' for uid:", user.uid);
        const searchesRef = collection(db, 'searches');
        const q = query(searchesRef, where('uid', '==', user.uid), orderBy('timestamp', 'desc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
          console.log(`Firestore read SUCCESS: Received ${snapshot.docs.length} records for user`);
          const items = snapshot.docs.map((doc) => {
            const data = doc.data();
            const v = (data.verdict || 'FAKE').toUpperCase();
            let type = 'false';
            if (v === 'REAL') type = 'true';
            if (v === 'MISLEADING') type = 'warning';

            const ts = data.timestamp || data.createdAt;

            return {
              id: doc.id,
              title: data.headline || data.text || data.title || 'Untitled Article Analysis',
              date: ts?.toDate
                ? ts.toDate().toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })
                : 'Just now',
              confidence: data.confidence ?? data.confidence_score ?? 85,
              summary: data.reason || data.summary || '',
              verdict: v,
              type,
              rawTimestamp: ts?.toDate ? ts.toDate().getTime() : Date.now()
            };
          });
          setAnalyses(items);
          setLoading(false);
        }, async (error) => {
          console.warn("Firestore ordered snapshot query notice, running fallback query:", error);
          
          try {
            const fallbackQ = query(searchesRef, where('uid', '==', user.uid));
            const rawSnapshot = await getDocs(fallbackQ);
            let items = rawSnapshot.docs.map((doc) => {
              const data = doc.data();
              const v = (data.verdict || 'FAKE').toUpperCase();
              let type = 'false';
              if (v === 'REAL') type = 'true';
              if (v === 'MISLEADING') type = 'warning';

              const ts = data.timestamp || data.createdAt;

              return {
                id: doc.id,
                title: data.headline || data.text || data.title || 'Untitled Article Analysis',
                date: ts?.toDate
                  ? ts.toDate().toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })
                  : 'Just now',
                confidence: data.confidence ?? data.confidence_score ?? 85,
                summary: data.reason || data.summary || '',
                verdict: v,
                type,
                rawTimestamp: ts?.toDate ? ts.toDate().getTime() : Date.now()
              };
            });
            
            items.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
            setAnalyses(items);
          } catch (fallbackErr) {
            console.error("Firestore read ERROR:", fallbackErr);
          } finally {
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Firestore initialization error in Archives:", err);
        setLoading(false);
      }
    };

    loadHistory();

    return () => unsubscribe();
  }, [user]);

  const filteredAnalyses = analyses.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.verdict.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col bg-background text-on-surface">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-md">

        {/* Page Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
              Your Analysis History
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Full archive of all verified articles and forensic reports
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-surface-variant/50 border border-outline-variant rounded-lg px-4 py-2.5 flex items-center gap-3 w-full md:w-80 focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              className="bg-transparent border-none outline-none text-label-sm font-label-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 p-0 w-full"
              placeholder="Filter by headline or verdict..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </header>

        {/* Results Count */}
        {!loading && analyses.length > 0 && (
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>
              {searchTerm
                ? `${filteredAnalyses.length} result${filteredAnalyses.length !== 1 ? 's' : ''} for "${searchTerm}"`
                : `${filteredAnalyses.length} total record${filteredAnalyses.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* Content */}
        <section className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
              Loading history…
            </div>
          ) : analyses.length === 0 ? (
            /* Empty state — no hardcoded fallback */
            <div className="bg-[#1a1a1a] border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl text-outline">history_toggle_off</span>
              <p className="text-body-lg text-on-surface-variant">
                No history yet. Start verifying articles!
              </p>
              <button
                onClick={() => navigate('/verify')}
                className="mt-1 bg-primary-container text-black px-6 py-2.5 rounded-full font-label-sm font-bold uppercase tracking-wider hover:bg-primary transition-all cursor-pointer"
              >
                Verify an Article
              </button>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            /* Search returned no matches */
            <div className="bg-[#1a1a1a] border border-outline-variant rounded-xl p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-outline block mb-3">search_off</span>
              <p className="text-body-lg text-on-surface-variant">
                No records matching <strong className="text-on-surface">"{searchTerm}"</strong> in your history.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary text-label-sm hover:underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/verify', { state: { initialText: item.title } })}
                className={`bg-[#1a1a1a] border border-outline-variant rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 status-bar-${item.type} hover:bg-surface-variant/30 transition-all cursor-pointer`}
              >
                {/* Left: Headline + Date */}
                <div className="flex-grow">
                  <h2 className="text-body-lg font-bold text-on-surface mb-2 hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                    Date checked: {item.date}
                  </span>
                </div>

                {/* Right: Confidence + Badge */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-on-surface-variant uppercase font-label-sm">Confidence</p>
                    <p className={`text-headline-md font-headline-md font-bold ${
                      item.type === 'true' ? 'text-primary-container' :
                      item.type === 'false' ? 'text-error' :
                      'text-tertiary'
                    }`}>{item.confidence}%</p>
                  </div>

                  <span className={`badge-${item.type} text-status-badge font-status-badge px-4 py-2 rounded-full uppercase flex items-center gap-1.5 min-w-[130px] justify-center`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {item.type === 'false' ? 'cancel' : item.type === 'true' ? 'check_circle' : 'warning'}
                    </span>
                    {item.verdict}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest flex justify-between items-center w-full px-margin-desktop py-4 border-t border-outline-variant mt-auto">
        <span className="text-label-sm text-on-surface-variant">
          TruthCheck AI Archives{!loading && analyses.length > 0 ? ` • ${analyses.length} Records` : ''}
        </span>
        <span className="text-label-sm text-on-surface-variant">© 2024 TruthCheck AI</span>
      </footer>
    </div>
  );
}
