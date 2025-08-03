"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle() // Use maybeSingle instead of single to handle no rows

      if (error) {
        console.error("Error fetching profile:", error)
        return
      }

      if (!data) {
        // Profile doesn't exist, this might happen if registration didn't complete properly
        console.log("No profile found for user, this is normal for new users")
        setProfile(null)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, userType: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create user profile with better error handling
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        user_type: userType as any,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't throw error here, let the user continue and we'll handle it in fetchProfile
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
