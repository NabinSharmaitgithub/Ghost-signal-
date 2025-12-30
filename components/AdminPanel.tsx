import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { api } from '../services/api';
import { AdminStats, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Mock chart data
const data = [
  { name: '00:00', users: 4, bandwidth: 20 },
  { name: '04:00', users: 3, bandwidth: 15 },
  { name: '08:00', users: 12, bandwidth: 45 },
  { name: '12:00', users: 28, bandwidth: 120 },
  { name: '16:00', users: 35, bandwidth: 150 },
  { name: '20:00', users: 22, bandwidth: 90 },
];

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'broadcast'>('dashboard');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check Auth
    const token = sessionStorage.getItem('ghost_admin_token');
    if (!token) {
        navigate('/login');
        return;
    }

    // Initial fetch
    const fetchData = async () => {
        setStats(await api.getStats());
        setUsers(await api.getUsers());
    };
    fetchData();

    // Refresh interval
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleBlockUser = (id: string) => {
    if (window.confirm('Block this user ID and ban their IP temporarily?')) {
        api.blockUser(id);
        api.getUsers().then(setUsers);
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Broadcast sent to ${users.length} active sessions: "${broadcastMsg}"`);
    setBroadcastMsg('');
  };
  
  const handleLogout = () => {
      sessionStorage.removeItem('ghost_admin_token');
      navigate('/');
  };

  if (!stats) return <div className="flex items-center justify-center h-full text-primary font-mono animate-pulse">Initializing Admin Secure Connection...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold font-mono text-primary flex items-center gap-2">
             <span className="text-zinc-500">/root/</span>admin_panel
           </h1>
           <p className="text-zinc-500 text-sm mt-1">System Monitoring & Moderation</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0 items-center">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'broadcast' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}
          >
            Broadcast
          </button>
          <button 
            onClick={handleLogout}
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <Icons.Lock />
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Active Users</p>
              <p className="text-2xl font-mono text-emerald-400">{stats.activeUsers}</p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Messages (Session)</p>
              <p className="text-2xl font-mono text-blue-400">{stats.messagesSent}</p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Est. Bandwidth</p>
              <p className="text-2xl font-mono text-purple-400">{stats.bandwidthUsage}</p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Blocked IPs</p>
              <p className="text-2xl font-mono text-red-400">{stats.blockedIPs}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 h-64">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Traffic Activity</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Bandwidth Load</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    cursor={{fill: '#27272a'}}
                  />
                  <Bar dataKey="bandwidth" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
                <th className="p-4 font-medium">Session ID</th>
                <th className="p-4 font-medium">Nickname</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 font-mono text-zinc-500">{user.id}</td>
                  <td className="p-4 text-zinc-200">{user.nickname}</td>
                  <td className="p-4 text-zinc-500">{new Date(user.joinedAt).toLocaleTimeString()}</td>
                  <td className="p-4">
                    {user.isAnonymous ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
                        ANON
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleBlockUser(user.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1 rounded transition-colors"
                    >
                      Block IP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'broadcast' && (
        <div className="max-w-xl mx-auto mt-8">
           <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
             <h3 className="text-lg font-medium text-zinc-200 mb-4">System Broadcast</h3>
             <form onSubmit={handleBroadcast}>
               <label className="block text-sm text-zinc-500 mb-2">Message</label>
               <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 focus:border-primary outline-none h-32 mb-4"
                  placeholder="Enter notification for all active users..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
               ></textarea>
               <div className="flex gap-4">
                 <button className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg hover:bg-zinc-700 transition-colors">Preview</button>
                 <button type="submit" className="flex-1 bg-primary text-zinc-950 font-bold py-2 rounded-lg hover:bg-primary-dark transition-colors">Send Alert</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;