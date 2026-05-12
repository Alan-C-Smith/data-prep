'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let supabase: any = null
    try {
      supabase = createClient()
    } catch (err) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        setError('Failed to get session')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (error) throw new Error('Supabase not configured')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) throw authError
  }

  const signUp = async (email: string, password: string) => {
    if (error) throw new Error('Supabase not configured')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) throw authError
  }

  const signOut = async () => {
    if (error) throw new Error('Supabase not configured')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signOut()
    if (authError) throw authError
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}