import { AuthSession, User } from '../types';
import { getApiEndpoint } from '../config/apiConfig';

const SESSION_STORAGE_KEY = 'rizz_ai_auth_session_v1';

export const authService = {
  getLocalSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!data) return null;
      const parsed: AuthSession = JSON.parse(data);
      if (parsed && parsed.token && parsed.user) {
        // Vérifier si expiration dépassée
        if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
          this.clearLocalSession();
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveLocalSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Erreur sauvegarde session locale:', e);
    }
  },

  clearLocalSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Erreur suppression session locale:', e);
    }
  },

  async register(email: string, password: string, confirmPassword?: string): Promise<AuthSession> {
    const res = await fetch(getApiEndpoint('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de la création du compte.');
    }

    const session: AuthSession = {
      token: data.token,
      user: data.user,
      expiresAt: data.expiresAt,
    };
    this.saveLocalSession(session);
    return session;
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const res = await fetch(getApiEndpoint('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Identifiants incorrects.');
    }

    const session: AuthSession = {
      token: data.token,
      user: data.user,
      expiresAt: data.expiresAt,
    };
    this.saveLocalSession(session);
    return session;
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(getApiEndpoint('/api/auth/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Session invalide.');
    }

    return data.user;
  },

  async logout(token?: string): Promise<void> {
    try {
      if (token) {
        await fetch(getApiEndpoint('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      // Ignorer si hors-ligne
    } finally {
      this.clearLocalSession();
    }
  },

  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(getApiEndpoint('/api/auth/change-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Impossible de modifier le mot de passe.');
    }
  },

  async deleteAccount(token: string, password: string): Promise<void> {
    const res = await fetch(getApiEndpoint('/api/auth/delete-account'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Impossible de supprimer le compte.');
    }

    this.clearLocalSession();
  },

  async syncWithCloud(token: string, backupData: any): Promise<void> {
    const res = await fetch(getApiEndpoint('/api/user/sync'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ backup: backupData }),
    });
    if (!res.ok) {
      throw new Error('Erreur de synchronisation cloud.');
    }
  },

  async getCloudBackup(token: string): Promise<any> {
    const res = await fetch(getApiEndpoint('/api/user/sync'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },
};
