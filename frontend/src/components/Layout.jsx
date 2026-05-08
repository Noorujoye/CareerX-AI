import React, { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Inline SVG icons (instead of emojis) so the UI looks consistent across devices
// and doesn't depend on the platform emoji font.
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
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

function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.7H9.1l-.4 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L4.6 13a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1L2.5 16.6l2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h5.8l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5L19.4 15z" />
    </svg>
  )
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  const [avatarBust, setAvatarBust] = useState(0)

  const isActivePath = (to) => location.pathname === to

  const [isMenuOpen, setIsMenuOpen] = useState(false) // mobile sidebar drawer
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)

  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: 'en',
    fontSize: 'medium'
  })

  const profileRef = useRef(null)

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/ats-score', label: 'ATS Score' },
    { to: '/resume-optimizer', label: 'Resume Optimizer' },
    { to: '/job-recommender', label: 'Job Recommender' },
    { to: '/interview-assistant', label: 'Interview Assistant' },
    { to: '/about', label: 'About' },
  ]


  useEffect(() => {
    try {
      const saved = localStorage.getItem('careerxai-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
  }, [])

  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [settings.darkMode])

  useEffect(() => {
    try {
      localStorage.setItem('careerxai-settings', JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save settings:', e)
    }
  }, [settings])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
        setIsProfileSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  useEffect(() => {
    setAvatarBust(Date.now())
  }, [currentUser?.profileImageUrl])

  // Keep UI consistent when navigating: close any open popovers/drawers.
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsProfileSettingsOpen(false)
  }, [location.pathname])

  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev)
    setIsProfileSettingsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  const userName = (currentUser && (currentUser.name || currentUser.displayName || currentUser.email)) || 'Profile'
  const rawAvatarUrl = currentUser?.profileImageUrl || ''
  const absAvatarUrl = rawAvatarUrl && rawAvatarUrl.startsWith('/')
    ? `${window.location.origin.replace(':5173', ':8080')}${rawAvatarUrl}`
    : rawAvatarUrl
  const userAvatarUrl = absAvatarUrl
    ? `${absAvatarUrl}${absAvatarUrl.includes('?') ? '&' : '?'}t=${avatarBust}`
    : ''

  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="backdrop-blur-md bg-black border-b border-white/10 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center gap-3">

              {/* Mobile: Hamburger + Logo (grouped so they don't drift to center) */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-white hover:bg-white/10"
                  aria-label="Open menu"
                >
                  <IconMenu className="w-6 h-6" />
                </button>

                <Link to="/" className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white">CareerX-AI</span>
                </Link>
              </div>

              {/* Global Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-6">
                <input
                  type="text"
                  placeholder="Search jobs, people, companies"
                  className="w-full px-4 py-2 rounded-full bg-white text-gray-800 border-2 border-transparent focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Right-side actions (grouped so they stay aligned on small screens) */}
              <div className="ml-auto flex items-center gap-2 md:gap-4">

                {/* Desktop Nav: show only on larger screens to avoid cramped/hidden links */}
                <ul className="hidden lg:flex items-center gap-6">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`font-medium transition text-white ${
                          isActivePath(item.to)
                            ? 'text-blue-300'
                            : 'hover:text-blue-300'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {currentUser ? (
                  <>
                    {/* Profile */}
                    <div ref={profileRef} className="relative">
                      <button
                        onClick={toggleProfile}
                        className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center font-semibold text-lg transition-colors"
                        aria-label="Profile"
                      >
                        {userAvatarUrl ? (
                          <img src={userAvatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          userName[0].toUpperCase()
                        )}
                      </button>

                      {isProfileOpen && (
                  <div className={`absolute right-0 mt-2 ${isProfileSettingsOpen ? 'w-72' : 'w-64'} bg-green-50 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-lg">
                          {userAvatarUrl ? (
                            <img src={userAvatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            userName[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{userName}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{currentUser?.email}</div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">

                        {/* Menu */}
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block p-2 text-gray-900 dark:text-gray-100 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">Profile</Link>
                        <Link to="/applications" onClick={() => setIsProfileOpen(false)} className="block p-2 text-gray-900 dark:text-gray-100 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">My Applications</Link>
                        <Link to="/bookmarks" onClick={() => setIsProfileOpen(false)} className="block p-2 text-gray-900 dark:text-gray-100 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">My Bookmarks</Link>
                        <Link to="/edit-resume" onClick={() => setIsProfileOpen(false)} className="block p-2 text-gray-900 dark:text-gray-100 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">Edit Resume</Link>

                        {/* Settings */}
                        <button onClick={() => setIsProfileSettingsOpen(!isProfileSettingsOpen)} className="w-full p-2 text-left text-gray-900 dark:text-gray-100 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                          <IconSettings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>

                        {isProfileSettingsOpen && (
                          <div className="mt-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Light / Dark mode</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                                  settings.darkMode
                                    ? 'bg-green-600 border-green-600'
                                    : 'bg-gray-200 border-gray-300'
                                }`}
                                aria-label="Toggle dark mode"
                                aria-pressed={settings.darkMode}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Logout */}
                        <button onClick={handleLogout} className="w-full text-left p-2 text-red-600 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/15 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            />

            {/* Drawer */}
            <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100" onClick={() => setIsMenuOpen(false)}>
                    CareerX-AI
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close menu"
                  >
                    <IconClose className="w-5 h-5" />
                  </button>
                </div>

                {/* Search in drawer for small screens */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="mt-4">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md transition-colors ${
                            isActivePath(item.to)
                              ? 'bg-green-100 text-green-800'
                              : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}

                    {currentUser ? (
                      <li>
                        <button
                          type="button"
                          onClick={() => { setIsMenuOpen(false); handleLogout() }}
                          className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Logout
                        </button>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">
                            Sign In
                          </Link>
                        </li>
                        <li>
                          <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">
                            Sign Up
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="pt-20 container mx-auto px-4 text-gray-900 dark:text-gray-100">
          <div className={
            settings.fontSize === 'small' ? 'text-sm' :
            settings.fontSize === 'large' ? 'text-lg' :
            'text-base'
          }>
            <Outlet />
          </div>
        </main>

      </div>
    </>
  )
}

export default Layout
