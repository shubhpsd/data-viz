export const QuestionDisplay = ({
  displayedQuestions,
  handleQuestionClick,
}: {
  displayedQuestions: string[]
  handleQuestionClick: (question: string) => void
}) => {
  return (
    <div className='mb-12 w-full text-center'>
      <h3 className="text-2xl font-bold text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-8 font-mono">
        ✨ Try these sample questions
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {displayedQuestions.map((question, index) => {
          // Check if this is the last item and we have an odd number of questions
          const isLastItemOdd = index === displayedQuestions.length - 1 && displayedQuestions.length % 2 === 1
          
          return (
            <div
              key={index}
              className={`cursor-pointer p-6 rounded-xl transition-all duration-500 transform
                        bg-gruvbox-light-bg-soft/60 dark:bg-gruvbox-dark-bg-soft/60
                        border border-gruvbox-light-fg4/20 dark:border-gruvbox-dark-fg4/20
                        hover:bg-gruvbox-light-yellow/10 dark:hover:bg-gruvbox-dark-yellow/10
                        hover:border-gruvbox-light-yellow dark:hover:border-gruvbox-dark-yellow
                        hover:scale-105 hover:shadow-xl
                        backdrop-blur-sm group animate-fade-in
                        text-lg opacity-90 hover:opacity-100
                        ${isLastItemOdd ? 'md:col-span-2 md:max-w-lg md:mx-auto' : ''}`}
              style={{
                animation: `float ${Math.random() * 2 + 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
              onClick={() => handleQuestionClick(question)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gruvbox-light-green dark:bg-gruvbox-dark-green
                                group-hover:bg-gruvbox-light-yellow dark:group-hover:bg-gruvbox-dark-yellow
                                transition-colors duration-300"></div>
                </div>
                <p className="text-gruvbox-light-fg dark:text-gruvbox-dark-fg font-medium leading-relaxed
                            group-hover:text-gruvbox-light-yellow dark:group-hover:text-gruvbox-dark-yellow
                            transition-colors duration-300">
                  {question}
                </p>
              </div>
              
              {/* Hover Effect Icon */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex justify-end">
                  <svg className="w-5 h-5 text-gruvbox-light-blue dark:text-gruvbox-dark-blue" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}