import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ResumeBuilder() {
  const { token, currentUser, loading, getJson, putJson, updateUser } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    currentPosition: '',
    location: '',
    bio: '',
    experience: '',
    skills: '',
    education: '',
    linkedinUrl: '',
    githubUrl: '',
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (loading || !token) return

    let cancelled = false
    const loadProfile = async () => {
      const result = await getJson('/api/v1/users/me/profile', token)
      if (!cancelled && result.ok && result.data) {
        setForm((prev) => ({ ...prev, ...result.data }))
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [loading, token, getJson])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    if (!token) return
    setIsSaving(true)
    setStatusMessage('')
    const result = await putJson('/api/v1/users/me/profile', token, form)
    setIsSaving(false)

    if (!result.ok) {
      setStatusMessage(result.message || 'Could not save resume profile.')
      return
    }

    updateUser(result.data)
    setStatusMessage('Resume profile saved. You can now use it for guidance and interview prep.')
  }

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Resume Builder</h1>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">Log in to build and save your resume profile.</p>
            <Link to="/login" className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
              Log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">Save your core resume content so CareerX-AI can personalize guidance.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="grid md:grid-cols-2 gap-5">
            {[
              ['firstName', 'First name'],
              ['lastName', 'Last name'],
              ['currentPosition', 'Current position'],
              ['location', 'Location'],
              ['linkedinUrl', 'LinkedIn URL'],
              ['githubUrl', 'GitHub URL'],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
                <input
                  name={name}
                  value={form[name] || ''}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            {[
              ['bio', 'Professional summary', 5],
              ['experience', 'Experience', 8],
              ['skills', 'Skills', 5],
              ['education', 'Education', 5],
            ].map(([name, label, rows]) => (
              <label key={name} className="block">
                <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
                <textarea
                  name={name}
                  value={form[name] || ''}
                  onChange={updateField}
                  rows={rows}
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={saveProfile}
              disabled={isSaving}
              className="rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Resume Profile'}
            </button>
            {statusMessage && (
              <span className={`text-sm ${statusMessage.startsWith('Resume') ? 'text-green-700' : 'text-red-700'}`}>
                {statusMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
