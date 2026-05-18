import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './components/Home'
import ResumeOptimizer from './components/ResumeOptimizer'
import ATSScore from './components/ATSScore'
import JobRecommender from './components/JobRecommender'
import InterviewAssistant from './components/InterviewAssistant'
import About from './components/About'
import CareerRoadmap from './components/CareerRoadmap'
import Login from './components/Login'
import Signup from './components/Signup'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Profile from './components/Profile'
import Messages from './components/Messages'
import ResumeBuilder from './components/ResumeBuilder'
import SEO from './components/SEO'
import ProtectedRoute from './components/ProtectedRoute'

function SimplePage({ title }) {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{title}</h1>
        <p className="text-gray-600 mb-6">This section is not part of the current CareerX-AI workflow yet.</p>
        <Link className="text-green-600 hover:underline" to="/">Go Home</Link>
      </div>
    </div>
  )
}

function NotFound() {
  return <SimplePage title="404 - Page Not Found" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <SEO />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="resume-optimizer" element={<ProtectedRoute><ResumeOptimizer /></ProtectedRoute>} />
            <Route path="ats-score" element={<ProtectedRoute><ATSScore /></ProtectedRoute>} />
            <Route path="job-recommender" element={<ProtectedRoute><JobRecommender /></ProtectedRoute>} />
            <Route path="interview-assistant" element={<ProtectedRoute><InterviewAssistant /></ProtectedRoute>} />
            <Route path="career-roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
            <Route path="about" element={<About />} />

            {/* Placeholder routes for currently-linked pages */}
            <Route path="applications" element={<ProtectedRoute><SimplePage title="My Applications" /></ProtectedRoute>} />
            <Route path="bookmarks" element={<ProtectedRoute><SimplePage title="My Bookmarks" /></ProtectedRoute>} />
            <Route path="edit-resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="forgot-password" element={<SimplePage title="Forgot Password" />} />
            <Route path="privacy" element={<SimplePage title="Privacy Policy" />} />
            <Route path="terms" element={<SimplePage title="Terms of Service" />} />
            <Route path="cookie" element={<SimplePage title="Cookie Policy" />} />
            <Route path="accessibility" element={<SimplePage title="Accessibility" />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
