'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSummaryStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Ambil Transaksi CASH Hari Ini
  const { data: cashTrans } = await supabase
    .from('transactions')
    .select('total_amount, transaction_items(quantity, price_at_transaction, products(harga_beli))')
    .eq('payment_method', 'CASH')
    .gte('created_at', `${today} 00:00:00`)
    .lte('created_at', `${today} 23:59:59`)

  // 2. Ambil Pembayaran Cicilan (Uang Masuk dari Piutang) Hari Ini
  const { data: payments } = await supabase
    .from('transaction_payments')
    .select('amount, transaction_id') // Kita perlu join ke transaksi untuk cek profit (opsional)
    .gte('created_at', `${today} 00:00:00`)
    .lte('created_at', `${today} 23:59:59`)

  // 3. Ambil Total Sisa Piutang (Global)
  const { data: piutang } = await supabase
    .from('transactions')
    .select('remaining_amount')
    .eq('payment_status', 'BELUM_LUNAS')

  // --- KALKULASI ---

  // A. Total Penjualan Hari Ini (Cash Flow Basis)
  const totalCashToday = cashTrans?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0
  const totalPaymentReceived = payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0
  
  const salesToday = totalCashToday + totalPaymentReceived

  // B. Total Piutang Belum Lunas
  const totalUnpaid = piutang?.reduce((acc, curr) => acc + curr.remaining_amount, 0) || 0

  return {
    salesToday, // Ini mencakup CASH + Cicilan masuk hari ini
    totalUnpaid
  }
}

// Update fungsi getTransactions untuk Laporan Tabel
export async function getTransactions(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      customers (nama),
      transaction_items (
        quantity,
        price_at_transaction, 
        subtotal,
        products (nama, harga_beli)
      )
    `)
    .order('created_at', { ascending: false })

  // --- FILTER MODIFIKASI ---
  // Kita tetap tampilkan semua transaksi di tabel riwayat, 
  // TAPI di tabel nanti kita beri indikator visual mana yang belum lunas.
  // Untuk perhitungan Profit di "Card Filter", kita filter manual di Javascript (Page.tsx)
  
  if (startDate) query = query.gte('created_at', `${startDate} 00:00:00`)
  if (endDate) query = query.lte('created_at', `${endDate} 23:59:59`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}