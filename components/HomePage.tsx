import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import ThreeHero from './ThreeHero';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 pt-24 pb-16 space-y-10 relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        {/* 3D Model Section */}
        <div className="relative z-10 w-full max-w-lg h-[300px] md:h-[400px]">
           <ThreeHero />
           {/* Fallback/Overlay Text for Accessibility/Effect */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 mix-blend-overlay">
               <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
           </div>
        </div>
        
        <div className="space-y-6 max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-sm">
            Ghost<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">Signal</span>
          </h1>
          <p className="text-lg md:text-2xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            The untraceable communication protocol for the <span className="text-zinc-200 font-medium">post-privacy age</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
          <button 
            onClick={() => navigate('/login')}
            className="group flex-1 bg-primary hover:bg-emerald-400 text-zinc-950 font-bold py-4 px-8 rounded-xl transition-all transform hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3"
          >
            <span>Initialize Session</span>
            <span className="group-hover:translate-x-1 transition-transform"><Icons.Send /></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 bg-zinc-900/50 backdrop-blur-md text-zinc-300 font-medium py-4 px-8 rounded-xl hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            Protocol Details
          </button>
        </div>
      </section>

      {/* Stats/Trust Banner */}
      <div className="border-y border-zinc-800 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 p-10 text-center">
           <StatItem value="AES-256" label="Encryption Standard" />
           <StatItem value="0.00%" label="Data Retention" />
           <StatItem value="P2P" label="Direct Architecture" />
           <StatItem value="ONION" label="Tor Routing Ready" />
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto p-8 py-24">
        <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">Core Capabilities</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Built for whistleblowers, journalists, and privacy-conscious individuals who demand absolute security.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           <FeatureCard 
             icon={<Icons.Lock />} 
             title="End-to-End Encryption" 
             desc="Military-grade encryption happens on-device. Keys never leave your session. Even we can't read your messages."
           />
           <FeatureCard 
             icon={<Icons.Shield />} 
             title="Tor Network Ready" 
             desc="Native support for .onion routing detection. Automatically disables high-bandwidth features to prevent IP leaks."
           />
           <FeatureCard 
             icon={<Icons.EyeOff />} 
             title="Ephemeral Media" 
             desc="Send photos that self-destruct after viewing. Features progressive blur technology for secure content previewing."
           />
           <FeatureCard 
             icon={<Icons.Video />} 
             title="Secure Video Calls" 
             desc="Peer-to-peer WebRTC video and voice calls. Direct connection between clients with no server relay for media streams."
           />
           <FeatureCard 
             icon={<Icons.Ghost />} 
             title="Anonymous Identity" 
             desc="No phone numbers. No email verification. Just generate a codename and a cryptographic key to start."
           />
           <FeatureCard 
             icon={<Icons.Trash />} 
             title="Zero Trace Infrastructure" 
             desc="Messages are stored in volatile RAM only. Server wipes all session data instantly upon delivery or timeout."
           />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 p-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
                <Icons.Ghost />
                <span className="font-bold text-zinc-200">GhostSignal</span>
            </div>
            <p className="text-zinc-600 text-sm">&copy; 2024 GhostSignal Protocol. Open Source. Auditable. Secure.</p>
        </div>
      </footer>
    </div>
  );
};

const StatItem: React.FC<{value: string, label: string}> = ({ value, label }) => (
    <div className="space-y-2 group">
        <div className="text-3xl md:text-4xl font-mono font-bold text-white group-hover:text-primary transition-colors">{value}</div>
        <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">{label}</div>
    </div>
);

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-2xl hover:bg-zinc-900 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
    <div className="w-14 h-14 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300 mb-6 border border-zinc-800 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">{desc}</p>
  </div>
);

export default HomePage;