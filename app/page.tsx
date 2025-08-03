"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordInput } from "@/components/ui/password-input"
import { useRouter } from "next/navigation"
import {
  Brain,
  Users,
  User,
  GraduationCap,
  ShoppingCart,
  Building2,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from "lucide-react"
import { supabase, testSupabaseConnection } from "@/lib/supabase"
import { Footer } from "@/components/footer"
import { ConnectionTest } from "@/components/connection-test"

const userTypes = [
  {
    id: "family",
    title: "Keuangan Keluarga",
    description: "Kelola keuangan rumah tangga dengan fitur lengkap untuk keluarga",
    icon: Users,
    color: "bg-navy-600",
  },
  {
    id: "personal",
    title: "Keuangan Pribadi",
    description: "Catat pemasukan, pengeluaran, dan tabungan pribadi",
    icon: User,
    color: "bg-sage-600",
  },
  {
    id: "student",
    title: "Siswa/Mahasiswa",
    description: "Kelola uang saku, biaya kuliah, dan pengeluaran harian",
    icon: GraduationCap,
    color: "bg-gold-600",
  },
  {
    id: "trader",
    title: "Pedagang",
    description: "Catat modal, stok, penjualan, dan keuntungan harian",
    icon: ShoppingCart,
    color: "bg-navy-700",
  },
  {
    id: "umkm",
    title: "UMKM",
    description: "Laporan keuangan lengkap untuk usaha kecil menengah",
    icon: Building2,
    color: "bg-sage-700",
  },
  {
    id: "entrepreneur",
    title: "Pengusaha",
    description: "Analisis omzet, arus kas, dan laporan laba rugi",
    icon: TrendingUp,
    color: "bg-gold-700",
  },
  {
    id: "business",
    title: "Pebisnis",
    description: "Fitur lengkap multi-divisi dengan proyeksi pertumbuhan",
    icon: Briefcase,
    color: "bg-navy-900",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState("personal")
  const [connectionReady, setConnectionReady] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Check connection and session
    const initializeApp = async () => {
      try {
        // Test Supabase connection first
        const connectionTest = await testSupabaseConnection()

        if (!connectionTest.success) {
          setError(`Koneksi database gagal: ${connectionTest.error}`)
          setLoading(false)
          return
        }

        setConnectionReady(true)

        // Check if user is already logged in
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session check error:", sessionError)
          setError(`Error sesi: ${sessionError.message}`)
        } else if (session) {
          router.push("/dashboard")
          return
        }
      } catch (err: any) {
        console.error("App initialization error:", err)
        setError(`Gagal menginisialisasi aplikasi: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Pre-flight checks
    if (!connectionReady) {
      setError("Koneksi database belum siap. Silakan refresh halaman.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    if (!formData.fullName.trim()) {
      setError("Nama lengkap wajib diisi")
      return
    }

    setAuthLoading(true)
    try {
      // Test connection before proceeding
      const connectionTest = await testSupabaseConnection()
      if (!connectionTest.success) {
        throw new Error(`Database tidak dapat diakses: ${connectionTest.error}`)
      }

      console.log("🚀 Starting sign up process...")

      // Step 1: Register user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            user_type: selectedUserType,
          },
        },
      })

      console.log("📝 Sign up response:", { authData, signUpError })

      if (signUpError) {
        console.error("❌ Sign up error:", signUpError)

        if (signUpError.message.includes("User already registered")) {
          setError("Email sudah terdaftar. Silakan gunakan email lain atau login.")
        } else if (signUpError.message.includes("Invalid email")) {
          setError("Format email tidak valid.")
        } else if (signUpError.message.includes("Password")) {
          setError("Password tidak memenuhi kriteria keamanan.")
        } else if (signUpError.message.includes("API key")) {
          setError("Konfigurasi aplikasi bermasalah. Silakan hubungi administrator.")
        } else {
          setError(`Gagal mendaftar: ${signUpError.message}`)
        }
        return
      }

      if (authData.user) {
        console.log("✅ User created:", authData.user.id)

        // Step 2: Wait for trigger to create profile
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Step 3: Update profile with user details
        console.log("📝 Updating user profile...")
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            full_name: formData.fullName.trim(),
            user_type: selectedUserType,
            email: formData.email.trim().toLowerCase(),
          })
          .eq("id", authData.user.id)

        if (updateError) {
          console.warn("⚠️ Profile update failed, trying insert:", updateError)

          // If update fails, try to insert manually
          const { error: insertError } = await supabase.from("user_profiles").insert({
            id: authData.user.id,
            email: formData.email.trim().toLowerCase(),
            full_name: formData.fullName.trim(),
            user_type: selectedUserType,
          })

          if (insertError) {
            console.error("❌ Profile insert failed:", insertError)
            // Continue anyway, user can complete profile later
          } else {
            console.log("✅ Profile created via insert")
          }
        } else {
          console.log("✅ Profile updated successfully")
        }

        setSuccess("🎉 Akun berhasil dibuat! Silakan masuk.")

        // Clear form
        setFormData({
          email: "",
          password: "",
          fullName: "",
          confirmPassword: "",
        })
        setSelectedUserType("personal")

        // Auto switch to login tab
        setTimeout(() => {
          const loginTab = document.querySelector('[value="login"]') as HTMLElement
          loginTab?.click()
        }, 1500)
      }
    } catch (err: any) {
      console.error("❌ Sign up error:", err)

      if (err.message.includes("fetch")) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
      } else if (err.message.includes("API key") || err.message.includes("Invalid API")) {
        setError("Konfigurasi aplikasi bermasalah. Silakan hubungi administrator.")
      } else if (err.message.includes("Database")) {
        setError("Database tidak dapat diakses. Silakan coba lagi nanti.")
      } else {
        setError(err.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.")
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!connectionReady) {
      setError("Koneksi database belum siap. Silakan refresh halaman.")
      return
    }

    setAuthLoading(true)
    try {
      // Test connection before proceeding
      const connectionTest = await testSupabaseConnection()
      if (!connectionTest.success) {
        throw new Error(`Database tidak dapat diakses: ${connectionTest.error}`)
      }

      console.log("🔐 Starting sign in process...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      console.log("📝 Sign in response:", { data, error })

      if (error) {
        console.error("❌ Sign in error:", error)

        if (error.message.includes("Invalid login credentials")) {
          setError("Email atau password salah.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email belum dikonfirmasi. Periksa inbox email Anda.")
        } else if (error.message.includes("API key")) {
          setError("Konfigurasi aplikasi bermasalah. Silakan hubungi administrator.")
        } else {
          setError(`Gagal masuk: ${error.message}`)
        }
        return
      }

      console.log("✅ Sign in successful, redirecting...")

      // Wait a moment for session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/dashboard")
    } catch (err: any) {
      console.error("❌ Sign in error:", err)

      if (err.message.includes("fetch")) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
      } else if (err.message.includes("API key") || err.message.includes("Invalid API")) {
        setError("Konfigurasi aplikasi bermasalah. Silakan hubungi administrator.")
      } else if (err.message.includes("Database")) {
        setError("Database tidak dapat diakses. Silakan coba lagi nanti.")
      } else {
        setError(err.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.")
      }
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-sage-50">
      {/* Header */}
      <header className="bg-navy-gradient backdrop-blur-sm border-b border-navy-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg shadow-md">
                <img src="/logo.png" alt="KeuanganPintar Pro" className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">KeuanganPintar Pro</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-sage-200" />
              <span className="text-xs sm:text-sm text-sage-100">Kelola Keuangan dengan Mudah</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-navy-900 mb-2 sm:mb-4">
            Aplikasi Keuangan Terlengkap untuk Semua Kebutuhan
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-8 max-w-3xl mx-auto px-4">
            Dari keuangan keluarga hingga bisnis besar, kelola semua dengan satu platform yang mudah dan powerful
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Connection Test - Always show if there are connection issues */}
          {(!connectionReady || process.env.NODE_ENV === "development") && (
            <div className="mb-6">
              <ConnectionTest />
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded mb-4 sm:mb-6 text-center mx-4 sm:mx-0">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-sage-50 border border-sage-200 text-sage-700 px-4 py-3 rounded mb-4 sm:mb-6 text-center mx-4 sm:mx-0">
              <span className="text-sm sm:text-base">{success}</span>
            </div>
          )}

          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 bg-gray-100 mx-4 sm:mx-0">
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-sm sm:text-base"
              >
                Daftar Sekarang
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-sm sm:text-base"
              >
                Masuk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-6 sm:space-y-8 mx-4 sm:mx-0">
              {/* User Type Selection */}
              <Card className="border-gray-200 shadow-lg">
                <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
                  <CardTitle className="text-navy-800 text-lg sm:text-xl">Pilih Kategori Keuangan Anda</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Setiap kategori memiliki fitur yang disesuaikan dengan kebutuhan spesifik Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {userTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                            selectedUserType === type.id
                              ? "border-navy-500 shadow-lg bg-navy-50"
                              : "border-gray-200 hover:border-navy-300"
                          }`}
                          onClick={() => setSelectedUserType(type.id)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`${type.color} p-2 rounded-lg shadow-sm flex-shrink-0`}>
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-navy-800 text-sm sm:text-base">{type.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{type.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Registration Form */}
              <Card className="border-gray-200 shadow-lg">
                <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
                  <CardTitle className="text-navy-800 text-lg sm:text-xl">Buat Akun Baru</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Isi data di bawah untuk membuat akun KeuanganPintar Pro
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-navy-700 text-sm sm:text-base">
                          Nama Lengkap *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          disabled={!connectionReady || authLoading}
                          className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-navy-700 text-sm sm:text-base">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="nama@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          disabled={!connectionReady || authLoading}
                          className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-navy-700 text-sm sm:text-base">
                          Password *
                        </Label>
                        <PasswordInput
                          id="password"
                          placeholder="Minimal 6 karakter"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={!connectionReady || authLoading}
                          className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-navy-700 text-sm sm:text-base">
                          Konfirmasi Password *
                        </Label>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="Ulangi password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          disabled={!connectionReady || authLoading}
                          className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Selected User Type Display */}
                    <div className="p-3 sm:p-4 bg-navy-50 border border-navy-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const selectedType = userTypes.find((type) => type.id === selectedUserType)
                          if (!selectedType) return null
                          const Icon = selectedType.icon
                          return (
                            <>
                              <div className={`${selectedType.color} p-2 rounded-lg flex-shrink-0`}>
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-navy-800 text-sm sm:text-base">
                                  Kategori Terpilih: {selectedType.title}
                                </p>
                                <p className="text-xs sm:text-sm text-navy-600 line-clamp-2">
                                  {selectedType.description}
                                </p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-navy-gradient hover:bg-navy-800 text-white shadow-lg text-sm sm:text-base py-2 sm:py-3"
                      disabled={!connectionReady || authLoading}
                    >
                      {authLoading ? "Membuat Akun..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="login" className="mx-4 sm:mx-0">
              <Card className="border-gray-200 shadow-lg">
                <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
                  <CardTitle className="text-navy-800 text-lg sm:text-xl">Masuk ke Akun Anda</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Masukkan email dan password untuk mengakses dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail" className="text-navy-700 text-sm sm:text-base">
                        Email *
                      </Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={!connectionReady || authLoading}
                        className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="text-navy-700 text-sm sm:text-base">
                        Password *
                      </Label>
                      <PasswordInput
                        id="loginPassword"
                        placeholder="Masukkan password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={!connectionReady || authLoading}
                        className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 text-sm sm:text-base"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-navy-gradient hover:bg-navy-800 text-white shadow-lg text-sm sm:text-base py-2 sm:py-3"
                      disabled={!connectionReady || authLoading}
                    >
                      {authLoading ? "Masuk..." : "Masuk"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}
