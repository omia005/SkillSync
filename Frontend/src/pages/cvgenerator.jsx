import React from 'react'

function Cvgenerator() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">CV Generator</h1>
        <p className="text-gray-600 text-lg mb-4">
          Coming soon — Generate polished, ATS-friendly CVs instantly from your profile data.
        </p>
        <p className="text-sm text-gray-400">
          Use the <strong>CV Builder</strong> in the sidebar to start creating your resume now.
        </p>
      </div>
    </div>
  )
}

export default Cvgenerator