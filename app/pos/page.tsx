import { createClient } from '@/utils/supabase/server'
import POSClient from './pos-client'

export const metadata = {
  title: 'Point of Sale - Kasir',
}

// Pastikan data selalu fresh
export const dynamic = 'force-dynamic' 

export default async function POSPage() {
  const supabase = await createClient()

  // 1. Ambil Data Produk
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .gt('stok', 0) // Hanya tampilkan produk yang ada stoknya
    .order('nama', { ascending: true })

  // 2. Ambil Data Customer (Untuk dropdown piutang)
  const { data: customers } = await supabase
    .from('customers')
    .select('id, nama, no_hp')
    .order('nama', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Render Client Component */}
      <POSClient 
        products={products || []} 
        customers={customers || []} 
      />
    </div>
  )
}