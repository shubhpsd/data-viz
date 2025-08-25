import React, { useState } from 'react'

interface FormProps {
  selectedQuestion: string
  setSelectedQuestion: (question: string) => void
  onFormSubmit: () => void
  disabled?: boolean
}

export default function Form({ selectedQuestion, setSelectedQuestion, onFormSubmit, disabled }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onFormSubmit()
    setIsSubmitting(false)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <form onSubmit={handleSubmit} className='flex w-full justify-center'>
        <div className="relative flex w-full max-w-4xl">
          {/* Input Field */}
          <input
            type='text'
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            placeholder='Ask a question about your data...'
            className='px-8 py-5 flex-1 rounded-l-xl text-lg font-medium
                     bg-gruvbox-light-bg-soft dark:bg-gruvbox-dark-bg-soft
                     text-gruvbox-light-fg dark:text-gruvbox-dark-fg
                     placeholder-gruvbox-light-fg4 dark:placeholder-gruvbox-dark-fg4
                     border-2 border-r-0 
                     border-gruvbox-light-blue/40 dark:border-gruvbox-dark-blue/40
                     focus:border-gruvbox-light-blue dark:focus:border-gruvbox-dark-blue
                     focus:outline-none focus:ring-2 focus:ring-gruvbox-light-blue/20 dark:focus:ring-gruvbox-dark-blue/20
                     shadow-lg hover:shadow-xl transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed'
            required
            disabled={isSubmitting || disabled}
          />
          
          {/* Submit Button */}
          <button
            type='submit'
            className='px-10 py-5 rounded-r-xl text-lg font-bold transition-all duration-300
                     bg-gradient-to-r from-gruvbox-light-blue to-gruvbox-light-aqua 
                     dark:from-gruvbox-dark-blue dark:to-gruvbox-dark-aqua
                     text-gruvbox-light-bg dark:text-gruvbox-dark-bg
                     hover:from-gruvbox-light-purple hover:to-gruvbox-light-blue
                     dark:hover:from-gruvbox-dark-purple dark:hover:to-gruvbox-dark-blue
                     shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                     disabled:from-gruvbox-light-gray disabled:to-gruvbox-light-gray
                     dark:disabled:from-gruvbox-dark-gray dark:disabled:to-gruvbox-dark-gray 
                     disabled:cursor-not-allowed disabled:hover:scale-100
                     border-2 border-gruvbox-light-blue/40 dark:border-gruvbox-dark-blue/40
                     hover:border-gruvbox-light-purple dark:hover:border-gruvbox-dark-purple'
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-gruvbox-light-bg/30 dark:border-gruvbox-dark-bg/30 
                              border-t-gruvbox-light-bg dark:border-t-gruvbox-dark-bg mr-3"></div>
                <span className="font-mono">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span>Ask Question</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}