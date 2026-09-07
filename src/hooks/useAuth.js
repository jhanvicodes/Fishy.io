import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    }).catch(err => {
      console.warn('Supabase getSession error:', err)
      setLoading(false)
    })

    // Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      // Mock session for development if Supabase env is not configured
      const mockSession = {
        user: { id: 'mock-user-123', email },
      }
      setSession(mockSession)
      return { data: { session: mockSession }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'mock-user-123', email }
      return { user: mockUser, session: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(err => console.warn('Sign out error:', err))
    }
    setSession(null)
  }, [])

  return {
    session,
    user: session?.user || null,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
