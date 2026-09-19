import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { database } from '../service/firebase';
import { ref, push, onValue, off, set } from 'firebase/database';
import { logger } from '../utils/logger';
import { getCache, setCache } from '../service/cache';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  type?: 'text' | 'system' | 'quick';
}

interface ChatProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
}

const QUICK_MESSAGES = ['Boa jogada', 'Obrigado', 'Sua vez', 'Vamos jogar', 'Partida equilibrada'];
const cacheKey = (roomId: string) => `chesscraft_chat_${roomId}`;

export const Chat: React.FC<ChatProps> = ({ roomId, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [connection, setConnection] = useState<'online' | 'local'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = getCache(cacheKey(roomId));
    setMessages(Array.isArray(cached) ? cached as ChatMessage[] : []);
    const chatRef = ref(database, `chat/${roomId}`);

    onValue(chatRef, (snapshot) => {
      setConnection('online');
      if (snapshot.exists()) {
        const messagesData = snapshot.val() as Record<string, ChatMessage>;
        const messagesArray = Object.values(messagesData).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesArray);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, () => setConnection('local'));

    return () => {
      off(chatRef);
    };
  }, [roomId]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message: string, type: 'text' | 'quick' = 'text') => {
    if (!message.trim()) return;

    const chatMessage: ChatMessage = {
      id: `${currentUserId}-${Date.now()}`,
      roomId,
      userId: currentUserId,
      userName: currentUserName,
      message: message.trim(),
      timestamp: Date.now(),
      type,
    };

    const saveLocally = () => {
      setMessages((current) => {
        const next = [...current, chatMessage];
        setCache(cacheKey(roomId), next.slice(-100));
        return next;
      });
      setConnection('local');
    };

    try {
      const chatRef = ref(database, `chat/${roomId}`);
      const newMessageRef = push(chatRef);
      await set(newMessageRef, { ...chatMessage, id: newMessageRef.key! });

      logger.info('Mensagem enviada', 'Chat', { roomId, userId: currentUserId });

      if (type === 'text') {
        setNewMessage('');
      }
    } catch (error) {
      logger.error('Erro ao enviar mensagem', 'Chat', { error });
      saveLocally();
      if (type === 'text') setNewMessage('');
    }
  };

  const handleSendQuickMessage = (message: string) => {
    void sendMessage(message, 'quick');
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100 }}>
        <Button
          variant="primary"
          onClick={() => setIsOpen(true)}
          style={{
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          aria-label="Abrir chat"
        >
          Chat
        </Button>
        {messages.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#c93434',
            color: '#ffffff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
          }}>
            {messages.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '360px',
      maxHeight: '500px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Card variant="elevated" padding="md" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '500px',
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #2d2b27',
        }}>
          <h3 style={{ color: '#f3efe6', margin: 0, fontSize: '16px', fontWeight: 700 }}>
            Chat da Sala
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar chat"
          >
            Fechar
          </Button>
        </div>
        {connection === 'local' && (
          <p style={{ color: '#d4a054', fontSize: '11px', margin: '0 0 8px' }}>
            Não foi possível conectar ao chat desta sala no momento.
          </p>
        )}


        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#121110',
          borderRadius: '8px',
          minHeight: '200px',
          maxHeight: '300px',
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#78736c',
              padding: '20px',
              fontSize: '14px',
            }}>
              Nenhuma mensagem ainda. Seja o primeiro a dizer olá.
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.userId === currentUserId;
              const isSystem = msg.type === 'system';

              return (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '8px',
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    backgroundColor: isSystem
                      ? 'transparent'
                      : isOwnMessage
                        ? '#e58e26'
                        : '#2d2b27',
                    color: isSystem
                      ? '#78736c'
                      : isOwnMessage
                        ? '#161512'
                        : '#f3efe6',
                    padding: isSystem ? '4px 8px' : '8px 12px',
                    borderRadius: isSystem ? '0' : '12px',
                    fontSize: isSystem ? '12px' : '14px',
                    textAlign: isSystem ? 'center' : 'left',
                    fontStyle: isSystem ? 'italic' : 'normal',
                  }}>
                    {!isOwnMessage && !isSystem && (
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        marginBottom: '4px',
                        color: isOwnMessage ? '#161512' : '#e58e26',
                      }}>
                        {msg.userName}
                      </div>
                    )}
                    <div>{msg.message}</div>
                    <div style={{
                      fontSize: '10px',
                      marginTop: '4px',
                      opacity: 0.7,
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>


        <div style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            padding: '8px',
            backgroundColor: '#1c1b18',
            borderRadius: '8px',
          }}>
            {QUICK_MESSAGES.map((message) => (
              <button
                key={message}
                type="button"
                onClick={() => handleSendQuickMessage(message)}
                style={{
                  backgroundColor: '#25231f',
                  border: '1px solid #3d3a34',
                  color: '#f3efe6',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
                aria-label={`Enviar mensagem: ${message}`}
              >
                {message}
              </button>
            ))}
          </div>
        </div>


        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            maxLength={200}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: '#121110',
              border: '1px solid #2d2b27',
              borderRadius: '8px',
              color: '#f3efe6',
              fontSize: '14px',
            }}
            aria-label="Mensagem"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!newMessage.trim()}
          >
            Enviar
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Chat;
