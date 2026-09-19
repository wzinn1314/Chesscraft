import React, { useState } from 'react';

interface LobbyModalProps {
  onStartGame: (
    roomId: string,
    isCreator: boolean,
    creatorColor: 'w' | 'b',
    initialTime: number
  ) => void;
  onCancel: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ onStartGame, onCancel }) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [inputRoomId, setInputRoomId] = useState('');
  const [creatorColor, setCreatorColor] = useState<'w' | 'b'>('w');
  const [minutes, setMinutes] = useState<number>(5);

  const handleCreateRoom = () => {
    const generatedRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onStartGame(generatedRoomId, true, creatorColor, minutes * 60);
  };

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      onStartGame(inputRoomId.trim().toUpperCase(), false, 'w', 300);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1c1b18',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #2d2b27',
        color: '#fff',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {mode === 'menu' && (
          <>
            <h2 style={{ margin: 0, textAlign: 'center' }}>Xadrez Online</h2>
            <button
              onClick={() => setMode('create')}
              style={{
                backgroundColor: '#629924',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Criar Nova Sala
            </button>
            <button
              onClick={() => setMode('join')}
              style={{
                backgroundColor: '#262421',
                color: '#fff',
                border: '1px solid #363431',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Entrar em uma Sala
            </button>
            <button
              onClick={onCancel}
              style={{
                backgroundColor: 'transparent',
                color: '#78736c',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </>
        )}

        {mode === 'create' && (
          <>
            <h3 style={{ margin: 0 }}>Configurar Sala</h3>


            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a8a39d' }}>
                Jogar de:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreatorColor('w')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: `2px solid ${creatorColor === 'w' ? '#629924' : '#363431'}`,
                    backgroundColor: creatorColor === 'w' ? 'rgba(98, 153, 36, 0.2)' : '#262421',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Brancas
                </button>
                <button
                  type="button"
                  onClick={() => setCreatorColor('b')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: `2px solid ${creatorColor === 'b' ? '#629924' : '#363431'}`,
                    backgroundColor: creatorColor === 'b' ? 'rgba(98, 153, 36, 0.2)' : '#262421',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Pretas
                </button>
              </div>
            </div>


            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a8a39d' }}>
                Tempo por jogador:
              </label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: '#262421',
                  border: '1px solid #363431',
                  color: '#fff'
                }}
              >
                <option value={1}>1 minuto</option>
                <option value={3}>3 minutos</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
              </select>
            </div>

            <button
              onClick={handleCreateRoom}
              style={{
                backgroundColor: '#629924',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Iniciar e Gerar Código
            </button>

            <button
              onClick={() => setMode('menu')}
              style={{ backgroundColor: 'transparent', color: '#78736c', border: 'none', cursor: 'pointer' }}
            >
              Voltar
            </button>
          </>
        )}

        {mode === 'join' && (
          <>
            <h3 style={{ margin: 0 }}>Entrar na Sala</h3>
            <input
              type="text"
              placeholder="Digite o código da sala (ex: X7K2P)"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: '#262421',
                border: '1px solid #363431',
                color: '#fff',
                textTransform: 'uppercase'
              }}
            />
            <button
              onClick={handleJoinRoom}
              style={{
                backgroundColor: '#629924',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Entrar na Partida
            </button>
            <button
              onClick={() => setMode('menu')}
              style={{ backgroundColor: 'transparent', color: '#78736c', border: 'none', cursor: 'pointer' }}
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LobbyModal;