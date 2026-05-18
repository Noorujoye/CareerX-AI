import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Loading your profile...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
