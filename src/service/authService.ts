import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { logger } from '../utils/logger';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        };
        logger.info('Usuário autenticado', 'AuthService', { uid: user.uid, email: user.email });
      } else {
        this.currentUser = null;
        logger.info('Usuário desautenticado', 'AuthService');
      }
      this.notifyListeners();
    });
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      logger.info('Tentando login', 'AuthService', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      logger.info('Login realizado com sucesso', 'AuthService', { uid: user.uid });
      return authUser;
    } catch (error: any) {
      logger.error('Erro no login', 'AuthService', { error: error.code, message: error.message });
      throw this.formatError(error);
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      logger.info('Tentando cadastro', 'AuthService', { email, displayName });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      logger.info('Cadastro realizado com sucesso', 'AuthService', { uid: user.uid });
      return authUser;
    } catch (error: any) {
      logger.error('Erro no cadastro', 'AuthService', { error: error.code, message: error.message });
      throw this.formatError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      logger.info('Tentando logout', 'AuthService');
      await firebaseSignOut(auth);
      logger.info('Logout realizado com sucesso', 'AuthService');
    } catch (error: any) {
      logger.error('Erro no logout', 'AuthService', { error: error.code, message: error.message });
      throw this.formatError(error);
    }
  }

  private formatError(error: any): AuthError {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/invalid-email': 'Email inválido.',
      'auth/operation-not-allowed': 'Operação não permitida.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/user-disabled': 'Esta conta foi desativada.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/popup-closed-by-user': 'Janela de autenticação fechada.',
      'auth/cancelled-popup-request': 'Requisição de autenticação cancelada.',
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message || 'Erro desconhecido na autenticação.',
    };
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();