import Link from "next/link";
import { Store, ArrowRight, LayoutDashboard, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button"; // Menggunakan komponen button Shadcn

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      
      {/* --- HEADER / NAVBAR --- */}
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Store className="h-6 w-6" />
          <span>POS System</span>
        </div>
        <nav>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <LockKeyhole className="h-4 w-4" />
              Login Staff
            </Button>
          </Link>
        </nav>
      </header>

      {/* --- MAIN CONTENT (HERO SECTION) --- */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-3xl space-y-8">
          
          {/* Icon Besar */}
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-in fade-in zoom-in duration-500">
              <Store className="h-12 w-12" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
              Sistem Kasir <span className="text-primary">Pintar</span> & Efisien
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
              Kelola penjualan, stok produk, piutang pelanggan, dan laporan keuangan dalam satu aplikasi yang mudah digunakan.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/pos">
              <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-lg hover:shadow-xl transition-all">
                <LayoutDashboard className="h-5 w-5" />
                Masuk ke Kasir (POS)
              </Button>
            </Link>
            
            <Link href="/reports">
               <Button size="lg" variant="secondary" className="h-12 px-8 text-lg gap-2">
                Lihat Laporan Keuangan <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Features Grid (Kecil di bawah) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-1">⚡ Transaksi Cepat</h3>
                <p className="text-sm text-gray-500">Checkout super cepat dengan kalkulator kembalian otomatis.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-1">📦 Manajemen Stok</h3>
                <p className="text-sm text-gray-500">Stok berkurang otomatis saat terjadi penjualan.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-1">📒 Catat Piutang</h3>
                <p className="text-sm text-gray-500">Kelola bon pelanggan dan pembayaran cicilan dengan rapi.</p>
            </div>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-6 text-center text-sm text-gray-400 bg-white border-t">
        <p>&copy; {new Date().getFullYear()} Aplikasi Kasir Toko. All rights reserved.</p>
      </footer>
    </div>
  );
}