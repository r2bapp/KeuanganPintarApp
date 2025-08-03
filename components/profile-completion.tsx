'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ProfileCompletion() {
  const supabase = createClientComponentClient()
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, user_type')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setFullName(data.full_name || '')
        setUserType(data.user_type || '')
        if (!data.full_name || !data.user_type) {
          setShowForm(true)
        }
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName,
        user_type: userType,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Gagal menyimpan profil.')
    } else {
      toast.success('Profil berhasil diperbarui.')
      setShowForm(false)
    }
  }

  if (loading || !showForm) return null

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-md max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-4">Lengkapi Profil Anda</h2>

      <div className="mb-3">
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="userType">Tipe Pengguna</Label>
        <Input
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          placeholder="Contoh: personal, UMKM, pebisnis"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Simpan Profil
      </Button>
    </form>
  )
}
