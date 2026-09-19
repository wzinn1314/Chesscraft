import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { authService, type AuthError } from '../service/authService';
import { logger } from '../utils/logger';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password, displayName);
        logger.info('Cadastro realizado', 'LoginModal');
      } else {
        await authService.signIn(email, password);
        logger.info('Login realizado', 'LoginModal');
      }
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message);
      logger.error('Erro na autenticação', 'LoginModal', { error: authError.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isSignUp ? 'Modal de cadastro' : 'Modal de login'}
    >
      <Card variant="elevated" padding="lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ 
          color: '#f3efe6', 
          margin: '0 0 24px', 
          fontSize: '24px', 
          fontWeight: 800,
          textAlign: 'center'
        }}>
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', color: '#bab4ab', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                Nome
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#121110',
                  border: '1px solid #2d2b27',
                  borderRadius: '8px',
                  color: '#f3efe6',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
                placeholder="Seu nome"
                aria-label="Nome de exibição"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#bab4ab', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#121110',
                border: '1px solid #2d2b27',
                borderRadius: '8px',
                color: '#f3efe6',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
              placeholder="seu@email.com"
              aria-label="Email"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#bab4ab', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#121110',
                border: '1px solid #2d2b27',
                borderRadius: '8px',
                color: '#f3efe6',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
              placeholder="Mínimo 6 caracteres"
              aria-label="Senha"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(201, 52, 52, 0.12)',
              border: '1px solid #c93434',
              borderRadius: '8px',
              padding: '12px',
              color: '#c93434',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </Button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #2d2b27'
        }}>
          <button
            type="button"
            onClick={handleToggleMode}
            style={{
              backgroundColor: 'transparent',
              color: '#e58e26',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          style={{ marginTop: '16px', width: '100%' }}
        >
          Cancelar
        </Button>
      </Card>
    </div>
  );
};

export default LoginModal;