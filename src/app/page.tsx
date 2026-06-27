'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('Session check error:', error)
        return
      }

      if (user) {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Login button clicked')

    setLoading(true)

    try {
      console.log('Attempting login')

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      console.log('Login response:', data)
      console.log('Login error:', error)

      if (error) {
        alert('Login failed: ' + error.message)
        return
      }

      console.log('Login successful')

      alert('Login successful')

      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)

      alert('Unexpected login error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="page-container flex min-h-screen items-center justify-center">
          <div className="card w-full max-w-sm">
            <h1 className="section-title mb-6 text-center">
              Transport Login
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  )
}