import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  
  // Form States
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState(''); // User password/key
  
  // Admin States
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await api.register(nickname, password);
        if (result.success && result.user) {
          sessionStorage.setItem('ghost_user', JSON.stringify(result.user));
          navigate('/chat');
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        // Sign In
        const result = await api.login(nickname, password);
        if (result.success && result.user) {
          sessionStorage.setItem('ghost_user', JSON.stringify(result.user));
          navigate('/chat');
        } else {
          setError(result.message || 'Authentication failed');
        }
      }
    } catch (err) {
        setError('Connection error. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
        if (adminUser === 'nabinsharma1105@gmail.comadmin' && adminPass === 'darknedmoon24@gmail.comadmin') {
            sessionStorage.setItem('ghost_admin_token', 'valid');
            navigate('/admin');
        } else {
            setError('ACCESS DENIED: Invalid Credentials');
            setIsLoading(false);
            setAdminPass('');
        }
    }, 1000);
  };

  const handleSocialLogin = async (provider: 'Google' | 'Facebook') => {
      // For demo, just auto-register a social user
      setIsLoading(true);
      setTimeout(async () => {
          const socialName = `${provider}User-${Math.floor(Math.random() * 900) + 100}`;
          const secret = 'social-login-secret';
          let result = await api.login(socialName, secret);
          
          if (!result.success) {
              result = await api.register(socialName, secret);
          }
          
          if (result.user) {
            sessionStorage.setItem('ghost_user', JSON.stringify(result.user));
            navigate('/chat');
          }
          setIsLoading(false);
      }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 text-zinc-200">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        
        {/* Decorator Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="text-center mb-8">
            <div className="mb-6 p-4 bg-zinc-900 rounded-full inline-block border border-zinc-800 shadow-inner">
                <div className="text-primary animate-pulse">
                    <Icons.Ghost />
                </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                Ghost<span className="text-primary">Signal</span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Secure Uplink Interface</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-zinc-950 p-1 rounded-lg mb-8 border border-zinc-800">
            <button 
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signin' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Sign Up
            </button>
            <button 
                onClick={() => { setMode('admin'); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'admin' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Admin
            </button>
        </div>

        {mode === 'admin' ? (
             <form onSubmit={handleAdminLogin} className="space-y-4">
                 {error && (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-mono">
                         {error}
                     </div>
                 )}
                
                <div className="space-y-2">
                    <label className="text-xs text-zinc-500 font-mono uppercase">Admin ID</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder-zinc-700"
                        />
                         <div className="absolute right-3 top-3 text-zinc-700">
                           <Icons.Ghost />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-zinc-500 font-mono uppercase">Access Key</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder-zinc-700"
                        />
                         <div className="absolute right-3 top-3 text-zinc-700">
                           <Icons.Shield />
                        </div>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isLoading || !adminPass || !adminUser}
                    className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                         <span className="animate-pulse">Verifying...</span>
                    ) : (
                        <>
                            <span>Authenticate</span>
                            <Icons.Lock />
                        </>
                    )}
                </button>
            </form>
        ) : (
            <div className="space-y-4">
                <form onSubmit={handleAuth} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-mono">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 font-mono uppercase">
                          {mode === 'signup' ? 'Create Codename' : 'Codename'}
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. Phantom_X"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder-zinc-700"
                                required
                            />
                            <div className="absolute right-3 top-3 text-zinc-700">
                                <Icons.Ghost />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 font-mono uppercase">
                           {mode === 'signup' ? 'Create Secret Key' : 'Secret Key'}
                        </label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder-zinc-700"
                                required
                            />
                            <div className="absolute right-3 top-3 text-zinc-700">
                                <Icons.Lock />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-dark text-zinc-950 font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            <>
                                <span>{mode === 'signup' ? 'Initialize Identity' : 'Decrypt Session'}</span>
                                <Icons.Send />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSocialLogin('Google')}
                        className="flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 font-medium py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                        <Icons.Google /> Google
                    </button>
                    <button 
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSocialLogin('Facebook')}
                        className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1864D9] font-medium py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                        <Icons.Facebook /> Facebook
                    </button>
                </div>
            </div>
        )}

        <div className="mt-6 text-center">
             <button 
               onClick={() => navigate('/')} 
               className="text-xs text-zinc-500 hover:text-primary transition-colors font-mono uppercase tracking-wide"
             >
               ← Return to Home
             </button>
        </div>

      </div>
      <div className="mt-8 text-zinc-700 text-xs font-mono">
          V1.0.5-AUTH // SECURE // ENCRYPTED
      </div>
    </div>
  );
};

export default Login;