import { createClient } from '@/utils/supabase/server'
import ProductManager from './product-manager'
import { logout } from '@/app/login/actions'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Manajemen Produk - POS App',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  
  // Fetch data produk, urutkan dari yang terbaru
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return <div className="p-10 text-red-500">Gagal memuat data produk. Cek koneksi Supabase Anda.</div>
  }

  return (
    <main className="container mx-auto py-10 px-4">
      {/* Kirim data awal ke Client Component */}
      <ProductManager products={products || []} />
    </main>
  )
}

// Di dalam komponen JSX Anda:
<form action={logout}>
  <Button variant="ghost" size="sm">
    <LogOut className="mr-2 h-4 w-4" /> Keluar
  </Button>
</form>