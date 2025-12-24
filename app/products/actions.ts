'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// 1. Definisikan Schema Validasi
const ProductSchema = z.object({
  nama: z.string().min(1, "Nama produk wajib diisi"),
  barcode: z.string().optional(),
  // coerce mengubah string input form menjadi number
  harga_beli: z.coerce.number().min(0, "Harga beli tidak boleh minus"), 
  harga_jual: z.coerce.number().min(0, "Harga jual tidak boleh minus"),
  stok: z.coerce.number().int().min(0, "Stok tidak boleh minus"),
})

export async function saveProduct(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 2. Ambil data dari FormData
  const rawData = {
    nama: formData.get('nama'),
    barcode: formData.get('barcode'),
    harga_beli: formData.get('harga_beli'),
    harga_jual: formData.get('harga_jual'),
    stok: formData.get('stok'),
  }

  // 3. Validasi dengan Zod
  const validated = ProductSchema.safeParse(rawData)

  if (!validated.success) {
    // Kembalikan error per field jika validasi gagal
    return { 
      error: validated.error.issues[0].message, // Ambil pesan error pertama saja untuk toast
      success: false 
    }
  }

  const productId = formData.get('id') // Cek apakah ini mode Edit

  try {
    if (productId) {
      // --- UPDATE ---
      const { error } = await supabase
        .from('products')
        .update(validated.data)
        .eq('id', productId)
      if (error) throw error
    } else {
      // --- INSERT ---
      const { error } = await supabase
        .from('products')
        .insert(validated.data)
      if (error) throw error
    }

    // Refresh halaman agar data tabel terupdate otomatis
    revalidatePath('/products')
    return { success: true, message: 'Data produk berhasil disimpan' }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}