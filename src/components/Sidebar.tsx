import React, { useState, useEffect } from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: '🏠 Dashboard', shortLabel: '🏠' },
    { id: 'vs-local', label: '👥 Passa e Joga', shortLabel: '👥' },
    { id: 'vs-online', label: '🌐 Jogar Online', shortLabel: '🌐' },
    { id: 'vs-computer', label: '🤖 Contra Computador', shortLabel: '🤖' },
    { id: 'puzzles', label: '🧩 Puzzles', shortLabel: '🧩' },
    { id: 'settings', label: '⚙️ Configurações', shortLabel: '⚙️' },
  ];

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: '#1c1b18',
            borderBottom: '1px solid #2d2b27',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={'/Gemini_Generated_Image_o5ngkwo5ngkwo5ng-removebg-preview.png'} alt="logo" className="logo logo--header" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#e58e26' }}>ChessCraft</h2>
            </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
          />
        )}

        {/* Mobile Menu */}
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: isMenuOpen ? 0 : '-100%',
            width: '280px',
            height: 'calc(100vh - 60px)',
            backgroundColor: '#1c1b18',
            transition: 'left 0.3s ease',
            zIndex: 1001,
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#e58e26' : 'transparent',
                  color: isActive ? '#121110' : '#a8a39d',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Spacer for fixed header */}
        <div style={{ height: '60px' }} />
      </>
    );
  }

  return (
    <aside style={{
      position: 'sticky',
      top: 0,
      alignSelf: 'flex-start',
      width: '220px',
      minWidth: '180px',
      maxWidth: '100%',
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#1c1b18',
      borderRight: '1px solid #2d2b27',
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px 16px', minWidth: 0, width: '100%', maxWidth: '100%' }}>
        <img
          src={'/Gemini_Generated_Image_o5ngkwo5ngkwo5ng-removebg-preview.png'}
          alt="logo"
          className="logo logo--sidebar"
          style={{
            width: '42px',
            height: '42px',
            objectFit: 'contain',
            flexShrink: 0,
            display: 'block'
          }}
        />
        <h2 style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          margin: 0,
          color: '#e58e26',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          maxWidth: '100%',
          flex: 1
        }}>ChessCraft</h2>
      </div>

      {menuItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isActive ? '#e58e26' : 'transparent',
              color: isActive ? '#121110' : '#a8a39d',
              fontWeight: isActive ? 700 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;