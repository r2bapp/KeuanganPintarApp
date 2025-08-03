# 💰 KeuanganPintar Pro

**KeuanganPintar Pro** adalah aplikasi dashboard personal finance berbasis web, dibangun dengan Next.js 14 App Router, Supabase sebagai backend, dan UI modern menggunakan ShadCN + TailwindCSS. Aplikasi ini membantu pengguna memantau pemasukan, pengeluaran, tabungan, dan melihat laporan transaksi bulanan secara real-time.

---

## 🚀 Fitur Utama

- 🔐 **Autentikasi Supabase** (Login, Logout, Session)
- 📊 **Statistik Keuangan** (Pemasukan, Pengeluaran, Saldo, Tabungan)
- 💾 **Manajemen Transaksi** (CRUD transaksi)
- ✅ **Deteksi Profil Lengkap**
- 🌐 **Responsive UI** dengan komponen ShadCN
- ☁️ **Siap Deploy ke Vercel**

---

## 🛠️ Teknologi yang Digunakan

- [Next.js 14](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vercel](https://vercel.com/)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

## 🧩 Struktur Folder Utama
app/
├── page.tsx // Halaman dashboard utama
├── dashboard/
│ ├── reports/ // Laporan keuangan
│ ├── transactions/ // Tambah & kelola transaksi
│ └── import/ // Fitur import data
components/
├── ui/ // Komponen UI dari ShadCN
├── profile-completion.tsx // Komponen form profil
├── footer.tsx // Footer aplikasi
lib/
└── supabase.ts // Koneksi Supabase
hooks/
└── use-auth.ts // Hook autentikasi Supabase
public/
└── logo.png // Logo aplikasi

