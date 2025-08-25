import React from 'react'
import { GraphState } from './playground/Playground'

const Logo = ({ setGraphState }: { setGraphState: (graphState: GraphState | null) => void }) => {
  return (
    <div className='fixed hover:cursor-pointer top-4 left-20 z-50 group' onClick={() => setGraphState(null)}>
      <div className="flex items-center space-x-3 transition-all duration-300 group-hover:scale-105">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300
                      bg-gradient-to-br from-gruvbox-light-blue to-gruvbox-light-purple 
                      dark:from-gruvbox-dark-blue dark:to-gruvbox-dark-purple
                      group-hover:shadow-xl group-hover:from-gruvbox-light-purple group-hover:to-gruvbox-light-aqua
                      dark:group-hover:from-gruvbox-dark-purple dark:group-hover:to-gruvbox-dark-aqua">
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gruvbox-light-bg dark:text-gruvbox-dark-bg"
          >
            <path d="M3 13h2v8H3zM7 9h2v12H7zM11 5h2v16h-2zM15 8h2v13h-2zM19 2h2v19h-2z" fill="currentColor"/>
          </svg>
        </div>
        <div className="text-2xl font-bold font-mono transition-all duration-300">
          <span className="bg-gradient-to-r from-gruvbox-light-blue to-gruvbox-light-purple 
                         dark:from-gruvbox-dark-blue dark:to-gruvbox-dark-purple 
                         bg-clip-text text-transparent">
            DataViz
          </span>
          <span className="bg-gradient-to-r from-gruvbox-light-orange to-gruvbox-light-red 
                         dark:from-gruvbox-dark-orange dark:to-gruvbox-dark-red 
                         bg-clip-text text-transparent ml-1">
            Pro
          </span>
        </div>
      </div>
    </div>
  )
}

export default Logo