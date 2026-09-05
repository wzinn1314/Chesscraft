import React, { useEffect, useState } from 'react';
import {
  getRecentGames,
  getUserId,
  getUserStats,
  getWinRate,
  subscribeToProfileCache,
  type GameResult,
  type UserStats,
} from '../../service/userService';

const theme = {
  colors: {
    background: '#121110',
    surface: '#1c1b18',
    border: '#2d2b27',
    borderLight: '#3d3a34',
    primary: '#e58e26',
    success: '#629924',
    loss: '#c93434',
    textPrimary: '#ffffff',
    textSecondary: '#bab4ab',
    textMuted: '#78736c',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(229, 142, 38, 0.25)',
  }
};

interface DashboardHomeProps {
  playerName: string;
  onSelectMode: (mode: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ playerName, onSelectMode }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);

  useEffect(() => {
    const userId = getUserId(playerName);
    const load = () => {
      void getUserStats(userId).then(setStats);
      setRecentGames(getRecentGames(userId));
    };
    load();
    return subscribeToProfileCache(load);
  }, [playerName]);

  const initial = (playerName.trim()[0] || '?').toUpperCase();
  const rating = stats?.rating ?? 1200;
  const winRate = stats ? getWinRate(stats) : 0;

  const resultLabel = (result: GameResult['result']) => {
    if (result === 'win') return { text: 'Vitória', color: theme.colors.success };
    if (result === 'loss') return { text: 'Derrota', color: theme.colors.loss };
    return { text: 'Empate', color: theme.colors.textMuted };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: '28px 32px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.card,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: `linear-gradient(135deg, ${theme.colors.surface} 0%, #262420 100%)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '54px', lineHeight: 1 }}>♟️</div>
              <div>
                <h1 style={{ color: theme.colors.textPrimary, fontSize: '28px', margin: '0 0 4px 0', fontWeight: 800 }}>
                  Olá, {playerName}
                </h1>
                <p style={{ color: theme.colors.textSecondary, margin: 0, fontSize: '15px' }}>
                  Seu perfil e pontos ficam salvos neste dispositivo.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onSelectMode('vs-computer')}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#121110',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: theme.shadows.glow,
                }}
              >
                🤖 Jogar vs IA
              </button>
              <button
                onClick={() => onSelectMode('vs-local')}
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.borderLight}`,
                  padding: '14px 24px',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⚔️ Passa & Joga
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div
              onClick={() => onSelectMode('puzzles')}
              style={{
                backgroundColor: theme.colors.surface,
                padding: '20px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>🧩</span>
                <span style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: 700 }}>
                  {stats?.totalGames ?? 0} JOGOS
                </span>
              </div>
              <div>
                <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>
                  Puzzles Táticos
                </h3>
                <p style={{ color: theme.colors.textMuted, margin: 0, fontSize: '13px' }}>
                  Resolva desafios e melhore sua visão tática.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.colors.surface,
              padding: '20px',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>📈</span>
                <span style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: 700 }}>
                  {winRate}% WIN
                </span>
              </div>
              <div>
                <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>
                  Aproveitamento
                </h3>
                <p style={{ color: theme.colors.textMuted, margin: 0, fontSize: '13px' }}>
                  {stats?.wins ?? 0} vitórias · {stats?.losses ?? 0} derrotas · {stats?.draws ?? 0} empates
                </p>
              </div>
            </div>

            <div
              onClick={() => onSelectMode('vs-computer')}
              style={{
                backgroundColor: theme.colors.surface,
                padding: '20px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                <span style={{ color: theme.colors.textMuted, fontSize: '12px', fontWeight: 700 }}>JOGAR</span>
              </div>
              <div>
                <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>
                  Treinar com Bots
                </h3>
                <p style={{ color: theme.colors.textMuted, margin: 0, fontSize: '13px' }}>
                  Ganhe pontos ao vencer o computador.
                </p>
              </div>
            </div>
          </div>

          <section style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h2 style={{ color: theme.colors.textPrimary, margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>
              Começar uma partida
            </h2>
            <div
              onClick={() => onSelectMode('vs-computer')}
              style={{
                backgroundColor: theme.colors.background,
                padding: '16px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '24px' }}>🤖</div>
                <div>
                  <div style={{ color: theme.colors.textPrimary, fontWeight: 700, fontSize: '15px' }}>
                    Partida vs Computador
                  </div>
                  <div style={{ color: theme.colors.textMuted, fontSize: '13px', marginTop: '2px' }}>
                    Vitória: +15 pts · Derrota: -15 pts
                  </div>
                </div>
              </div>
              <span style={{
                backgroundColor: 'rgba(229, 142, 38, 0.15)',
                color: theme.colors.primary,
                padding: '6px 12px',
                borderRadius: theme.borderRadius.sm,
                fontSize: '12px',
                fontWeight: 800
              }}>
                JOGAR
              </span>
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: '20px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.primary,
                color: '#121110',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '22px'
              }}>
                {initial}
              </div>
              <div>
                <h3 style={{ color: theme.colors.textPrimary, margin: 0, fontSize: '18px', fontWeight: 800 }}>{playerName}</h3>
                <span style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: 700 }}>SALVO NO DISPOSITIVO</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{
                backgroundColor: theme.colors.background,
                padding: '12px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                  ⚡ RATING
                </div>
                <div style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 800 }}>
                  {rating}
                </div>
              </div>
              <div style={{
                backgroundColor: theme.colors.background,
                padding: '12px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                  🎯 PARTIDAS
                </div>
                <div style={{ color: theme.colors.primary, fontSize: '18px', fontWeight: 800 }}>
                  {stats?.totalGames ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: '20px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700 }}>
              Partidas Recentes
            </h3>
            {recentGames.length === 0 ? (
              <p style={{ color: theme.colors.textMuted, fontSize: '13px', margin: 0 }}>
                Nenhuma partida ainda. Jogue contra a IA para registrar pontos.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentGames.slice(0, 5).map((game, index) => {
                  const label = resultLabel(game.result);
                  const isLast = index === Math.min(recentGames.length, 5) - 1;
                  return (
                    <div
                      key={`${game.date}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: isLast ? 0 : '10px',
                        borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}`
                      }}
                    >
                      <div>
                        <div style={{ color: theme.colors.textPrimary, fontSize: '13px', fontWeight: 700 }}>
                          vs. {game.opponentName}
                        </div>
                        <div style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                          {label.text} · {new Date(game.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{ color: label.color, fontWeight: 800, fontSize: '13px' }}>
                        {`${(game.ratingChange ?? 0) > 0 ? '+' : ''}${game.ratingChange ?? 0}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardHome;
