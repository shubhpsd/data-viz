import React, { useState, useEffect } from 'react'
import { Stream } from './Stream'
import { GraphState } from './Playground'

interface SidebarProps {
  graphState: GraphState
  sessionId: string | null
  onClose: () => void
  onQuestionSelect: (question: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ graphState, sessionId, onClose, onQuestionSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'trace' | 'history'>('trace')
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  useEffect(() => {
    if (activeTab === 'history' && sessionId) {
      fetchConversationHistory()
    }
  }, [activeTab, sessionId])

  const fetchConversationHistory = async () => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5001/conversation-history/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setConversationHistory(data.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error)
      setConversationHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 300)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getVisualizationIcon = (vizType: string) => {
    switch (vizType) {
      case 'bar': return '📊'
      case 'horizontal_bar': return '📊'
      case 'line': return '📈'
      case 'pie': return '🥧'
      case 'scatter': return '🔵'
      default: return '📄'
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-1/3 shadow-lg overflow-y-auto z-50 transition-all duration-300 ease-in-out bg-gradient-to-b from-slate-900 to-slate-800 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className='flex justify-between items-center mt-2 px-4 py-3 border-b border-slate-700'>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('trace')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'trace' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
        <button 
          onClick={handleClose} 
          className='text-slate-300 hover:text-white transition-colors text-sm'
        >
          Hide
        </button>
      </div>

      {/* Content */}
      <div className='p-4'>
        {activeTab === 'trace' ? (
          <Stream graphState={graphState} />
        ) : (
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Conversation History</h3>
            
            {loading ? (
              <div className="text-slate-300 text-center py-8">Loading history...</div>
            ) : conversationHistory.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                <p className="mb-2">No conversation history yet</p>
                <p className="text-sm">Ask your first question to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-600"
                    onClick={() => onQuestionSelect(entry.question)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-slate-400 text-xs">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-lg">
                        {getVisualizationIcon(entry.visualization_type)}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                      {entry.question}
                    </p>
                    {entry.results_summary && (
                      <p className="text-slate-300 text-xs">
                        {entry.results_summary}
                      </p>
                    )}
                    {entry.error_message && (
                      <p className="text-red-400 text-xs">
                        Error: {entry.error_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {sessionId && (
              <button
                onClick={fetchConversationHistory}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded transition-colors"
              >
                Refresh History
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
