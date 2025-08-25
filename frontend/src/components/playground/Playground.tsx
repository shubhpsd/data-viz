import React, { useState, useEffect, useCallback, useRef } from 'react'
import Form from './Form'
import Logo from '../Logo'
import Header from './Header'
import ThemeToggle from '../ThemeToggle'

import { Client } from '@langchain/langgraph-sdk'
import { QuestionDisplay } from './QuestionDisplay'
import { Stream } from './Stream'
import { graphDictionary, InputType } from '../graphs/graphDictionary'
import UploadButton from '../UploadButton'
import { Sidebar } from './Sidebar'

type GraphComponentProps = InputType & { data: any }

const sampleQuestions = [
  'What are the top 5 best-selling products by revenue?',
  'Show customer acquisition trends by month',
  'Which product categories have the highest profit margins?',
  'Compare sales performance across different payment methods',
  'What is the average order value by customer loyalty tier?',
  'Show inventory turnover rates by product category',
  'Which employees have exceeded their sales targets?',
  'What are the peak shopping hours throughout the day?',
]

export type GraphState = {
  question: string
  uuid: string
  parsed_question: { [key: string]: any }
  unique_nouns: string[]
  sql_query: string
  sql_valid: boolean
  sql_issues: string
  results: any[]
  answer: string
  error: string
  visualization: string
  visualization_reason: string
  formatted_data_for_visualization: { [key: string]: any }
}

