import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, updateDoc, doc, getDocs, setDoc, Firestore, getCountFromServer } from 'firebase/firestore';
import { User, Message, MessageType, AdminStats } from '../types';
import { APP_CONFIG } from '../constants';

// Unified Service to handle both Real Backend (Firebase) and Fallback (Mock)
class ApiService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private useMock: boolean = true;

  // Mock State
  private mockUsers: Map<string, User> = new Map();
  private mockMessages: Message[] = [];
  private mockCredentials = new Map<string, string>(); // nickname -> password
  private mockNicknameToId = new Map<string, string>(); // nickname -> userId
  private listeners: Function[] = [];

  constructor() {
    const hasKeys = APP_CONFIG.FIREBASE_CONFIG.apiKey && 
                    APP_CONFIG.FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

    if (hasKeys) {
      try {
        this.app = initializeApp(APP_CONFIG.FIREBASE_CONFIG);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.useMock = false;
        console.log("GhostSignal: Connected to Firebase Backend Uplink.");
      } catch (e) {
        console.warn("GhostSignal: Firebase connection failed, falling back to local simulation.", e);
      }
    } else {
        console.log("GhostSignal: Running in Simulation Mode (In-Memory). Configure constants.ts to enable Firebase.");
    }

    // Seed mock data
    this.seedMockData();
  }

  private seedMockData() {
    this.registerMock('Admin', 'admin123');
    this.registerMock('Ghost-8821', 'password');
  }

  // --- AUTHENTICATION ---
  // Maps Codename + Secret Key to Firebase Email/Password Auth
  // Email format: [codename]@ghost.local

  async register(nickname: string, secret: string): Promise<{ success: boolean; message?: string; user?: User }> {
    if (!this.useMock && this.auth && this.db) {
      const email = `${nickname.replace(/\s+/g, '')}@ghost.local`; 
      try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, secret);
        const firebaseUser = userCredential.user;
        
        // Store user profile in Firestore
        const user: User = {
          id: firebaseUser.uid,
          nickname,
          isAnonymous: true,
          joinedAt: Date.now()
        };

        await setDoc(doc(this.db, 'users', firebaseUser.uid), user);

        return { success: true, user };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }

    return this.registerMock(nickname, secret);
  }

  async login(nickname: string, secret: string): Promise<{ success: boolean; message?: string; user?: User }> {
    if (!this.useMock && this.auth && this.db) {
      const email = `${nickname.replace(/\s+/g, '')}@ghost.local`;
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, secret);
        // We can fetch the user profile from Firestore, but for now we reconstruct it from auth or defaults
        // A real implementation would fetch from the 'users' collection
        const userDoc = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(this.db!, 'users', userCredential.user.uid)));
        
        let user: User;
        if (userDoc.exists()) {
             user = userDoc.data() as User;
        } else {
             // Fallback if record missing
             user = {
                id: userCredential.user.uid,
                nickname: nickname,
                isAnonymous: true,
                joinedAt: Date.now()
             };
        }

        return { success: true, user };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }

    return this.loginMock(nickname, secret);
  }

  // --- MESSAGING ---

  async sendMessage(msg: Message): Promise<void> {
    if (!this.useMock && this.db) {
        await addDoc(collection(this.db, 'messages'), {
            ...msg,
            timestamp: msg.timestamp // Ensure number format
        });
        return;
    }
    
    this.mockMessages.push(msg);
    if (this.mockMessages.length > 50) this.mockMessages.shift();
    this.notifyListeners();
  }

  async getMessages(): Promise<Message[]> {
    if (!this.useMock && this.db) {
        const q = query(collection(this.db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
            msgs.push(doc.data() as Message);
        });
        return msgs.reverse(); // Return oldest first for chat UI
    }
    return [...this.mockMessages];
  }

  // Realtime Subscription
  subscribeToMessages(callback: (messages: Message[]) => void): { unsubscribe: () => void } {
    if (!this.useMock && this.db) {
        // Subscribe to last 50 messages
        const q = query(collection(this.db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = [];
            querySnapshot.forEach((doc) => {
                // We trust the document structure matches Message interface
                msgs.push(doc.data() as Message);
            });
            // Firestore returns desc order (newest first), reverse for UI
            callback(msgs.reverse());
        });

        return { unsubscribe };
    }

    // Mock Subscription
    this.listeners.push(callback);
    callback([...this.mockMessages]); // Initial call
    return { 
        unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        }
    };
  }

  async markAsViewed(id: string): Promise<void> {
    if (!this.useMock && this.db) {
        // Query to find the doc with this ID field (since we stored custom IDs)
        // Ideally we use firestore document IDs, but we generated a custom ID in ChatRoom
        const q = query(collection(this.db, 'messages'), orderBy('timestamp', 'desc'), limit(100)); // limit scope
        const snapshot = await getDocs(q);
        
        // This is inefficient in production (should use doc ID), but works for switching backend without refactoring entire app logic
        snapshot.forEach(async (d) => {
            if (d.data().id === id) {
                await updateDoc(doc(this.db!, 'messages', d.id), {
                    viewed: true,
                    blurLevel: 0
                });
            }
        });
        return; 
    }
    const msg = this.mockMessages.find(m => m.id === id);
    if (msg) {
        msg.viewed = true;
        msg.blurLevel = 0;
        this.notifyListeners();
    }
  }

  async expireMessage(id: string): Promise<void> {
    if (!this.useMock && this.db) {
        const q = query(collection(this.db, 'messages'), orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(async (d) => {
            if (d.data().id === id) {
                 await updateDoc(doc(this.db!, 'messages', d.id), {
                    type: MessageType.DESTROY,
                    content: 'Media expired',
                    mediaUrl: null,
                    blurLevel: null
                });
            }
        });
       return;
    }
    const msg = this.mockMessages.find(m => m.id === id);
    if (msg) {
        msg.type = MessageType.DESTROY;
        msg.content = 'Media expired';
        msg.mediaUrl = undefined;
        msg.blurLevel = undefined;
        this.notifyListeners();
    }
  }

  // --- ADMIN ---

  async getStats(): Promise<AdminStats> {
    if (!this.useMock && this.db) {
        // Getting exact counts in Firestore can be expensive or requires 'count' aggregation queries
        // Using simple estimates or aggregation queries
        try {
            const usersColl = collection(this.db, 'users');
            const userSnapshot = await getCountFromServer(usersColl);
            
            const msgsColl = collection(this.db, 'messages');
            const msgSnapshot = await getCountFromServer(msgsColl);
            
            return {
                activeUsers: userSnapshot.data().count,
                activeRooms: 1,
                messagesSent: msgSnapshot.data().count,
                bandwidthUsage: `${(Math.random() * 500).toFixed(2)} MB`, // Mock
                blockedIPs: 0
            };
        } catch (e) {
            console.error("Stats error", e);
            return {
                activeUsers: 0,
                activeRooms: 1,
                messagesSent: 0,
                bandwidthUsage: '0 MB',
                blockedIPs: 0
            }
        }
    }

    return {
      activeUsers: this.mockUsers.size,
      activeRooms: 1, 
      messagesSent: this.mockMessages.length,
      bandwidthUsage: `${(Math.random() * 500).toFixed(2)} MB`,
      blockedIPs: 0,
    };
  }

  async getUsers(): Promise<User[]> {
      if (!this.useMock && this.db) {
          const snapshot = await getDocs(collection(this.db, 'users'));
          const users: User[] = [];
          snapshot.forEach(d => users.push(d.data() as User));
          return users;
      }
      return Array.from(this.mockUsers.values());
  }

  blockUser(userId: string) {
      if (this.useMock) {
          this.mockUsers.delete(userId);
      }
      // Real implementation would ban user in Firebase Auth or add to a 'banned' collection
  }

  // --- MOCK HELPERS ---

  private registerMock(nickname: string, secret: string) {
    if (this.mockNicknameToId.has(nickname)) {
        return { success: false, message: 'Codename already taken.' };
    }
    const id = Math.random().toString(36).substring(2, 10);
    const user = { id, nickname, isAnonymous: true, joinedAt: Date.now() };
    this.mockUsers.set(id, user);
    this.mockNicknameToId.set(nickname, id);
    this.mockCredentials.set(nickname, secret);
    return { success: true, user };
  }

  private loginMock(nickname: string, secret: string) {
    if (!this.mockNicknameToId.has(nickname)) {
        return { success: false, message: 'Identity not found.' };
    }
    if (this.mockCredentials.get(nickname) !== secret) {
        return { success: false, message: 'Invalid access key.' };
    }
    const userId = this.mockNicknameToId.get(nickname)!;
    const user = this.mockUsers.get(userId);
    return { success: true, user };
  }

  private notifyListeners() {
      this.listeners.forEach(cb => cb([...this.mockMessages]));
  }
}

export const api = new ApiService();