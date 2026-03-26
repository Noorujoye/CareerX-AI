import React from 'react'

function InterviewAssistant() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-green-800 mb-6">Interview Assistant</h3>
          <p className="text-xl text-center text-gray-600 mb-12">Practice interview questions and track your progress (coming soon).</p>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-green-200/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">Preparation Tools</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Mock interview practice</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Common question database</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Performance analytics</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Personalized tips</li>
                </ul>
              </div>
              <div className="text-center">
                <button
                  disabled
                  className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold opacity-60 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewAssistant
