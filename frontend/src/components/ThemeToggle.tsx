import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-gruvbox-light-bg-soft dark:bg-gruvbox-dark-bg-soft 
                 border-2 border-gruvbox-light-fg4 dark:border-gruvbox-dark-fg4
                 text-gruvbox-light-fg dark:text-gruvbox-dark-fg
                 hover:bg-gruvbox-light-yellow/20 dark:hover:bg-gruvbox-dark-yellow/20 
                 hover:border-gruvbox-light-yellow dark:hover:border-gruvbox-dark-yellow
                 transition-all duration-300 ease-in-out transform hover:scale-105 
                 shadow-lg hover:shadow-xl"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {theme === 'light' ? (
          // Moon icon for dark mode toggle
          <svg 
            className="w-6 h-6 text-gruvbox-light-purple" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          // Sun icon for light mode toggle
          <svg 
            className="w-6 h-6 text-gruvbox-dark-yellow" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
