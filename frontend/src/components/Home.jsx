import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function IconTarget(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M22 12h-2" />
      <path d="M12 22v-2" />
      <path d="M2 12h2" />
    </svg>
  )
}

function IconDocument(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  )
}

function IconChat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  )
}

function IconMap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  )
}

function Home() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-50 via-green-100 to-green-200 text-gray-800 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-green-100/50 to-green-200/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-4 leading-tight">Unlock Your Career Potential with AI</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">Discover personalized career paths, skill recommendations, and job opportunities powered by advanced AI technology.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">AI-Powered</span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">ATS-Friendly</span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Career Guidance</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="bg-green-600 text-white px-10 py-4 rounded-full font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Profile
                </Link>
                <Link
                  to="/resume-optimizer"
                  className="bg-white text-green-600 border-2 border-green-600 px-10 py-4 rounded-full font-semibold hover:bg-green-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-10 py-4 rounded-full font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Now
                </Link>
                <Link
                  to="/ats-score"
                  className="bg-white text-green-600 border-2 border-green-600 px-10 py-4 rounded-full font-semibold hover:bg-green-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Check ATS Score
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Why Choose CareerX-AI?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:border-green-200 border-2 border-transparent">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <IconTarget className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">AI Job Recommendations</h3>
              <p className="text-gray-600">Get personalized job matches based on your skills and preferences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:border-green-200 border-2 border-transparent">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <IconDocument className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">ATS Resume Optimizer</h3>
              <p className="text-gray-600">Optimize your resume to pass ATS filters and impress recruiters.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:border-green-200 border-2 border-transparent">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <IconChat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Interview Assistant</h3>
              <p className="text-gray-600">Practice interviews with AI-powered feedback and tips.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:border-green-200 border-2 border-transparent">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <IconMap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Career Roadmap</h3>
              <p className="text-gray-600">Plan your career journey with personalized guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-To-Action */}
      <section className="py-20 bg-linear-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Join thousands of professionals who have accelerated their careers with CareerX-AI.</p>
          <Link
            to="/signup"
            className="bg-white text-green-600 px-12 py-4 rounded-full font-semibold hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:shadow-green-500/50"
          >
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
