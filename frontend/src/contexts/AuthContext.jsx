import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'careerxai-token'

function decodeJwtSubject(token) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')

    const json = atob(payload)
    const data = JSON.parse(json)
    return data?.sub || null
  } catch {
    return null
  }
}

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message = (data && data.message) || (typeof data === 'string' && data) || 'Request failed'
    return { ok: false, status: res.status, message }
  }

  return { ok: true, data }
}

async function getJson(path, token) {
  const res = await fetch(path, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message = (data && data.message) || (typeof data === 'string' && data) || 'Request failed'
    return { ok: false, status: res.status, message }
  }

  return { ok: true, data }
}

async function putJson(path, token, body) {
  const res = await fetch(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message = (data && data.message) || (typeof data === 'string' && data) || 'Request failed'
    return { ok: false, status: res.status, message }
  }

  return { ok: true, data }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) {
          if (!cancelled) setCurrentUser(null)
          return
        }

        const emailFromToken = decodeJwtSubject(token)
        if (!cancelled) setCurrentUser(emailFromToken ? { email: emailFromToken } : null)

        // Authoritative fetch: validate token and fetch server-side user info
        const me = await getJson('/api/v1/users/me', token)
        if (!cancelled) {
          if (me.ok && me.data?.email) setCurrentUser(me.data)
          else {
            // Token is invalid/expired or backend rejected it
            localStorage.removeItem(TOKEN_KEY)
            setCurrentUser(null)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const signup = async (newUser) => {
    const email = (newUser?.email || '').trim().toLowerCase()
    const password = newUser?.password || ''
    const firstName = (newUser?.firstName || '').trim()
    const lastName = (newUser?.lastName || '').trim()
    if (!email) return { ok: false, message: 'Email is required' }
    if (!password) return { ok: false, message: 'Password is required' }

    const result = await postJson('/api/v1/auth/register', {
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      password,
    })

    if (!result.ok) return { ok: false, message: result.message }

    const token = result.data?.token
    if (!token) return { ok: false, message: 'No token returned from server' }

    localStorage.setItem(TOKEN_KEY, token)

    
    const me = await getJson('/api/v1/users/me', token)
    const user = me.ok && me.data?.email ? me.data : { email: decodeJwtSubject(token) || email }
    setCurrentUser(user)
    return { ok: true, user, token }
  }

  const login = async (email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail) return { ok: false, message: 'Email is required' }
    if (!password) return { ok: false, message: 'Password is required' }

    const result = await postJson('/api/v1/auth/login', {
      email: normalizedEmail,
      password,
    })

    if (!result.ok) return { ok: false, message: result.message }

    const token = result.data?.token
    if (!token) return { ok: false, message: 'No token returned from server' }

    localStorage.setItem(TOKEN_KEY, token)

    const me = await getJson('/api/v1/users/me', token)
    const user = me.ok && me.data?.email ? me.data : { email: decodeJwtSubject(token) || normalizedEmail }
    setCurrentUser(user)
    return { ok: true, user, token }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setCurrentUser(null)
  }

  const updateUser = (updatedUser) => {
    if (!updatedUser?.email) return
    setCurrentUser(updatedUser)
  }

  const value = useMemo(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    return { currentUser, loading, login, signup, logout, updateUser, token, getJson, putJson }
  }, [currentUser, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}