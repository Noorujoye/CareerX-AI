import React, { useState } from 'react'

function ResumeOptimizer() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check if file is PDF or DOC/DOCX
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file)
        setUploadStatus('')
      } else {
        setUploadStatus('Please select a PDF or Word document (.doc, .docx)')
        setSelectedFile(null)
      }
    }
  }

  const handleOptimize = () => {
    if (!selectedFile) {
      setUploadStatus('Please select a resume file first')
      return
    }
    setUploadStatus('Resume optimization is not connected yet. Wire this page to a backend endpoint to process and return an optimized resume.')
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-green-800 mb-6">Resume Optimizer</h3>
          <p className="text-xl text-center text-gray-600 mb-12">Enhance your resume with AI-powered suggestions to stand out to employers.</p>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-green-200/50 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">Key Features</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>AI-powered keyword optimization</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>ATS-friendly formatting</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Industry-specific suggestions</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Real-time feedback</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer inline-block"
                  >
                    Choose Resume File
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600 mb-4">Selected: {selectedFile.name}</p>
                )}
                <button
                  onClick={handleOptimize}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Optimize My Resume
                </button>
              </div>
            </div>
          </div>

          {uploadStatus && (
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 text-center">
              <p className="text-gray-700">{uploadStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeOptimizer
