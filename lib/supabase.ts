import { createClient } from "@supabase/supabase-js"

// Fixed environment variables with correct API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://leimiqflgcilayxcepsb.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaW1pcWZsZ2NpbGF5eGNlcHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDYxMDAsImV4cCI6MjA2MzM4MjEwMH0.DNLoy6CpHhP_r9BICCSPolsaDNPR3XNijqMrPe2SMdE"

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.includes("supabase.co")
  } catch {
    return false
  }
}

// Validate JWT format
const isValidJWT = (token: string) => {
  try {
    const parts = token.split(".")
    return parts.length === 3 && parts.every((part) => part.length > 0)
  } catch {
    return false
  }
}

// Enhanced validation
if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  console.error("❌ Invalid Supabase URL:", supabaseUrl)
  throw new Error("Invalid Supabase URL configuration")
}

if (!supabaseAnonKey || !isValidJWT(supabaseAnonKey)) {
  console.error("❌ Invalid Supabase API Key format")
  throw new Error("Invalid Supabase API Key configuration")
}

console.log("✅ Supabase URL:", supabaseUrl)
console.log("✅ API Key format valid:", isValidJWT(supabaseAnonKey))

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "keuangan-pintar-pro@1.0.0",
    },
  },
  db: {
    schema: "public",
  },
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)
    if (error) {
      console.error("❌ Supabase connection test failed:", error.message)
      return { success: false, error: error.message }
    }
    console.log("✅ Supabase connection test passed")
    return { success: true, data }
  } catch (err: any) {
    console.error("❌ Supabase connection error:", err.message)
    return { success: false, error: err.message }
  }
}

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: "family" | "personal" | "student" | "trader" | "umkm" | "entrepreneur" | "business"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: "family" | "personal" | "student" | "trader" | "umkm" | "entrepreneur" | "business"
        }
        Update: {
          full_name?: string | null
          user_type?: "family" | "personal" | "student" | "trader" | "umkm" | "entrepreneur" | "business"
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category: string
          subcategory: string | null
          type: "income" | "expense" | "savings" | "debt"
          amount: number
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          user_id: string
          category: string
          subcategory?: string | null
          type: "income" | "expense" | "savings" | "debt"
          amount: number
          description?: string | null
          date?: string
        }
        Update: {
          category?: string
          subcategory?: string | null
          type?: "income" | "expense" | "savings" | "debt"
          amount?: number
          description?: string | null
          date?: string
        }
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_amount: number
          current_amount: number
          target_date: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          goal_type: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
        }
        Update: {
          goal_type?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          monthly_limit: number
          current_spent: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          user_id: string
          category: string
          monthly_limit: number
          current_spent?: number
          month: number
          year: number
        }
        Update: {
          category?: string
          monthly_limit?: number
          current_spent?: number
        }
      }
    }
  }
}
