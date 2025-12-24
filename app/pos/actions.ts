'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CustomerSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  no_hp: z.string().optional(),
  alamat: z.string().optional(),
})

export async function processTransaction(data: {
  cart: any[],
  total: number,
  paymentMethod: 'CASH' | 'PIUTANG',
  customerId: number | null
}) {
  const supabase = await createClient()

  // 1. Validasi Stok di Server (Optional tapi recommended)
  // (Untuk simplifikasi, kita asumsikan stok client valid, tapi di production harus cek lagi)

  // 2. Insert ke Tabel Transactions
  const { data: transaction, error: transError } = await supabase
    .from('transactions')
    .insert({
      customer_id: data.customerId, // Bisa NULL jika CASH
      total_amount: data.total,
      payment_method: data.paymentMethod,
      status: 'COMPLETED'
    })
    .select() // Penting untuk dapat ID transaksi baru
    .single()

  if (transError || !transaction) {
    return { success: false, error: transError?.message || "Gagal membuat transaksi" }
  }

  // 3. Insert ke Tabel Transaction Items
  const itemsData = data.cart.map(item => ({
    transaction_id: transaction.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_transaction: item.harga_jual
  }))

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(itemsData)

  if (itemsError) {
    // Idealnya di sini ada logic rollback jika item gagal insert
    return { success: false, error: itemsError.message }
  }

  revalidatePath('/products') // Update stok di halaman produk
  return { success: true, message: 'Transaksi Berhasil!' }
}

// 2. Function Baru: Tambah Customer
export async function createCustomer(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    nama: formData.get('nama'),
    no_hp: formData.get('no_hp'),
    alamat: formData.get('alamat'),
  }

  const validated = CustomerSchema.safeParse(rawData)

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(validated.data)
      .select()
      .single()

    if (error) throw error

    // Refresh halaman POS agar dropdown customer mendapatkan data terbaru
    revalidatePath('/pos')
    
    return { success: true, message: 'Pelanggan berhasil ditambahkan!', newCustomer: data }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}