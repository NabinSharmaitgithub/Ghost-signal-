import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../constants';
import { CallSession } from '../types';

interface CallInterfaceProps {
  session: CallSession;
  onEndCall: () => void;
  isTor: boolean;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ session, onEndCall, isTor }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [duration, setDuration] = useState(0);

  // Timer for call duration
  useEffect(() => {
    let interval: any;
    if (session.status === 'connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [session.status]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC (Mocking remote via local mirror for demo)
  useEffect(() => {
    let localStream: MediaStream | null = null;

    const startStream = async () => {
      if (isTor) return; // Prevent IP leak
      
      try {
        const constraints = {
          audio: true,
          video: session.type === 'video' ? { facingMode: 'user' } : false
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.muted = true; // Always mute local to avoid echo
        }

        // SIMULATE REMOTE CONNECTION
        if (session.status === 'connected' && remoteVideoRef.current) {
           // In a real app, this would be the remote peer's stream
           // For demo, we mirror local stream or show placeholder
           remoteVideoRef.current.srcObject = localStream; 
        }

      } catch (err) {
        console.error("Error accessing media devices:", err);
        // Fallback or error handling
      }
    };

    startStream();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [session.type, session.status, isTor]);

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(t => t.enabled = !micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = () => {
    if (session.type === 'audio') return;
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex flex-col items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700 shadow-xl">
           <span className="text-2xl animate-pulse">👻</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">
          {session.status === 'calling' ? 'Calling...' : 
           session.status === 'ringing' ? 'Incoming Call...' :
           'Secure Connection'}
        </h2>
        <p className="text-zinc-400 font-mono text-sm">
          {session.status === 'connected' ? formatTime(duration) : 'Establishing E2EE Tunnel...'}
        </p>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
        {session.type === 'video' ? (
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-500 ${session.status === 'connected' ? 'opacity-100' : 'opacity-0 blur-lg'}`}
          />
        ) : (
          // Audio Call UI
          <div className="flex flex-col items-center justify-center w-full h-full">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center relative z-10 border-4 border-zinc-900 shadow-2xl">
                    <Icons.Ghost />
                </div>
             </div>
          </div>
        )}

        {/* Local PIP Video */}
        {session.type === 'video' && !isTor && (
          <div className="absolute bottom-24 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
            />
            {!videoEnabled && (
               <div className="w-full h-full flex items-center justify-center text-zinc-500">
                 <Icons.VideoOff />
               </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-zinc-900/90 backdrop-blur-md p-8 pb-10 flex items-center justify-center gap-6 rounded-t-3xl border-t border-zinc-800">
        <button 
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-zinc-900'}`}
        >
          {micEnabled ? <Icons.Mic /> : <Icons.MicOff />}
        </button>

        <button 
          onClick={onEndCall}
          className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all"
        >
          <Icons.PhoneOff />
        </button>

        {session.type === 'video' && (
          <button 
             onClick={toggleVideo}
             className={`p-4 rounded-full transition-all ${videoEnabled ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-zinc-900'}`}
          >
            {videoEnabled ? <Icons.Video /> : <Icons.VideoOff />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallInterface;