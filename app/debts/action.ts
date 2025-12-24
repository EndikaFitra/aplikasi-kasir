'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Ambil semua transaksi yang BELUM LUNAS
export async function getUnpaidTransactions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      customers (nama, no_hp)
    `)
    .eq('payment_method', 'PIUTANG')
    .eq('payment_status', 'BELUM_LUNAS')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Proses Pembayaran Cicilan
export async function payDebt(transactionId: string, amountPay: number) {
  const supabase = await createClient()

  // 1. Ambil data transaksi saat ini untuk cek sisa
  const { data: trans, error: fetchError } = await supabase
    .from('transactions')
    .select('remaining_amount, total_amount')
    .eq('id', transactionId)
    .single()

  if (fetchError || !trans) return { success: false, error: 'Transaksi tidak ditemukan' }

  if (amountPay > trans.remaining_amount) {
    return { success: false, error: 'Jumlah bayar melebihi sisa hutang!' }
  }

  // 2. Insert ke history pembayaran
  const { error: payError } = await supabase
    .from('transaction_payments')
    .insert({
      transaction_id: transactionId,
      amount: amountPay
    })

  if (payError) return { success: false, error: payError.message }

  // 3. Update Transaksi Utama (Sisa & Status)
  const newRemaining = trans.remaining_amount - amountPay
  const newStatus = newRemaining <= 0 ? 'LUNAS' : 'BELUM_LUNAS'

  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      remaining_amount: newRemaining,
      payment_status: newStatus
    })
    .eq('id', transactionId)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath('/debts')
  revalidatePath('/reports') // Update laporan juga
  
  return { success: true, message: 'Pembayaran berhasil dicatat!' }
}