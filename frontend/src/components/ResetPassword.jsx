import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setOtp(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedOtp = otp.trim()

    if (!sanitizedEmail) {
      setError('Email is required')
      return
    }
    if (!sanitizedOtp) {
      setError('OTP is required')
      return
    }
    if (!/^\d{6}$/.test(sanitizedOtp)) {
      setError('OTP must be a 6-digit number')
      return
    }
    if (!newPassword) {
      setError('New password is required')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    const result = await resetPassword(sanitizedEmail, sanitizedOtp, newPassword)
    setIsLoading(false)

    if (result.ok) {
      setSuccess('Your password has been successfully reset! You can now log in instantly.')
      setEmail('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setError(result.message || 'Failed to reset password. The OTP may be invalid or expired.')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="text-4xl font-bold text-green-600 dark:text-green-400">
            CareerX-AI
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Choose a strong new password to secure your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          
          {success ? (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/30">
                <p className="text-sm font-semibold text-green-800 dark:text-green-400 text-center">{success}</p>
              </div>
              <div>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                >
                  Log in now
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  6-Digit OTP Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    pattern="\d{6}"
                    maxLength="6"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm text-center font-mono font-bold tracking-widest text-lg"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="New password (8+ characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-750 pt-4">
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400">
              &larr; Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
