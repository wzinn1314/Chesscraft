import React, { useEffect, useState } from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Início' },
  { id: 'vs-local', label: 'Passa e joga' },
  { id: 'vs-online', label: 'Online' },
  { id: 'vs-computer', label: 'Computador' },
  { id: 'puzzles', label: 'Puzzles' },
  { id: 'tournaments', label: 'Torneios' },
  { id: 'settings', label: 'Ajustes' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nav = (
    <nav className="side-nav" aria-label="Navegação principal">
      {menuItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item${isActive ? ' is-active' : ''}`}
            onClick={() => {
              onSelectTab(item.id);
              setIsMenuOpen(false);
            }}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Ir para ${item.label}`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <div className="mobile-bar">
          <div className="brand">
            <img src="/Gemini_Generated_Image_o5ngkwo5ngkwo5ng-removebg-preview.png" alt="ChessCraft" className="logo logo--header" />
            <strong>ChessCraft</strong>
          </div>
          <button 
            type="button" 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? 'Fechar' : 'Menu'}
          </button>
        </div>
        {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />}
        <aside 
          id="mobile-menu"
          className={`mobile-drawer${isMenuOpen ? ' is-open' : ''}`}
          aria-label="Menu de navegação mobile"
        >{nav}</aside>
        <div className="mobile-spacer" />
      </>
    );
  }

  return (

    <aside className="sidebar">
      <div className="brand brand--side">
        <img src="/Gemini_Generated_Image_o5ngkwo5ngkwo5ng-removebg-preview.png" alt="ChessCraft" className="logo logo--sidebar" />
        <div>
          <strong>ChessCraft</strong>
          <span>Mesa de xadrez</span>
        </div>

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
      {nav}
    </aside>
  );
};

export default Sidebar;
