import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Landing() {
  const [newsUrl, setNewsUrl] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (newsUrl.trim()) {
      navigate('/verify', { state: { initialText: newsUrl } });
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md text-on-surface bg-background">
      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto py-stack-lg gap-stack-lg">
        {/* Hero Section */}
        <section className="text-center max-w-3xl flex flex-col items-center gap-stack-md py-20">
          <h1 className="text-display-lg font-display-lg text-on-surface">Detect Fake News Instantly</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant">Powered by advanced AI for clinical verification in the digital age</p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/auth"
              className="bg-primary-container text-black px-8 py-3 rounded-lg font-label-sm text-label-sm hover:opacity-80 transition-all duration-150 glow-primary font-bold uppercase"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* How It Works Section (Bento/Card Grid) */}
        <section className="w-full flex flex-col gap-stack-md py-stack-lg">
          <h2 className="text-headline-lg md:text-headline-lg font-headline-lg text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="surface-card rounded-xl p-8 flex flex-col gap-stack-sm border-l-4 border-primary hover:glow-primary transition-all duration-300">
              <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                content_paste
              </span>
              <h3 className="text-headline-md font-headline-md">Paste Article</h3>
              <p className="text-on-surface-variant text-body-md font-body-md">
                Input any URL or text snippet into our high-speed verification engine for immediate processing.
              </p>
            </div>
            {/* Card 2 */}
            <div className="surface-card rounded-xl p-8 flex flex-col gap-stack-sm border-l-4 border-secondary hover:glow-primary transition-all duration-300">
              <span className="material-symbols-outlined text-secondary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                analytics
              </span>
              <h3 className="text-headline-md font-headline-md">AI Analyses</h3>
              <p className="text-on-surface-variant text-body-md font-body-md">
                Our clinical-grade AI cross-references thousands of reliable databases and trusted sources in milliseconds.
              </p>
            </div>
            {/* Card 3 */}
            <div className="surface-card rounded-xl p-8 flex flex-col gap-stack-sm border-l-4 border-primary-container hover:glow-primary transition-all duration-300">
              <span className="material-symbols-outlined text-primary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <h3 className="text-headline-md font-headline-md">Get Verdict</h3>
              <p className="text-on-surface-variant text-body-md font-body-md">
                Receive a definitive confidence score and detailed breakdown of fact vs. fiction.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Demo Teaser (Glassmorphism Input) */}
        <section className="w-full max-w-4xl mx-auto py-stack-lg mb-20">
          <form onSubmit={handleVerify} className="bg-black/20 p-8 rounded-xl border border-surface-variant flex flex-col md:flex-row gap-4 items-center focus-within:border-primary focus-within:glow-primary transition-all duration-300">
            <input
              className="flex-grow bg-transparent border-none text-on-surface placeholder-on-surface-variant focus:ring-0 text-body-lg font-body-lg p-4 outline-none w-full"
              placeholder="Paste a suspicious news URL here..."
              type="text"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary-container text-black px-6 py-4 rounded-lg font-label-sm text-label-sm hover:opacity-80 transition-all duration-150 whitespace-nowrap flex items-center gap-2 font-bold uppercase"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Verify Now
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-stack-lg border-t border-outline-variant max-w-container-max mx-auto gap-4">
          <div className="text-label-sm font-label-sm text-on-surface-variant">
            © 2024 TruthCheck AI. Clinical Verification for a Digital Age.
          </div>
          <div className="flex gap-4">
            <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
            <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
            <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">API Docs</a>
            <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
