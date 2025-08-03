'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database'

export function useAuth() {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('Auth error:', error.message)
        setUser(null)
        setLoading(false)
        return
      }

      setUser(user)
      setLoading(false)

      if (user) {
        // Auto insert or update user_profiles
        await supabase.from('user_profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? '',
          user_type: 'personal',
        })
      }
    }

    getUser()
  }, [])

  return { user, loading }
}
