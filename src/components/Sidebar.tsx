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
    <nav className="side-nav">
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
          <button type="button" className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            {isMenuOpen ? 'Fechar' : 'Menu'}
          </button>
        </div>
        {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
        <aside className={`mobile-drawer${isMenuOpen ? ' is-open' : ''}`}>{nav}</aside>
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
      </div>
      {nav}
    </aside>
  );
};

export default Sidebar;
