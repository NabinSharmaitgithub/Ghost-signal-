import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isProtected, setIsProtected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Privacy Protection Hook
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsProtected(true);
      }
      // We do not auto-lock when returning (visibility visible) to avoid annoyance.
      // We do not lock on blur (window focus lost) to prevent "black screen" when clicking outside.
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    // Use h-[100dvh] for mobile browsers to account for dynamic address bars
    <div className="relative h-[100dvh] w-full bg-zinc-950 text-zinc-200 font-sans flex flex-col overflow-hidden">
      {/* Privacy Shield Overlay */}
      {isProtected && (
        <div 
          className="absolute inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-opacity duration-300"
          onClick={() => setIsProtected(false)}
        >
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col items-center">
            <div className="text-primary mb-4 animate-pulse">
              <Icons.Shield />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Ghost Mode Active</h2>
            <p className="text-zinc-500 text-sm text-center max-w-[200px]">
              Content obscured for privacy. Click to resume session.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-primary"><Icons.Ghost /></div>
          <span className="font-bold tracking-tight text-zinc-100">GhostSignal</span>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-400">ENCRYPTED</span>
          </div>
          
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Icons.Menu />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 z-50 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2">
          <button onClick={() => { navigate('/chat'); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm">Chat</button>
          <button onClick={() => { navigate('/admin'); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm text-zinc-400">Admin Panel</button>
          <div className="h-px bg-zinc-800 my-1"></div>
          <button onClick={() => window.location.reload()} className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm text-danger">Destroy Session</button>
        </div>
      )}

      {/* Main Content: flex-1 ensures it fills remaining space, overflow-hidden keeps scrolling internal */}
      <main className="flex-1 w-full overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;