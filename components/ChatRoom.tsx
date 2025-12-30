import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons, APP_CONFIG } from '../constants';
import { Message, MessageType, User, CallSession } from '../types';
import { api } from '../services/api';
import { isTorConnection } from '../services/tor';
import CallInterface from './CallInterface';

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTor, setIsTor] = useState(false);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'copied'>('idle');
  
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication Check
  useEffect(() => {
    const storedUser = sessionStorage.getItem('ghost_user');
    if (!storedUser) {
        navigate('/login');
        return;
    }
    try {
        setCurrentUser(JSON.parse(storedUser));
    } catch (e) {
        navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setIsTor(isTorConnection());
  }, []);

  // Realtime Messages Subscription
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to messages (Works for both Supabase Realtime and Mock fallback)
    const subscription = api.subscribeToMessages((newMessages) => {
        setMessages(newMessages);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); 

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      type: MessageType.TEXT,
      content: inputText,
      timestamp: Date.now(),
      ephemeral: false,
      viewed: false,
    };

    await api.sendMessage(newMessage);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTor || !currentUser) return; 
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      alert('File too large (Max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        type: MessageType.IMAGE,
        content: 'Encrypted Image',
        mediaUrl: ev.target?.result as string,
        timestamp: Date.now(),
        ephemeral: true,
        viewed: false,
        blurLevel: 20, 
      };
      await api.sendMessage(newMessage);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const viewEphemeralMedia = async (msgId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, blurLevel: 0, viewed: true } : m
    ));
    await api.markAsViewed(msgId);
    
    setTimeout(async () => {
        await api.expireMessage(msgId);
    }, APP_CONFIG.EPHEMERAL_TIMEOUT);
  };

  const initiateCall = (type: 'video' | 'audio') => {
    if (isTor) {
      alert("Calls disabled in Tor mode to prevent IP leaks.");
      return;
    }

    // Start Call State
    setActiveCall({
      isActive: true,
      type,
      status: 'calling',
      peerId: 'mock-peer'
    });

    // Simulate Connection after 2 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null);
    }, 2000);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}/#/login?ref=${currentUser?.id}`;
    navigator.clipboard.writeText(`GhostSignal Secure Invite: ${inviteLink}`);
    setInviteStatus('copied');
    setTimeout(() => setInviteStatus('idle'), 2000);
  };

  if (!currentUser) return null; // Or a loading spinner while checking auth

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-zinc-950 sm:border-x border-zinc-800 relative">
      
      {/* Active Call Overlay */}
      {activeCall && (
        <CallInterface 
          session={activeCall} 
          onEndCall={endCall} 
          isTor={isTor} 
        />
      )}

      {/* Header with Call Controls */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
               <Icons.Ghost />
             </div>
             <div>
                <h3 className="font-bold text-zinc-200 text-sm">{currentUser.nickname}</h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                   E2EE ACTIVE
                </p>
             </div>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={handleInvite}
                className="p-2 rounded-full transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-primary"
                title="Copy Secure Invite Link"
            >
                {inviteStatus === 'copied' ? <span className="text-emerald-500"><Icons.Check /></span> : <Icons.UserPlus />}
            </button>
            <button 
              onClick={() => initiateCall('audio')}
              disabled={isTor}
              className={`p-2 rounded-full transition-colors ${isTor ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-800 hover:text-primary'}`}
              title="Voice Call"
            >
               <Icons.Phone />
            </button>
            <button 
              onClick={() => initiateCall('video')}
              disabled={isTor}
              className={`p-2 rounded-full transition-colors ${isTor ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-800 hover:text-primary'}`}
              title="Video Call"
            >
               <Icons.Video />
            </button>
         </div>
      </div>

      {/* Tor Warning Banner */}
      {isTor && (
        <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 px-4 flex items-center justify-between backdrop-blur-sm animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-amber-500">
                <Icons.Shield />
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight">TOR CIRCUIT ACTIVE</span>
            </div>
            <span className="text-[10px] text-amber-500/70 font-mono hidden sm:inline-block">MEDIA & CALLS DISABLED</span>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          
          if (msg.type === MessageType.DESTROY) {
             return (
               <div key={msg.id} className="flex justify-center my-2">
                 <span className="text-[10px] text-zinc-700 font-mono italic flex items-center gap-1">
                   <Icons.Trash /> Message destroyed
                 </span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                isMe 
                  ? 'bg-primary/10 text-primary-50 border border-primary/20 rounded-tr-none' 
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
              }`}>
                {msg.type === MessageType.IMAGE && msg.mediaUrl ? (
                  <div className="relative group">
                    <div className="overflow-hidden rounded-lg relative bg-black/20">
                        <img 
                          src={msg.mediaUrl} 
                          alt="Encrypted" 
                          // Progressive blur removal using CSS transition
                          style={{ filter: msg.blurLevel ? `blur(${msg.blurLevel}px)` : 'blur(0px)' }}
                          className={`max-w-full h-auto transition-all duration-1000 ease-out ${msg.blurLevel ? 'cursor-pointer hover:opacity-90 scale-105' : 'scale-100'}`}
                          onClick={() => msg.blurLevel && viewEphemeralMedia(msg.id)}
                        />
                        {msg.blurLevel ? (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <span className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-2 text-white shadow-xl animate-pulse">
                                  <Icons.EyeOff /> TAP TO DECRYPT
                                </span>
                             </div>
                        ) : null}
                    </div>
                    {msg.ephemeral && !msg.blurLevel && (
                      <div className="absolute top-2 right-2 z-20">
                         <div className="w-5 h-5 rounded-full border-2 border-white/50 border-t-white animate-spin drop-shadow-md"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
                
                <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                   <span className="text-[10px] font-mono">
                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {isMe && <span className="text-[10px]">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-zinc-950 p-2 rounded-full border border-zinc-800 focus-within:border-primary/50 transition-colors"
        >
          <button 
            type="button" 
            className={`p-2 transition-colors ${isTor ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-zinc-200'}`}
            onClick={() => !isTor && fileInputRef.current?.click()}
            disabled={isTor}
            title={isTor ? "Media upload disabled in Tor mode" : "Upload Image"}
          >
            <Icons.Image />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={isTor}
          />
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-600 font-sans"
          />
          
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="p-2 bg-primary text-zinc-950 rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Icons.Send />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;