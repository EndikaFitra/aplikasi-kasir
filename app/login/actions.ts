'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Proses Sign In
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Kembalikan error ke UI tanpa redirect
    return { error: error.message }
  }

  // Jika sukses, redirect ke dashboard/products
  // Penting: redirect harus di luar block try/catch jika ada
  redirect('/pos')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}