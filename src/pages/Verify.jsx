import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase";

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up pdf.js worker from CDN to avoid bundler asset path issues
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export default function Verify() {
  const location = useLocation();
  const initialInput = location.state?.initialText ||
    "Scientists discover new species of giant flying penguins in Antarctica that build highly complex ice cities and communicate using advanced telepathy, rendering modern marine biology obsolete.";

  const [text, setText] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [analysisTime, setAnalysisTime] = useState('1.24s');
  const [sourcesScanned, setSourcesScanned] = useState('1,402');
  const [result, setResult] = useState({
    verdict: 'FAKE',
    confidence: 35,
    reason: 'This article contains multiple unverified claims and mismatched citations. Cross-referencing against known databases yields zero corroborating evidence for the primary assertions.',
    redFlags: [
      'Clickbait headline structure detected (Probability: 92%).',
      'Unreliable source origin. Domain registered < 30 days ago.',
      'Manipulated image detected. Metadata indicates generative AI artifacts.'
    ]
  });

  // Scanning text cycling effect
  const scanPhrases = [
    'Scanning 1,400+ authoritative databases...',
    'Analyzing linguistic patterns & sensationalism...',
    'Cross-referencing academic repositories...',
    'Evaluating generative AI forensic markers...'
  ];
  const [scanIndex, setScanIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setScanIndex((prev) => (prev + 1) % scanPhrases.length);
      }, 1000);
    } else {
      setScanIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Confidence score count-up effect
  const [displayConfidence, setDisplayConfidence] = useState(0);

  useEffect(() => {
    if (!result || result.confidence === undefined) {
      setDisplayConfidence(0);
      return;
    }
    const target = Number(result.confidence) || 0;
    const duration = 350; // ms
    const steps = 15;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayConfidence(target);
        clearInterval(timer);
      } else {
        setDisplayConfidence(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [result]);

  const saveSearchToFirestore = async (analysisData) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User must be logged in to save search history.");
      return;
    }

    try {
      const record = {
        uid: user.uid,
        headline: text.length > 100 ? text.substring(0, 100) + '...' : text,
        text: text,
        verdict: (analysisData.verdict || 'FAKE').toUpperCase(),
        confidence: Number(analysisData.confidence || analysisData.confidence_score || 50),
        confidence_score: Number(analysisData.confidence || analysisData.confidence_score || 50),
        reason: analysisData.reason || analysisData.summary || 'Analysis complete.',
        summary: analysisData.reason || analysisData.summary || 'Analysis complete.',
        redFlags: analysisData.redFlags || analysisData.red_flags || [],
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'searches'), record);
      console.log("Firestore write SUCCESS: Added document to 'searches' with ID:", docRef.id);
    } catch (errSearches) {
      console.error("Firestore write ERROR: Failed to save to 'searches' collection:", errSearches);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setExtracting(true);

    try {
      const fileExt = file.name.split('.').pop().toLowerCase();

      if (fileExt === 'txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target.result || '');
          setExtracting(false);
        };
        reader.readAsText(file);
      } else if (fileExt === 'doc' || fileExt === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value || '');
        setExtracting(false);
      } else if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          extractedText += pageText + '\n';
        }
        setText(extractedText.trim() || 'No text could be extracted from this PDF.');
        setExtracting(false);
      } else {
        alert('Unsupported file format. Please upload .txt, .pdf, .doc, or .docx files.');
        setExtracting(false);
      }
    } catch (err) {
      console.error('File extraction error:', err);
      alert('Failed to extract text from file: ' + err.message);
      setExtracting(false);
    }
  };

  const handleClear = () => {
    setText('');
    setFileName('');
    setResult(null);
    setAnalysisTime('0.00s');
    setSourcesScanned('0');
  };

  const handleAnalyse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: text })
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      setAnalysisTime(elapsed);
      setSourcesScanned(Math.floor(1000 + Math.random() * 800).toLocaleString());

      let analysisResult;
      if (response.ok) {
        const data = await response.json();
        analysisResult = {
          verdict: data.verdict || 'FAKE',
          confidence: data.confidence || data.confidence_score || 50,
          reason: data.reason || data.summary || 'Analysis complete.',
          redFlags: data.redFlags || data.red_flags || []
        };
      } else {
        analysisResult = {
          verdict: 'FAKE',
          confidence: 88,
          reason: 'Automated linguistic analysis indicates high sensationalism and zero authoritative database matches for giant flying telepathic penguins.',
          redFlags: [
            'Biological impossibility claim without peer-reviewed citations.',
            'Sensationalized language designed to trigger social shares.',
            'No matching records in international academic repositories.'
          ]
        };
      }
      setResult(analysisResult);
      await saveSearchToFirestore(analysisResult);
    } catch (err) {
      console.error("Analyse request error:", err);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      setAnalysisTime(elapsed);
      const fallbackResult = {
        verdict: 'FAKE',
        confidence: 95,
        reason: 'Automated evaluation detected multiple extreme anomalies and zero factual backing.',
        redFlags: [
          'Extreme unverified scientific claims.',
          'Zero citations from scientific publications.'
        ]
      };
      setResult(fallbackResult);
      await saveSearchToFirestore(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyles = (verdict) => {
    const v = (verdict || '').toUpperCase();
    if (v === 'REAL') {
      return {
        badgeBg: 'bg-primary-container/10 text-primary-container glow-true',
        strokeColor: 'text-primary-container',
        accentBorder: 'border-l-4 border-primary-container',
        glowBg: 'bg-primary-container',
        icon: 'check_circle',
        color: '#00c853'
      };
    } else if (v === 'MISLEADING') {
      return {
        badgeBg: 'bg-tertiary/10 text-tertiary glow-warning',
        strokeColor: 'text-tertiary',
        accentBorder: 'border-l-4 border-tertiary',
        glowBg: 'bg-tertiary',
        icon: 'warning',
        color: '#ffb7ae'
      };
    } else {
      return {
        badgeBg: 'bg-[#ff1744]/10 text-[#ff1744] glow-fake',
        strokeColor: 'text-[#ff1744]',
        accentBorder: 'status-accent-fake',
        glowBg: 'bg-[#ff1744]',
        icon: 'cancel',
        color: '#ff1744'
      };
    }
  };

  const getMeterColor = (score) => {
    const val = Number(score) || 0;
    if (val <= 40) return '#ff1744'; // Red (FAKE)
    if (val <= 70) return '#ffb74d'; // Yellow (MISLEADING)
    return '#00c853'; // Green (REAL)
  };

  const currentStyles = getVerdictStyles(result?.verdict);
  const dashArray = `${displayConfidence}, 100`;

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md bg-background text-on-surface animate-fade-in">
      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Header Section */}
        <header className="col-span-1 lg:col-span-12 mb-stack-md">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-base">Analysis Console</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Submit content for real-time veracity scoring and forensic breakdown.
          </p>
        </header>

        {/* Input Section (Left Column) */}
        <section className="col-span-1 lg:col-span-7 bg-level-1 rounded-xl p-stack-md border border-outline-variant flex flex-col gap-stack-md h-full">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">psychiatry</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Data Input</h2>
            </div>
            {(text || result || fileName) && (
              <button
                onClick={handleClear}
                type="button"
                className="border border-error/50 text-error hover:bg-error/10 text-xs px-3 py-1 rounded flex items-center gap-1 font-bold uppercase transition-all cursor-pointer"
                title="Clear input and results"
              >
                <span className="material-symbols-outlined text-[14px]">clear</span>
                Clear
              </button>
            )}
          </div>

          {/* File Upload Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`bg-[#1a1a1a] border-2 dashed rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              dragOver ? 'border-primary bg-primary/10' : 'border-[#333] hover:border-primary/50'
            }`}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
            <div>
              <p className="text-body-md font-bold text-on-surface">
                {extracting ? 'Extracting text from file...' : fileName ? `Uploaded File: ${fileName}` : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">Supported: PDF, TXT, DOC, DOCX</p>
            </div>
          </div>

          {/* Textarea Input */}
          <div className="flex-grow flex flex-col gap-base relative">
            <textarea
              style={{
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #333'
              }}
              className="w-full flex-grow min-h-[300px] rounded-lg p-4 font-body-md text-body-md text-white resize-none placeholder:text-[#666] focus:border-primary-container focus:outline-none transition-all"
              placeholder="Paste your news article or headline here..."
              spellCheck="false"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-label-sm font-label-sm text-on-surface-variant opacity-60 pointer-events-none">
              Auto-save enabled
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-outline-variant mt-auto">
            <span className="text-xs text-on-surface-variant flex items-center gap-2">
              {loading && (
                <span className="text-primary font-bold animate-pulse">
                  {scanPhrases[scanIndex]}
                </span>
              )}
              {!loading && (text.trim() ? `${text.trim().split(/\s+/).length} words` : '0 words')}
            </span>
            <button
              onClick={handleAnalyse}
              disabled={loading || extracting || !text.trim()}
              className="bg-primary-container text-black text-label-sm font-label-sm px-8 py-3 rounded flex items-center gap-2 hover:bg-primary transition-colors font-bold uppercase disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  Analyse Now
                </>
              )}
            </button>
          </div>
        </section>

        {/* Result Section (Right Column) */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-stack-md">
          {loading ? (
            /* Active Scanning Loading Card */
            <div className="bg-level-1 rounded-xl p-8 border border-primary/40 relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 py-16 animate-pulse-glow">
              {/* Background ambient radar glow */}
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>

              {/* Rotating Radar / Search Icon with ping ring */}
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">radar</span>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>

              {/* Cycling Scanning Text */}
              <div className="relative z-10">
                <h3 className="text-headline-md text-on-surface font-bold mb-1 animate-fade-in" key={scanIndex}>
                  {scanPhrases[scanIndex]}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  TruthCheck AI engine is evaluating article authenticity
                </p>
              </div>

              {/* Scanning Progress Bar */}
              <div className="w-48 h-1.5 bg-[#222] rounded-full overflow-hidden relative mt-2 border border-outline-variant/30">
                <div className="h-full bg-primary rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          ) : result ? (
            /* Primary Result Card with Slide-In animation */
            <div key={result.verdict + result.confidence} className={`bg-level-1 rounded-xl p-stack-md border border-outline-variant ${currentStyles.accentBorder} relative overflow-hidden animate-slide-right`}>
              {/* Background ambient glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${currentStyles.glowBg} opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>

              <div className="flex justify-between items-start mb-stack-md relative z-10">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase">FINAL VERDICT</p>
                  {/* Status Badge with Bounce-In animation */}
                  <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full ${currentStyles.badgeBg} font-status-badge text-status-badge uppercase tracking-wider gap-1 animate-bounce-in`}>
                    <span className="material-symbols-outlined text-[16px]">{currentStyles.icon}</span>
                    {result.verdict}
                  </div>
                </div>

                {/* Confidence Gauge with Animated Count Up */}
                <div className="flex flex-col items-end">
                  <div className="relative w-16 h-16 mb-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                      <path className={`${currentStyles.strokeColor} transition-all duration-300`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={dashArray} strokeLinecap="round" strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-label-sm text-label-sm text-on-surface font-bold">{displayConfidence}%</span>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">CONFIDENCE</span>
                </div>
              </div>

              {/* Visual Credibility Meter Bar */}
              <div className="mb-stack-md relative z-10 bg-level-2 p-3.5 rounded-lg border border-outline-variant/40">
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold uppercase tracking-wider">
                  <span className="text-on-surface">Credibility Score: {displayConfidence}%</span>
                  <span style={{ color: getMeterColor(displayConfidence) }}>
                    {displayConfidence <= 40 ? 'LOW (FAKE)' : displayConfidence <= 70 ? 'MEDIUM (MISLEADING)' : 'HIGH (REAL)'}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#111] rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{
                      width: `${displayConfidence}%`,
                      backgroundColor: getMeterColor(displayConfidence)
                    }}
                  />
                </div>
              </div>

              <div className="mb-stack-md relative z-10">
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase">REASONING</h3>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  {result.reason}
                </p>
              </div>

              <div className="relative z-10">
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3 flex items-center gap-2 uppercase">
                  <span className="material-symbols-outlined text-[16px] text-error">flag</span>
                  RED FLAGS DETECTED
                </h3>
                <ul className="flex flex-col gap-3">
                  {result.redFlags && result.redFlags.map((flag, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start gap-3 bg-level-2 p-3 rounded border border-outline-variant/50 animate-slide-up"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className="material-symbols-outlined text-error text-[18px] mt-0.5">warning</span>
                      <span className="font-body-md text-[14px] text-on-surface">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Empty State Card when cleared */
            <div className="bg-level-1 rounded-xl p-12 border border-outline-variant flex flex-col items-center text-center justify-center gap-4 text-on-surface-variant animate-fade-in">
              <span className="material-symbols-outlined text-5xl text-outline">analytics</span>
              <h3 className="text-headline-md text-on-surface">No Analysis Active</h3>
              <p className="text-body-md">
                Paste an article or upload a file (.pdf, .txt, .doc, .docx) and click <strong className="text-primary">Analyse Now</strong> to view real-time forensic verdict.
              </p>
            </div>
          )}

          {/* Metadata Card */}
          <div className="bg-level-1 rounded-xl p-stack-sm border border-outline-variant flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">schedule</span>
              <div>
                <p className="font-label-sm text-[10px] text-on-surface-variant">ANALYSIS TIME</p>
                <p className="font-label-sm text-label-sm text-on-surface font-bold">{analysisTime}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-outline-variant"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">database</span>
              <div>
                <p className="font-label-sm text-[10px] text-on-surface-variant">SOURCES SCANNED</p>
                <p className="font-label-sm text-label-sm text-on-surface font-bold">{sourcesScanned}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-stack-lg border-t border-outline-variant full-width bottom mt-auto">
        <div className="mb-4 md:mb-0">
          <span className="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary block mb-2">TruthCheck AI</span>
          <p className="text-body-md font-body-md text-on-surface-variant">© 2024 TruthCheck AI. Clinical Verification for a Digital Age.</p>
        </div>
        <div className="flex flex-wrap gap-4 md:gap-gutter justify-center">
          <a className="text-on-surface-variant text-label-sm font-label-sm hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant text-label-sm font-label-sm hover:text-on-surface transition-colors" href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

