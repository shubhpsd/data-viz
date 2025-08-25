import React, { useState, useEffect } from 'react'

interface ConversationEntry {
  id: number
  question: string
  timestamp: string
  visualization_type: string
  results_summary: string
  error_message?: string
}

interface ConversationHistoryProps {
  sessionId: string | null
  onQuestionSelect: (question: string) => void
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  sessionId, 
  onQuestionSelect 
}) => {
  const [history, setHistory] = useState<ConversationEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchHistory()
    }
  }, [sessionId])

  const fetchHistory = async () => {
    if (!sessionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:5001/conversation-history/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversation history')
      }
      
      const data = await response.json()
      setHistory(data.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching conversation history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return '📊'
      case 'line':
        return '📈'
      case 'pie':
        return '🥧'
      case 'scatter':
        return '🔸'
      case 'horizontal_bar':
        return '📋'
      default:
        return '📄'
    }
  }

  if (!sessionId) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No active session
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">
        <p>Error loading history</p>
        <button 
          onClick={fetchHistory}
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No conversation history yet. Start by asking a question!
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Questions</h3>
      
      {history.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onQuestionSelect(entry.question)}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-medium text-gray-800 line-clamp-2">
              {entry.question}
            </span>
            <span className="text-lg ml-2 flex-shrink-0">
              {getVisualizationIcon(entry.visualization_type)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{entry.results_summary}</span>
            <span>{formatTimestamp(entry.timestamp)}</span>
          </div>
          
          {entry.error_message && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Error: {entry.error_message}
            </div>
          )}
        </div>
      ))}
      
      <button
        onClick={fetchHistory}
        className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Refresh History
      </button>
    </div>
  )
}

export default ConversationHistory 