import React from 'react';
import type { RecordedGameOutcome } from '../service/userService';

interface GameOverModalProps {
  outcome: RecordedGameOutcome;
  opponentName: string;
  onHome: () => void;
  onPlayAgain?: () => void;
}

const copy: Record<
  RecordedGameOutcome['result'],
  { title: string; color: string; subtitle: string }
> = {
  win: {
    title: 'Vitória',
    color: '#629924',
    subtitle: 'Resultado registrado no seu perfil.',
  },
  loss: {
    title: 'Derrota',
    color: '#c93434',
    subtitle: 'A partida entra no histórico.',
  },
  draw: {
    title: 'Empate',
    color: '#e58e26',
    subtitle: 'Partida equilibrada.',
  },
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  outcome,
  opponentName,
  onHome,
  onPlayAgain,
}) => {
  const ui = copy[outcome.result];
  const gained = outcome.ratingChange >= 0;
  const changeLabel = `${gained ? '+' : ''}${outcome.ratingChange}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1c1b18',
          border: '1px solid #2d2b27',
          borderRadius: '18px',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
        }}
      >
        <h2 style={{ margin: '0 0 6px 0', color: ui.color, fontSize: '28px', fontWeight: 800 }}>
          {ui.title}
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#bab4ab', fontSize: '14px' }}>
          vs. {opponentName} · {ui.subtitle}
        </p>

        <div
          style={{
            backgroundColor: '#121110',
            border: '1px solid #2d2b27',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '20px',
          }}
        >
          <div style={{ color: '#78736c', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            PONTOS {gained ? 'GANHOS' : 'PERDIDOS'}
          </div>
          <div style={{ color: ui.color, fontSize: '40px', fontWeight: 900, lineHeight: 1.1 }}>
            {changeLabel}
          </div>
          <div style={{ color: '#bab4ab', fontSize: '13px', marginTop: '8px' }}>
            Rating {outcome.previousRating} → <strong style={{ color: '#e58e26' }}>{outcome.newRating}</strong>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'Vitórias', value: outcome.stats.wins },
            { label: 'Derrotas', value: outcome.stats.losses },
            { label: 'Jogos', value: outcome.stats.totalGames },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: '#121110',
                borderRadius: '10px',
                padding: '10px 6px',
                border: '1px solid #2d2b27',
              }}
            >
              <div style={{ color: '#78736c', fontSize: '11px' }}>{item.label}</div>
              <div style={{ color: '#ffffff', fontWeight: 800 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onHome}
            style={{
              width: '100%',
              backgroundColor: '#e58e26',
              color: '#121110',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Voltar à tela principal
          </button>
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              style={{
                width: '100%',
                backgroundColor: '#121110',
                color: '#ffffff',
                border: '1px solid #3d3a34',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Jogar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
