import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 pt-20 pb-16 space-y-8 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
        <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800 shadow-2xl relative group cursor-default">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
           <div className="relative text-primary transform group-hover:scale-110 transition-transform duration-300">
             <span className="[&>svg]:w-24 [&>svg]:h-24"><Icons.Ghost /></span>
           </div>
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Ghost<span className="text-primary">Signal</span>
          </h1>
          <p className="text-xl text-zinc-400 font-light tracking-wide">
            The untraceable communication protocol for the digital age.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 bg-primary text-zinc-950 font-bold py-4 px-8 rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Icons.Send /> Initialize Session
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 bg-zinc-900 text-zinc-300 font-medium py-4 px-8 rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Stats/Trust Banner */}
      <div className="border-y border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 p-8 text-center">
           <div>
             <div className="text-2xl font-mono font-bold text-white">AES-256</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Encryption</div>
           </div>
           <div>
             <div className="text-2xl font-mono font-bold text-white">0.00%</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Logs Kept</div>
           </div>
           <div>
             <div className="text-2xl font-mono font-bold text-white">P2P</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Architecture</div>
           </div>
           <div>
             <div className="text-2xl font-mono font-bold text-white">TOR</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Network Ready</div>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto p-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-zinc-100">Core Capabilities</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           <FeatureCard 
             icon={<Icons.Lock />} 
             title="End-to-End Encryption" 
             desc="Messages are encrypted on your device and can only be read by the recipient. Even we can't see them."
           />
           <FeatureCard 
             icon={<Icons.Shield />} 
             title="Tor Network Support" 
             desc="Native support for .onion routing. Mask your IP address and location completely."
           />
           <FeatureCard 
             icon={<Icons.EyeOff />} 
             title="Ephemeral Media" 
             desc="Send photos that self-destruct after viewing. Progressive blur technology for secure preview."
           />
           <FeatureCard 
             icon={<Icons.Video />} 
             title="Secure Video Calls" 
             desc="Peer-to-peer WebRTC video and voice calls. No server relay for media streams."
           />
           <FeatureCard 
             icon={<Icons.Ghost />} 
             title="Anonymous Identity" 
             desc="No phone numbers. No emails required for basic usage. Just a codename and a key."
           />
           <FeatureCard 
             icon={<Icons.Trash />} 
             title="Zero Trace" 
             desc="Messages are stored in volatile memory only. Server wipes data instantly upon delivery."
           />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 p-8 text-center text-zinc-600 text-sm">
        <p>&copy; 2024 GhostSignal Protocol. Open Source. Auditable. Secure.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-primary/30 transition-colors group">
    <div className="w-12 h-12 bg-zinc-950 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors mb-4 border border-zinc-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-zinc-200 mb-2">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default HomePage;