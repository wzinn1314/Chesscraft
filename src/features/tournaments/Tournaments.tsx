import React from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export const Tournaments: React.FC = () => {
  const tournaments = [
    {
      id: 'blitz',
      name: 'Blitz Tournament',
      description: 'Partidas rápidas de 5 minutos',
      timeControl: '5+0',
      players: 16,
      maxPlayers: 16,
      status: 'open' as const,
      icon: '⚡',
    },
    {
      id: 'rapid',
      name: 'Rapid Tournament',
      description: 'Partidas de 10 minutos',
      timeControl: '10+0',
      players: 12,
      maxPlayers: 16,
      status: 'open' as const,
      icon: '🎯',
    },
    {
      id: 'classical',
      name: 'Classical Tournament',
      description: 'Partidas clássicas de 30 minutos',
      timeControl: '30+0',
      players: 8,
      maxPlayers: 16,
      status: 'open' as const,
      icon: '♟️',
    },
    {
      id: 'bullet',
      name: 'Bullet Tournament',
      description: 'Partidas ultra-rápidas de 1 minuto',
      timeControl: '1+0',
      players: 20,
      maxPlayers: 32,
      status: 'open' as const,
      icon: '🔥',
    },
  ];

  const handleJoinTournament = () => {
    // Em produção, aqui entraria no torneio
    alert('Torneio selecionado! Em breve você poderá participar de torneios reais.');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#f3efe6', 
          margin: '0 0 8px', 
          fontWeight: 800 
        }}>
          Torneios
        </h1>
        <p style={{ color: '#bab4ab', margin: 0, fontSize: '15px' }}>
          Participe de torneios e prove suas habilidades
        </p>
      </div>

      {/* Tournament Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Card 
              variant="elevated" 
              padding="lg"
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {tournament.icon}
              </div>
              
              <h3 style={{ 
                color: '#f3efe6', 
                margin: '0 0 8px', 
                fontSize: '20px', 
                fontWeight: 700 
              }}>
                {tournament.name}
              </h3>
              
              <p style={{ 
                color: '#bab4ab', 
                margin: '0 0 16px', 
                fontSize: '14px',
                flexGrow: 1
              }}>
                {tournament.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #2d2b27'
              }}>
                <div>
                  <div style={{ color: '#78736c', fontSize: '12px', marginBottom: '4px' }}>
                    Controle de tempo
                  </div>
                  <Badge variant="primary" size="sm">
                    {tournament.timeControl}
                  </Badge>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#78736c', fontSize: '12px', marginBottom: '4px' }}>
                    Jogadores
                  </div>
                  <Badge variant={tournament.status === 'open' ? 'success' : 'default'} size="sm">
                    {tournament.players}/{tournament.maxPlayers}
                  </Badge>
                </div>
              </div>

              <Button
                variant={tournament.status === 'open' ? 'primary' : 'secondary'}
                fullWidth
                onClick={handleJoinTournament}
                disabled={tournament.status !== 'open'}
              >
                {tournament.status === 'open' ? 'Participar' : 'Lotado'}
              </Button>
            </Card>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <Card variant="default" padding="lg" style={{ marginTop: '32px' }}>
        <h2 style={{ color: '#f3efe6', margin: '0 0 16px', fontSize: '20px', fontWeight: 700 }}>
          Como funcionam os torneios
        </h2>
        
        <div className="info-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
            <h3 style={{ color: '#f3efe6', margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>
              Inscrição
            </h3>
            <p style={{ color: '#bab4ab', fontSize: '14px', margin: 0 }}>
              Escolha um torneio aberto e clique em participar
            </p>
          </div>

          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
            <h3 style={{ color: '#f3efe6', margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>
              Formato
            </h3>
            <p style={{ color: '#bab4ab', fontSize: '14px', margin: 0 }}>
              Sistemas suíço ou round-robin dependendo do número de jogadores
            </p>
          </div>

          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
            <h3 style={{ color: '#f3efe6', margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>
              Pontuação
            </h3>
            <p style={{ color: '#bab4ab', fontSize: '14px', margin: 0 }}>
              Vitória: 1 ponto | Empate: 0.5 ponto | Derrota: 0 pontos
            </p>
          </div>

          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎮</div>
            <h3 style={{ color: '#f3efe6', margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>
              Partidas
            </h3>
            <p style={{ color: '#bab4ab', fontSize: '14px', margin: 0 }}>
              Todas as partidas são jogadas online em tempo real
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Tournaments;