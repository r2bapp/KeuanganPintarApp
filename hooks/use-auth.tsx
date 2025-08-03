"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Auth error:", error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
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
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Profile fetch error:", error)
        return
      }

      if (!data) {
        // Profile doesn't exist, create a basic one
        console.log("No profile found, creating basic profile...")
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            id: userId,
            email: "",
            full_name: "",
            user_type: "personal",
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)
          return
        }

        setProfile(newProfile)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error("Profile fetch error:", error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id)

      if (error) throw error

      // Refresh profile
      await fetchProfile(user.id)
      return true
    } catch (error) {
      console.error("Profile update error:", error)
      return false
    }
  }

  return {
    user,
    profile,
    loading,
    refetch: () => user && fetchProfile(user.id),
    updateProfile,
  }
}
