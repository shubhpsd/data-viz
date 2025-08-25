import React, { useRef, useState } from 'react'

interface UploadButtonProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
}

const UploadButton: React.FC<UploadButtonProps> = ({ onFileUpload, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size should be less than 1 MB')
        return
      }
      if (file.name.endsWith('.sqlite') || file.name.endsWith('.csv')) {
        setFileName(file.name)
        onFileUpload(file)
      } else {
        alert('Please select a valid .sqlite or .csv file')
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleClick = () => {
    triggerFileInput()
  }

  return (
    <div className='fixed top-4 right-4 z-50'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        name='file'
        accept='.sqlite,.csv'
        className='hidden'
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform
                   bg-gruvbox-light-bg-soft dark:bg-gruvbox-dark-bg-soft
                   text-gruvbox-light-fg dark:text-gruvbox-dark-fg
                   border-2 border-gruvbox-light-fg4/30 dark:border-gruvbox-dark-fg4/30
                   hover:bg-gruvbox-light-green/20 dark:hover:bg-gruvbox-dark-green/20
                   hover:border-gruvbox-light-green dark:hover:border-gruvbox-dark-green
                   hover:text-gruvbox-light-green dark:hover:text-gruvbox-dark-green
                   hover:scale-105 hover:shadow-lg
                   active:scale-95 shadow-md
                   ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
      >
        <div className="flex items-center space-x-2">
          {fileName ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-sm">
                {disabled ? `Uploading: ${fileName}` : `Uploaded: ${fileName}`}
              </span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload SQLite or CSV</span>
            </>
          )}
        </div>
      </button>
    </div>
  )
}

export default UploadButton