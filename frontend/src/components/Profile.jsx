import React, { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { currentUser, token, putJson, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    currentPosition: '',
    experience: '',
    skills: '',
    education: '',
    linkedinUrl: '',
    githubUrl: '',
    profileImageUrl: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const fileInputRef = useRef(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  // Crop state
  const [cropOpen, setCropOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState('')
  const [cropFileType, setCropFileType] = useState('image/jpeg')
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 220 })
  const cropContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ dx: 0, dy: 0 })
  const navigate = useNavigate()
  const apiBase = ''

  useLayoutEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        setApiError('')
        setIsLoadingProfile(true)

        const res = await fetch('/api/v1/users/me/profile', {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

        if (!res.ok) {
          const message = (data && data.message) || (typeof data === 'string' && data) || 'Failed to load profile'
          if (!cancelled) setApiError(message)
          return
        }

        const firstName = data?.firstName || ''
        const lastName = data?.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim()

        if (!cancelled) {
          const rawProfileUrl = data?.profileImageUrl || ''
          const absProfileUrl = rawProfileUrl && rawProfileUrl.startsWith('/') ? `${window.location.origin.replace(':5173', ':8080')}${rawProfileUrl}` : rawProfileUrl
          const profileUrl = absProfileUrl ? `${absProfileUrl}${absProfileUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : ''
          setFormData({
            name: fullName,
            email: data?.email || currentUser.email || '',
            bio: data?.bio || '',
            location: data?.location || '',
            currentPosition: data?.currentPosition || '',
            experience: data?.experience || '',
            skills: data?.skills || '',
            education: data?.education || '',
            linkedinUrl: data?.linkedinUrl || '',
            githubUrl: data?.githubUrl || '',
            profileImageUrl: profileUrl,
          })
        }
      } finally {
        if (!cancelled) setIsLoadingProfile(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [currentUser, navigate, token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    return newErrors
  }

  const initials = useMemo(() => {
    const name = (formData.name || currentUser?.email || 'U').trim()
    return name[0] ? name[0].toUpperCase() : 'U'
  }, [formData.name, currentUser?.email])

  const displayTitle = formData.currentPosition || 'Professional'

  const openFilePicker = () => {
    setImageError('')
    fileInputRef.current?.click()
  }

  const onPickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setImageError('Only JPG, PNG, or WEBP images are supported')
      e.target.value = ''
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError('Image must be <= 3MB')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(String(reader.result || ''))
      setCropFileType(file.type || 'image/jpeg')
      setCrop({ x: 0, y: 0, size: 220 })
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const clampCrop = (next) => {
    const container = cropContainerRef.current
    if (!container) return next
    const w = container.clientWidth
    const h = container.clientHeight
    const size = Math.max(120, Math.min(next.size, Math.min(w, h)))
    const x = Math.max(0, Math.min(next.x, w - size))
    const y = Math.max(0, Math.min(next.y, h - size))
    return { x, y, size }
  }

  const onCropMouseDown = (e) => {
    setIsDragging(true)
    dragOffsetRef.current = { dx: e.clientX - crop.x, dy: e.clientY - crop.y }
  }

  const onCropMouseMove = (e) => {
    if (!isDragging) return
    const next = clampCrop({ ...crop, x: e.clientX - dragOffsetRef.current.dx, y: e.clientY - dragOffsetRef.current.dy })
    setCrop(next)
  }

  const onCropMouseUp = () => {
    setIsDragging(false)
  }

  const renderCroppedBlob = async () => {
    const img = new Image()
    img.src = cropSrc
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const container = cropContainerRef.current
    if (!container) throw new Error('Crop container not ready')

    // crop coordinates are in container px; map to image px
    const scaleX = img.naturalWidth / container.clientWidth
    const scaleY = img.naturalHeight / container.clientHeight
    const sx = Math.round(crop.x * scaleX)
    const sy = Math.round(crop.y * scaleY)
    const sSizeX = Math.round(crop.size * scaleX)
    const sSizeY = Math.round(crop.size * scaleY)

    const canvas = document.createElement('canvas')
    const outSize = 512
    canvas.width = outSize
    canvas.height = outSize
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sSizeX, sSizeY, 0, 0, outSize, outSize)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, cropFileType === 'image/png' ? 'image/png' : 'image/jpeg', 0.9))
    if (!blob) throw new Error('Failed to create image blob')
    return blob
  }

  const uploadCroppedImage = async () => {
    setIsUploadingImage(true)
    setImageError('')
    try {
      const blob = await renderCroppedBlob()
      const fd = new FormData()
      const ext = cropFileType === 'image/png' ? 'png' : 'jpg'
      fd.append('image', new File([blob], `profile.${ext}`, { type: blob.type }))

      const res = await fetch('/api/v1/users/me/profile-image', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      })

      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

      if (!res.ok) {
        const message = (data && data.message) || (typeof data === 'string' && data) || 'Failed to upload image'
        setImageError(message)
        return
      }

      const rawUrl = data?.profileImageUrl || ''
      const absUrl = rawUrl && rawUrl.startsWith('/') ? `${window.location.origin.replace(':5173', ':8080')}${rawUrl}` : rawUrl
      const bustedUrl = absUrl ? `${absUrl}${absUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : ''

      setFormData((prev) => ({ ...prev, profileImageUrl: bustedUrl || prev.profileImageUrl }))
      // Keep navbar display in sync
      updateUser({ ...currentUser, firstName: data?.firstName, lastName: data?.lastName, email: data?.email, profileImageUrl: bustedUrl || absUrl || rawUrl })
      setCropOpen(false)
    } catch (e) {
      setImageError('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const [firstNameRaw, ...lastNameParts] = (formData.name || '').trim().split(/\s+/)
    const firstName = firstNameRaw || ''
    const lastName = lastNameParts.join(' ')

    setIsSaving(true)
    setApiError('')
    try {
      const result = await putJson('/api/v1/users/me/profile', token, {
        firstName,
        lastName,
        bio: formData.bio,
        location: formData.location,
        currentPosition: formData.currentPosition,
        experience: formData.experience,
        skills: formData.skills,
        education: formData.education,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        profileImageUrl: formData.profileImageUrl,
      })

      if (!result.ok) {
        setApiError(result.message || 'Failed to save profile')
        return
      }

      setIsEditing(false)
      setErrors({})

      // Update navbar/user instantly
      const server = result.data
      if (server?.email) updateUser(server)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
  }

  if (!currentUser || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/15 border border-white/30 overflow-hidden flex items-center justify-center">
                    {formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-bold text-white">{initials}</span>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="absolute -bottom-1 -right-1 bg-white text-green-700 hover:bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      Change
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={onPickImage}
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{formData.name || currentUser?.email}</h1>
                  <p className="text-green-100">{displayTitle}</p>
                  {formData.location && <p className="text-green-200">{formData.location}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg transition duration-150 ease-in-out border border-white/20"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">

            {apiError && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}

            {imageError && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{imageError}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-white">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentPosition" className="block text-sm font-medium text-white">
                      Current Position
                    </label>
                    <input
                      type="text"
                      id="currentPosition"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Software Engineer at Company"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                      Experience
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      rows={4}
                      value={formData.experience}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your professional experience..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Skills
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="JavaScript, React, Node.js, etc. (comma-separated)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <textarea
                      id="education"
                      name="education"
                      rows={3}
                      value={formData.education}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your educational background..."
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150 ease-in-out"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {formData.bio && (
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900">About</h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed">{formData.bio}</p>
                    </section>
                  )}

                  {formData.experience && (
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed">{formData.experience}</p>
                    </section>
                  )}

                  {formData.education && (
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-line leading-relaxed">{formData.education}</p>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                    {formData.skills ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.skills.split(',').map((skill, index) => (
                          <span key={index} className="bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full text-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-600">No skills added yet.</p>
                    )}
                  </section>

                  {(formData.linkedinUrl || formData.githubUrl) && (
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900">Links</h3>
                      <div className="mt-3 space-y-2">
                        {formData.linkedinUrl && (
                          <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:text-green-800 font-medium">
                            LinkedIn
                          </a>
                        )}
                        {formData.githubUrl && (
                          <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black font-medium">
                            GitHub
                          </a>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop modal (simple) */}
      {cropOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onMouseMove={onCropMouseMove}
          onMouseUp={onCropMouseUp}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => !isUploadingImage && setCropOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Crop profile photo</h3>
              <button
                type="button"
                onClick={() => !isUploadingImage && setCropOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <div ref={cropContainerRef} className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                {/* Image */}
                <img src={cropSrc} alt="Crop" className="absolute inset-0 w-full h-full object-contain" />

                {/* Crop square */}
                <div
                  role="presentation"
                  onMouseDown={onCropMouseDown}
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] cursor-move"
                  style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size }}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zoom</label>
                  <input
                    type="range"
                    min={120}
                    max={420}
                    value={crop.size}
                    onChange={(e) => setCrop((c) => clampCrop({ ...c, size: Number(e.target.value) }))}
                    className="w-full"
                    disabled={isUploadingImage}
                  />
                </div>

                <div className="flex sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCropOpen(false)}
                    disabled={isUploadingImage}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={uploadCroppedImage}
                    disabled={isUploadingImage}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