export default function Playground() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [displayedQuestions, setDisplayedQuestions] = useState<string[]>([])
  const [graphState, setGraphState] = useState<GraphState | null>(null)
  const [databaseUuid, setDatabaseUuid] = useState<string | null>(null)
  const [databaseFileName, setDatabaseFileName] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadDatabase = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SQLITE_URL + '/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.uuid
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }, [])

  const run = useCallback(
    async (question: string) => {
      try {
        setGraphState({
          question,
          uuid: '',
          parsed_question: {},
          unique_nouns: [],
          sql_query: '',
          sql_valid: false,
          sql_issues: '',
          results: [],
          answer: '',
          error: '',
          visualization: '',
          visualization_reason: '',
          formatted_data_for_visualization: {},
        })

        const response = await fetch('/api/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            databaseUuid,
            sessionId,
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed (${response.status}): ${await response.text()}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { value, done } = (await reader?.read()) || {}
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                setGraphState((prevState) => ({ ...prevState, ...data }))
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in run:', error)
        setGraphState((prevState) => ({
          question: prevState?.question || question,
          uuid: prevState?.uuid || '',
          parsed_question: prevState?.parsed_question || {},
          unique_nouns: prevState?.unique_nouns || [],
          sql_query: prevState?.sql_query || '',
          sql_valid: false,
          sql_issues: prevState?.sql_issues || '',
          results: [],
          answer: prevState?.answer || '',
          error: `API request failed: ${error}`,
          visualization: prevState?.visualization || '',
          visualization_reason: prevState?.visualization_reason || '',
          formatted_data_for_visualization: prevState?.formatted_data_for_visualization || {},
        }))
      }
    },
    [databaseUuid, sessionId],
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const uuid = await uploadDatabase(file)
        setDatabaseUuid(uuid)
        setDatabaseFileName(file.name)
        console.log(`File "${file.name}" uploaded successfully. UUID: ${uuid}`)
      } catch (error) {
        console.error('Failed to upload file:', error)
        alert('Failed to upload file')
      } finally {
        setIsUploading(false)
      }
    },
    [uploadDatabase, setDatabaseUuid, setDatabaseFileName],
  )

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleQuestions.length)
    }, 3000)

    return () => clearInterval(rotateInterval)
  }, [])

  useEffect(() => {
    const startIndex = currentIndex
    const endIndex = (currentIndex + 5) % sampleQuestions.length
    if (startIndex < endIndex) {
      setDisplayedQuestions(sampleQuestions.slice(startIndex, endIndex))
    } else {
      setDisplayedQuestions([...sampleQuestions.slice(startIndex), ...sampleQuestions.slice(0, endIndex)])
    }
  }, [currentIndex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question)
  }

  const onFormSubmit = useCallback(async () => {
    await run(selectedQuestion)
    setSelectedQuestion('')
  }, [run, selectedQuestion])

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  // Helper function to safely render visualization
  const renderVisualization = () => {
    if (!graphState?.visualization || !graphState?.formatted_data_for_visualization) {
      return null
    }

    const visualizationType = graphState.visualization as keyof typeof graphDictionary
    const visualizationConfig = graphDictionary[visualizationType]

    if (!visualizationConfig) {
      return (
        <div className="p-8 text-center bg-gruvbox-light-red/10 dark:bg-gruvbox-dark-red/10 rounded-xl border border-gruvbox-light-red/30 dark:border-gruvbox-dark-red/30">
          <h3 className="text-lg font-bold text-gruvbox-light-red dark:text-gruvbox-dark-red mb-2">
            Unsupported Visualization Type
          </h3>
          <p className="text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3">
            Visualization type "{graphState.visualization}" is not supported.
          </p>
          <p className="text-gruvbox-light-fg4 dark:text-gruvbox-dark-fg4 text-sm mt-2">
            Supported types: {Object.keys(graphDictionary).join(', ')}
          </p>
        </div>
      )
    }

    return React.createElement(
      visualizationConfig.component as React.ComponentType<any>,
      {
        data: graphState.formatted_data_for_visualization,
      },
    )
  }

  return (
    <div className='min-h-screen bg-gruvbox-light-bg dark:bg-gruvbox-dark-bg transition-colors duration-300'>
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Logo and Header */}
      <Logo setGraphState={setGraphState} />
      <Header 
        databaseFileName={databaseFileName}
        onDatabaseChange={() => {
          console.log('Database change requested')
        }}
      />
      
      {/* Upload Button */}
      <div className='fixed top-4 right-4 z-30'>
        <UploadButton onFileUpload={handleFileUpload} disabled={isUploading} />
      </div>

      {/* Main Content Area */}
      {!graphState?.formatted_data_for_visualization && (
        <div className='flex flex-col items-center justify-center min-h-[60vh] max-w-7xl mx-auto px-4 py-12'>
          <div className="text-center mb-12">
            <h2 className='text-4xl font-bold text-gruvbox-light-fg dark:text-gruvbox-dark-fg mb-6 font-mono'>
              Ask anything about your 
              <span className="text-gruvbox-light-blue dark:text-gruvbox-dark-blue"> business data</span>
            </h2>
            <p className="text-xl text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 mb-8 max-w-3xl mx-auto leading-relaxed">
              Type your question in natural language and get instant insights with beautiful visualizations
            </p>
          </div>
          
          {/* Main Form */}
          <Form
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            onFormSubmit={onFormSubmit}
            disabled={isUploading}
          />

          {/* Database Info and Sample Questions */}
          {!graphState && (
            <div className="max-w-6xl mx-auto px-4 mt-16">
              {/* Database Features */}
              <div className='text-center mb-16'>
                <div className='bg-gruvbox-light-bg-soft/70 dark:bg-gruvbox-dark-bg-soft/70 
                              rounded-2xl shadow-xl border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20 
                              p-8 mb-12 backdrop-blur-sm'>
                  <h3 className="text-2xl font-bold text-gruvbox-light-fg dark:text-gruvbox-dark-fg mb-6 font-mono">
                    🏢 Comprehensive Business Intelligence Database
                  </h3>
                  <p className='text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 mb-8 text-lg'>
                    Get started with our feature-rich database containing 14+ interconnected tables for advanced analytics:
                  </p>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    {[
                      { icon: '👥', label: 'Customer Analytics' },
                      { icon: '📈', label: 'Sales Performance' },
                      { icon: '📦', label: 'Product Inventory' },
                      { icon: '🛒', label: 'Order Management' },
                      { icon: '👨‍💼', label: 'Employee Metrics' },
                      { icon: '🌐', label: 'Website Analytics' },
                      { icon: '⭐', label: 'Review Analysis' },
                      { icon: '💰', label: 'Financial Reports' },
                      { icon: '🎯', label: 'Promotions & Discounts' },
                      { icon: '🏭', label: 'Supplier Management' },
                      { icon: '📂', label: 'Category Hierarchy' },
                      { icon: '📍', label: 'Address Management' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 
                                                   bg-gruvbox-light-bg/50 dark:bg-gruvbox-dark-bg/50 rounded-lg p-3
                                                   hover:bg-gruvbox-light-yellow/10 dark:hover:bg-gruvbox-dark-yellow/10
                                                   transition-colors duration-300">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sample Questions */}
              <QuestionDisplay displayedQuestions={displayedQuestions} handleQuestionClick={handleQuestionClick} />
            </div>
          )}
        </div>
      )}

      {/* Processing Stream */}
      {graphState && !(graphState.formatted_data_for_visualization || graphState.visualization == 'none') && (
        <div className='flex justify-center items-start mt-16 px-4'>
          <div className="w-full max-w-5xl">
            <h3 className="text-2xl font-bold text-gruvbox-light-fg dark:text-gruvbox-dark-fg mb-8 text-center font-mono">
              🧠 AI Processing Pipeline
            </h3>
            <Stream graphState={graphState} />
          </div>
        </div>
      )}

      {/* Text-only Results */}
      {graphState && graphState.visualization == 'none' && (
        <div id='answer_canvas' className='p-10 w-full flex flex-col items-center justify-center relative'>
          <button
            onClick={toggleSidebar}
            className='absolute top-12 right-12 px-6 py-3 rounded-xl font-medium transition-all duration-300
                     bg-gruvbox-light-blue/20 dark:bg-gruvbox-dark-blue/20
                     text-gruvbox-light-blue dark:text-gruvbox-dark-blue
                     border border-gruvbox-light-blue/30 dark:border-gruvbox-dark-blue/30
                     hover:bg-gruvbox-light-blue/30 dark:hover:bg-gruvbox-dark-blue/30
                     hover:scale-105 shadow-lg'
          >
            🔍 See Traces
          </button>
          
          <div className='flex w-full flex-col p-12 rounded-2xl 
                        bg-gruvbox-light-bg-soft dark:bg-gruvbox-dark-bg-soft 
                        border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20
                        shadow-xl items-center justify-center'>
            <div className='text-lg text-gruvbox-light-fg dark:text-gruvbox-dark-fg mx-20 leading-relaxed'>
              {graphState.answer}
            </div>
            {graphState.visualization_reason && (
              <div className='text-sm mt-8 text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 mx-20 italic'>
                {graphState.visualization_reason}
              </div>
            )}
          </div>
          
          {/* Follow-up Form */}
          <div className="w-full max-w-4xl mt-12 px-4">
            <div className="bg-gruvbox-light-bg-soft/70 dark:bg-gruvbox-dark-bg-soft/70 rounded-2xl p-8 
                          border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gruvbox-light-fg dark:text-gruvbox-dark-fg mb-6 font-mono">
                💬 Ask a follow-up question
              </h3>
              <Form
                selectedQuestion={selectedQuestion}
                setSelectedQuestion={setSelectedQuestion}
                onFormSubmit={onFormSubmit}
                disabled={isUploading}
              />
            </div>
          </div>

          {showSidebar && (
            <div ref={sidebarRef}>
              <Sidebar 
                graphState={graphState} 
                sessionId={sessionId}
                onClose={toggleSidebar}
                onQuestionSelect={(question) => {
                  setSelectedQuestion(question)
                  run(question)
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Visualization Results */}
      {graphState && graphState.formatted_data_for_visualization && (
        <div id='answer_canvas' className='p-10 w-full flex flex-col items-center justify-center relative'>
          <button
            onClick={toggleSidebar}
            className='absolute top-12 right-12 px-6 py-3 rounded-xl font-medium transition-all duration-300
                     bg-gruvbox-light-purple/20 dark:bg-gruvbox-dark-purple/20
                     text-gruvbox-light-purple dark:text-gruvbox-dark-purple
                     border border-gruvbox-light-purple/30 dark:border-gruvbox-dark-purple/30
                     hover:bg-gruvbox-light-purple/30 dark:hover:bg-gruvbox-dark-purple/30
                     hover:scale-105 shadow-lg'
          >
            📊 See Analysis
          </button>
          
          <div className='flex w-full flex-col p-12 rounded-2xl 
                        bg-gruvbox-light-bg-soft dark:bg-gruvbox-dark-bg-soft 
                        border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20
                        shadow-xl items-center justify-center'>
            <div className='text-sm text-gruvbox-light-fg dark:text-gruvbox-dark-fg mx-20 mb-8'>
              {graphState.answer && <div className='markdown-content'>{graphState.answer}</div>}
            </div>
            
            {/* Safe Visualization Rendering */}
            {renderVisualization()}
          </div>
          
          {/* Follow-up Form */}
          <div className="w-full max-w-4xl mt-12 px-4">
            <div className="bg-gruvbox-light-bg-soft/70 dark:bg-gruvbox-dark-bg-soft/70 rounded-2xl p-8 
                          border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gruvbox-light-fg dark:text-gruvbox-dark-fg mb-6 font-mono">
                💬 Ask a follow-up question
              </h3>
              <Form
                selectedQuestion={selectedQuestion}
                setSelectedQuestion={setSelectedQuestion}
                onFormSubmit={onFormSubmit}
                disabled={isUploading}
              />
            </div>
          </div>

          {showSidebar && (
            <div ref={sidebarRef}>
              <Sidebar 
                graphState={graphState} 
                sessionId={sessionId}
                onClose={toggleSidebar}
                onQuestionSelect={(question) => {
                  setSelectedQuestion(question)
                  run(question)
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}