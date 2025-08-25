import React, { useState, useEffect } from 'react'

export const StreamRow = ({ heading, information }: { heading: string; information: string }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      setIsVisible(false)
    }
  }, [])

  // Color coding for different types of information
  const getHeadingColor = (heading: string) => {
    switch (heading.toLowerCase()) {
      case 'question':
        return 'text-gruvbox-light-blue dark:text-gruvbox-dark-blue'
      case 'sql query':
        return 'text-gruvbox-light-green dark:text-gruvbox-dark-green'
      case 'results':
        return 'text-gruvbox-light-purple dark:text-gruvbox-dark-purple'
      case 'error':
        return 'text-gruvbox-light-red dark:text-gruvbox-dark-red'
      case 'visualization':
        return 'text-gruvbox-light-yellow dark:text-gruvbox-dark-yellow'
      default:
        return 'text-gruvbox-light-orange dark:text-gruvbox-dark-orange'
    }
  }

  const getBorderColor = (heading: string) => {
    switch (heading.toLowerCase()) {
      case 'question':
        return 'border-gruvbox-light-blue/30 dark:border-gruvbox-dark-blue/30'
      case 'sql query':
        return 'border-gruvbox-light-green/30 dark:border-gruvbox-dark-green/30'
      case 'results':
        return 'border-gruvbox-light-purple/30 dark:border-gruvbox-dark-purple/30'
      case 'error':
        return 'border-gruvbox-light-red/30 dark:border-gruvbox-dark-red/30'
      case 'visualization':
        return 'border-gruvbox-light-yellow/30 dark:border-gruvbox-dark-yellow/30'
      default:
        return 'border-gruvbox-light-orange/30 dark:border-gruvbox-dark-orange/30'
    }
  }

  return (
    <div
      className={`relative w-full rounded-xl p-6 mb-4 border-2 transition-all duration-500 ease-in-out
                 bg-gruvbox-light-bg-soft/70 dark:bg-gruvbox-dark-bg-soft/70
                 backdrop-blur-sm shadow-lg hover:shadow-xl
                 ${getBorderColor(heading)}
                 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                 ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Heading with icon */}
      <div className={`flex items-center space-x-2 text-base font-bold mb-3 ${getHeadingColor(heading)}`}>
        <div className="w-2 h-2 rounded-full bg-current"></div>
        <span className="font-mono uppercase tracking-wide">{heading}</span>
      </div>
      
      {/* Information content */}
      <div className='text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 text-sm leading-relaxed
                    bg-gruvbox-light-bg/50 dark:bg-gruvbox-dark-bg/50 
                    rounded-lg p-4 border border-gruvbox-light-fg4/10 dark:border-gruvbox-dark-fg4/10'>
        {heading.toLowerCase() === 'sql query' ? (
          <pre className="font-mono text-gruvbox-light-fg dark:text-gruvbox-dark-fg overflow-x-auto whitespace-pre-wrap">
            {information}
          </pre>
        ) : heading.toLowerCase() === 'results' || heading.toLowerCase() === 'formatted data' ? (
          <pre className="font-mono text-xs text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 overflow-x-auto max-h-40 overflow-y-auto">
            {typeof information === 'string' ? information : JSON.stringify(information, null, 2)}
          </pre>
        ) : (
          <div className="text-gruvbox-light-fg dark:text-gruvbox-dark-fg">
            {information}
          </div>
        )}
      </div>
    </div>
  )
}