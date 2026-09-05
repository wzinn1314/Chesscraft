import React, { useState } from 'react';

export const PuzzlesArena: React.FC = () => {
  const [solved, setSolved] = useState(12);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 'bold' }}>🧩 Puzzles Táticos</h1>
          <p style={{ color: '#bab4ab', margin: 0, fontSize: '15px' }}>Resolva problemas táticos para subir seu rating.</p>
        </div>
        <div style={{ backgroundColor: '#21201d', padding: '10px 18px', borderRadius: '12px', border: '1px solid #2d2b27' }}>
          <span style={{ color: '#bab4ab', fontSize: '13px' }}>Resolvidos hoje: </span>
          <strong style={{ color: '#e58e26', fontSize: '16px' }}>{solved}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        <div style={{
          width: '100%',
          maxWidth: '560px',
          height: '560px',
          backgroundColor: '#21201d',
          borderRadius: '12px',
          border: '1px solid #2d2b27',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#bab4ab',
          justifySelf: 'center'
        }}>
          ♟️ [ Tabuleiro de Puzzle Tático ]
        </div>

        <div style={{
          backgroundColor: '#21201d',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #2d2b27',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px' }}>Objetivo</h3>
          <p style={{ color: '#bab4ab', fontSize: '14px', margin: 0 }}>
            Encontre a melhor sequência para as <strong style={{ color: '#ffffff' }}>Brancas</strong> (Mate em 2).
          </p>

          <button 
            onClick={() => setSolved(prev => prev + 1)}
            style={{
              backgroundColor: '#e58e26',
              color: '#161512',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Próximo Puzzle ➡️
          </button>
        </div>

      </div>
    </div>
  );
};

export default PuzzlesArena;