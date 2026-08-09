import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-surface dark:bg-surface w-full z-50 sticky top-0 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link to={user ? "/dashboard" : "/"} className="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary tracking-tight">
          TruthCheck AI
        </Link>

        <nav className="hidden md:flex gap-gutter items-center">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`text-label-sm font-label-sm uppercase transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/verify"
                className={`text-label-sm font-label-sm uppercase transition-colors duration-200 ${
                  isActive('/verify')
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Verify
              </Link>
              <Link
                to="/archives"
                className={`text-label-sm font-label-sm uppercase transition-colors duration-200 ${
                  isActive('/archives')
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Archives
              </Link>
              <Link
                to="/profile"
                className={`text-label-sm font-label-sm uppercase transition-colors duration-200 ${
                  isActive('/profile')
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-sm font-label-sm uppercase">
                Login
              </Link>
              <Link to="/auth" className="bg-primary-container text-black px-4 py-2 rounded font-label-sm text-label-sm hover:opacity-80 transition-all duration-150 uppercase font-bold">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {user && (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-label-sm text-on-surface-variant max-w-[150px] truncate">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-label-sm font-label-sm text-error hover:underline uppercase"
            >
              Logout
            </button>
          </div>
        )}

        <button
          className="md:hidden text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container p-4 flex flex-col gap-4 border-b border-outline-variant">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary py-1">Dashboard</Link>
              <Link to="/verify" onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary py-1">Verify</Link>
              <Link to="/archives" onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary py-1">Archives</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary py-1">Profile</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-error text-left py-1">Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary py-1">Login / Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
