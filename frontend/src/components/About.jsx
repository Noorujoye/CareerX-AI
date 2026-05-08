import React from 'react'

function IconRobot(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3v3" />
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 11h.01" />
      <path d="M15 11h.01" />
      <path d="M9 15h6" />
    </svg>
  )
}

function IconTarget(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-6" />
      <path d="M12 16v-10" />
      <path d="M16 16v-4" />
    </svg>
  )
}

function IconRocket(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 9l-1 1" />
      <path d="M18 6c-4 1-7 4-8 8l-4 4-1-5 4-4c4-1 7-4 8-8z" />
      <path d="M9 15l-1 1" />
    </svg>
  )
}

function About() {
  return (
    <div className="min-h-screen bg-green-50 py-20">
      <div className="container mx-auto px-4">
        <h3 className="text-4xl font-bold text-center text-green-800 mb-12">About CareerX-AI</h3>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 mb-12">
            <p className="text-xl text-gray-700 mb-6 text-center">CareerX-AI is revolutionizing career guidance by leveraging cutting-edge artificial intelligence to provide personalized career advice, skill assessments, and job matching services.</p>
            <p className="text-lg text-gray-600 text-center">Our platform analyzes your skills, interests, and market trends to help you make informed decisions about your professional future.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-green-200/50 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <h4 className="text-2xl font-semibold text-green-800 mb-4">For Job Seekers</h4>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Personalized resume optimization</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>AI-powered job recommendations</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Interview preparation tools</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Career path guidance</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Skill gap analysis</li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-green-200/50 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <h4 className="text-2xl font-semibold text-green-800 mb-4">For Professionals</h4>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Career advancement planning</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Industry trend insights</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Networking opportunities</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Leadership development</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Salary negotiation tips</li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-green-200/50 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <h4 className="text-2xl font-semibold text-green-800 mb-4">For Students</h4>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Major and career exploration</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Internship matching</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Academic planning</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Skill building roadmaps</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 shrink-0"></span>Future job market predictions</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h4 className="text-3xl font-bold text-green-800 mb-6">Why Choose CareerX-AI?</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                  <IconRobot className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-semibold text-green-800 mb-2">AI-Powered</h5>
                <p className="text-gray-600 text-sm">Advanced algorithms for accurate recommendations</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                  <IconTarget className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-semibold text-green-800 mb-2">Personalized</h5>
                <p className="text-gray-600 text-sm">Tailored advice based on your unique profile</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                  <IconChart className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-semibold text-green-800 mb-2">Data-Driven</h5>
                <p className="text-gray-600 text-sm">Insights from millions of career data points</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                  <IconRocket className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-semibold text-green-800 mb-2">Always Updated</h5>
                <p className="text-gray-600 text-sm">Real-time market trends and opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
