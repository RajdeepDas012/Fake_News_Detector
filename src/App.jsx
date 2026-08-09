import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Archives from './pages/Archives';
import Verify from './pages/Verify';
import Profile from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // While Firebase is resolving the persisted session, show a full-screen loader
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#0f0f0f",
        gap: "16px"
      }}>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "48px",
            color: "#00c853",
            animation: "spin 1s linear infinite"
          }}
        >
          radar
        </span>
        <span style={{ color: "#00c853", fontSize: "18px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
          Loading...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <Navbar />
        <Routes>
          {/* Public Routes — redirect to /dashboard if already logged in */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
          />
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
          />

          {/* Protected Routes — redirect to /auth if not logged in */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/verify"
            element={user ? <Verify /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/archives"
            element={user ? <Archives /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/auth" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}
