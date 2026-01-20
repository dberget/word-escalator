"use client";

import React, { useState, useEffect, useRef } from 'react';

// Custom SVG icons designed for letterpress aesthetic
// Bold, geometric shapes that feel like brass printing blocks
const GameIcons: Record<string, () => JSX.Element> = {
  'guess-hex': () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      {/* Hexagon divided into 3 color segments */}
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 12L12 2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 12L21 7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 12L3 7" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    </svg>
  ),
  'dial-words': () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      {/* Rotary dial with finger holes */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="5.5" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="18.5" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  'wordforge': () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      {/* Anvil shape - representing the forge */}
      <path d="M4 14H20V16C20 17 19 18 18 18H6C5 18 4 17 4 16V14Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 14V10C6 9 7 8 8 8H16C17 8 18 9 18 10V14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M10 8V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 8V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'word-escalator': () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      {/* Ascending stairs */}
      <path d="M4 20H8V16H12V12H16V8H20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 20V16" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 12V8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20 8V4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="20" cy="4" r="1.5" fill="currentColor"/>
    </svg>
  ),
  'wordfall': () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      {/* Cascading/falling blocks */}
      <rect x="4" y="3" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="10" y="7" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="15" y="11" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6.5 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2"/>
      <path d="M12.5 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2"/>
      <path d="M17.5 16V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2"/>
    </svg>
  ),
};

const GAMES = [
  { id: 'guess-hex', name: 'Guess Hex', url: 'https://guesshex.com' },
  { id: 'dial-words', name: 'Dial Words', url: 'https://dial-words.com/' },
  { id: 'wordforge', name: 'WordForge', url: 'https://word-forge.app/' },
  { id: 'word-escalator', name: 'Word Escalator', url: 'https://wordescalator.com' },
  { id: 'wordfall', name: 'Wordfall', url: 'https://play-wordfall.com/' },
];

type Theme = 'light' | 'cream' | 'dark';

interface GameNavProps {
  currentGame: string;
  theme?: Theme;
}

const themeClasses = {
  light: {
    nav: 'bg-white/85 border-black/10',
    text: 'text-gray-800',
    textMuted: 'text-gray-500',
    menu: 'bg-white/95 border-black/10',
    menuItem: 'text-gray-700 hover:bg-black/5',
    menuItemCurrent: 'bg-indigo-500/10 text-indigo-600',
    hamburger: 'bg-gray-800',
  },
  cream: {
    nav: 'bg-[#F9F6F0]/90 border-[#1C1917]/10',
    text: 'text-[#1C1917]',
    textMuted: 'text-[#78716C]',
    menu: 'bg-[#F9F6F0]/98 border-[#1C1917]/10',
    menuItem: 'text-[#44403C] hover:bg-[#1C1917]/5',
    menuItemCurrent: 'bg-red-700/10 text-red-700',
    hamburger: 'bg-[#1C1917]',
  },
  dark: {
    nav: 'bg-[#0c0c0e]/90 border-white/10',
    text: 'text-[#f5f5f4]',
    textMuted: 'text-[#a8a8a8]',
    menu: 'bg-[#141417]/98 border-white/10',
    menuItem: 'text-[#e5e5e5] hover:bg-white/8',
    menuItemCurrent: 'bg-[#e8b86d]/15 text-[#e8b86d]',
    hamburger: 'bg-[#f5f5f4]',
  },
};

/**
 * GameNav - Hamburger navigation component for daily games (Tailwind version)
 */
export default function GameNav({ currentGame, theme = 'light' }: GameNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const currentGameData = GAMES.find(g => g.id === currentGame);
  const classes = themeClasses[theme];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-[1000] h-12 sm:h-[52px] border-b backdrop-blur-xl ${classes.nav}`}
      aria-label="Game navigation"
    >
      <div className="flex items-center h-full px-3 sm:px-4 gap-3 sm:gap-3.5">
        {/* Hamburger toggle */}
        <button
          className="flex items-center justify-center w-9 h-9 p-0 bg-transparent border-none rounded-lg cursor-pointer hover:bg-gray-500/10 transition-colors duration-150"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="game-nav-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="flex flex-col justify-center items-center w-5 h-5 relative">
            <span
              className={`block w-[18px] h-0.5 rounded-sm absolute transition-transform duration-200 ${classes.hamburger} ${
                isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`block w-[18px] h-0.5 rounded-sm absolute transition-opacity duration-200 ${classes.hamburger} ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-[18px] h-0.5 rounded-sm absolute transition-transform duration-200 ${classes.hamburger} ${
                isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>

        {/* Current game display */}
        {currentGameData && (
          <span className={`flex items-center gap-2 text-[15px] sm:text-base font-semibold ${classes.text}`}>
            <span className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.textMuted}`}>
              {GameIcons[currentGameData.id]?.()}
            </span>
            <span>{currentGameData.name}</span>
          </span>
        )}
      </div>

      {/* Dropdown menu */}
      <div
        id="game-nav-menu"
        className={`absolute top-full left-0 right-0 border-b overflow-hidden transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${classes.menu} ${
          isOpen ? 'max-h-[280px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
        }`}
        role="menu"
      >
        {GAMES.map(game => {
          const Icon = GameIcons[game.id];
          return (
            <a
              key={game.id}
              href={game.url}
              className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 no-underline text-[15px] sm:text-base font-medium transition-colors duration-150 ${
                game.id === currentGame
                  ? `${classes.menuItemCurrent} font-semibold cursor-default`
                  : classes.menuItem
              }`}
              role="menuitem"
              aria-current={game.id === currentGame ? 'page' : undefined}
            >
              <span className="w-5 h-5 shrink-0">
                {Icon && <Icon />}
              </span>
              <span className="flex-1">{game.name}</span>
              {game.id !== currentGame && (
                <span className="opacity-50 shrink-0 transition-all duration-150 group-hover:opacity-80 group-hover:translate-x-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
