import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredUser {
  id: string;
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
  displayName?: string;
  edition: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface SafeUser {
  id: string;
  email: string;
  createdAt: number;
  displayName?: string;
  edition: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const USER_DATA_FILE = path.join(DATA_DIR, 'userdata.json');

// Assurer l'existence du dossier de persistance
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err);
    return fallback;
  }
}

function safeWriteJson(filePath: string, data: any): void {
  try {
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    console.error(`Erreur écriture ${filePath}:`, err);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error(`Erreur critique écriture ${filePath}:`, fallbackErr);
    }
  }
}

class AuthStore {
  private users: Map<string, StoredUser> = new Map();
  private sessions: Map<string, StoredSession> = new Map();
  private userData: Record<string, any> = {};

  constructor() {
    this.load();
  }

  private load(): void {
    const usersList = safeReadJson<StoredUser[]>(USERS_FILE, []);
    usersList.forEach((u) => this.users.set(u.id, u));

    const sessionsList = safeReadJson<StoredSession[]>(SESSIONS_FILE, []);
    const now = Date.now();
    sessionsList.forEach((s) => {
      if (s.expiresAt > now) {
        this.sessions.set(s.token, s);
      }
    });

    this.userData = safeReadJson<Record<string, any>>(USER_DATA_FILE, {});
  }

  private saveUsers(): void {
    safeWriteJson(USERS_FILE, Array.from(this.users.values()));
  }

  private saveSessions(): void {
    safeWriteJson(SESSIONS_FILE, Array.from(this.sessions.values()));
  }

  private saveUserData(): void {
    safeWriteJson(USER_DATA_FILE, this.userData);
  }

  public toSafeUser(u: StoredUser): SafeUser {
    return {
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
      displayName: u.displayName,
      edition: u.edition || 'C4RL3NTZ',
    };
  }

  public findByEmail(email: string): StoredUser | null {
    const normalized = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return u;
      }
    }
    return null;
  }

  public findById(id: string): StoredUser | null {
    return this.users.get(id) || null;
  }

  public createUser(email: string, passwordPlain: string): { user: SafeUser; token: string; expiresAt: number } {
    const normalized = email.toLowerCase().trim();
    if (this.findByEmail(normalized)) {
      throw new Error('Un compte avec cette adresse email existe déjà.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(passwordPlain, salt, 64).toString('hex');

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: normalized,
      salt,
      passwordHash: hash,
      createdAt: Date.now(),
      edition: 'C4RL3NTZ',
    };

    this.users.set(newUser.id, newUser);
    this.saveUsers();

    const session = this.createSession(newUser.id);
    return {
      user: this.toSafeUser(newUser),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  public verifyCredentials(email: string, passwordPlain: string): { user: SafeUser; token: string; expiresAt: number } {
    const normalized = email.toLowerCase().trim();
    const user = this.findByEmail(normalized);
    if (!user) {
      throw new Error('Identifiants invalides.');
    }

    const computed = crypto.scryptSync(passwordPlain, user.salt, 64).toString('hex');
    const hashBuf = Buffer.from(computed, 'hex');
    const expectedBuf = Buffer.from(user.passwordHash, 'hex');

    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      throw new Error('Identifiants invalides.');
    }

    const session = this.createSession(user.id);
    return {
      user: this.toSafeUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  public createSession(userId: string): StoredSession {
    const token = `c4rl_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 jours
    const session: StoredSession = {
      token,
      userId,
      createdAt: Date.now(),
      expiresAt,
    };

    this.sessions.set(token, session);
    this.saveSessions();
    return session;
  }

  public validateSession(token: string): SafeUser | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(token);
      this.saveSessions();
      return null;
    }

    const user = this.users.get(session.userId);
    if (!user) {
      this.sessions.delete(token);
      this.saveSessions();
      return null;
    }

    return this.toSafeUser(user);
  }

  public revokeSession(token: string): void {
    if (this.sessions.delete(token)) {
      this.saveSessions();
    }
  }

  public changePassword(userId: string, oldPlain: string, newPlain: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    const computed = crypto.scryptSync(oldPlain, user.salt, 64).toString('hex');
    const hashBuf = Buffer.from(computed, 'hex');
    const expectedBuf = Buffer.from(user.passwordHash, 'hex');

    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      throw new Error('Ancien mot de passe incorrect.');
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto.scryptSync(newPlain, newSalt, 64).toString('hex');

    user.salt = newSalt;
    user.passwordHash = newHash;
    this.saveUsers();
  }

  public deleteUser(userId: string, passwordPlain: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable.');
    }

    const computed = crypto.scryptSync(passwordPlain, user.salt, 64).toString('hex');
    const hashBuf = Buffer.from(computed, 'hex');
    const expectedBuf = Buffer.from(user.passwordHash, 'hex');

    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      throw new Error('Mot de passe incorrect.');
    }

    // Supprimer sessions
    for (const [token, s] of this.sessions.entries()) {
      if (s.userId === userId) {
        this.sessions.delete(token);
      }
    }
    this.saveSessions();

    // Supprimer données
    delete this.userData[userId];
    this.saveUserData();

    // Supprimer utilisateur
    this.users.delete(userId);
    this.saveUsers();
  }

  public getUserData(userId: string): any {
    return this.userData[userId] || null;
  }

  public setUserData(userId: string, data: any): void {
    this.userData[userId] = {
      ...(this.userData[userId] || {}),
      ...data,
      updatedAt: Date.now(),
    };
    this.saveUserData();
  }
}

export const authStore = new AuthStore();
