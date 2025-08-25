import React from 'react'

interface HeaderProps {
  databaseFileName: string | null
  onDatabaseChange: () => void
}

const Header: React.FC<HeaderProps> = ({ databaseFileName, onDatabaseChange }) => {
  return (
    <div className="bg-gradient-to-r from-gruvbox-light-bg via-gruvbox-light-bg-soft to-gruvbox-light-bg 
                    dark:from-gruvbox-dark-bg dark:via-gruvbox-dark-bg-soft dark:to-gruvbox-dark-bg
                    border-b-2 border-gruvbox-light-fg4/30 dark:border-gruvbox-dark-fg4/30
                    transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 text-center">
          {/* Main Title */}
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-gruvbox-light-red via-gruvbox-light-orange to-gruvbox-light-yellow 
                           dark:from-gruvbox-dark-red dark:via-gruvbox-dark-orange dark:to-gruvbox-dark-yellow 
                           bg-clip-text text-transparent font-mono">
              DataViz
            </span>
            <span className="bg-gradient-to-r from-gruvbox-light-blue via-gruvbox-light-purple to-gruvbox-light-aqua 
                           dark:from-gruvbox-dark-blue dark:via-gruvbox-dark-purple dark:to-gruvbox-dark-aqua 
                           bg-clip-text text-transparent font-mono ml-2">
              Pro
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in">
            Transform your business data into <span className="text-gruvbox-light-green dark:text-gruvbox-dark-green font-semibold">actionable insights</span> with 
            natural language queries. Explore complex datasets, generate visualizations, and discover trends through 
            <span className="text-gruvbox-light-purple dark:text-gruvbox-dark-purple font-semibold"> intelligent analysis</span>.
          </p>
          
          {/* Status Bar */}
          <div className="flex items-center justify-center space-x-8 text-sm">
            {/* Database Status */}
            <div className="flex items-center bg-gruvbox-light-bg-soft/70 dark:bg-gruvbox-dark-bg-soft/70 
                          px-4 py-3 rounded-lg border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20
                          backdrop-blur-sm animate-slide-in">
              <div className="w-3 h-3 bg-gruvbox-light-green dark:bg-gruvbox-dark-green rounded-full mr-3 animate-pulse"></div>
              <span className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 font-medium">
                Database: <span className="text-gruvbox-light-blue dark:text-gruvbox-dark-blue font-mono">
                  {databaseFileName ? databaseFileName : 'Complex Business Intelligence (14 Tables)'}
                </span>
              </span>
            </div>
            
            {/* Change Database Button */}
            <button 
              onClick={onDatabaseChange}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 animate-slide-in
                       bg-gruvbox-light-orange/10 dark:bg-gruvbox-dark-orange/10
                       text-gruvbox-light-orange dark:text-gruvbox-dark-orange
                       border border-gruvbox-light-orange/30 dark:border-gruvbox-dark-orange/30
                       hover:bg-gruvbox-light-orange/20 dark:hover:bg-gruvbox-dark-orange/20
                       hover:border-gruvbox-light-orange dark:hover:border-gruvbox-dark-orange
                       hover:scale-105 hover:shadow-lg
                       active:scale-95"
            >
              📊 Change Database
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header