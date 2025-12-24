'use client'

import { useFormStatus } from 'react-dom'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { LockKeyhole } from 'lucide-react'

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sedang Masuk...' : 'Masuk Sistem'}
    </Button>
  )
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                    <LockKeyhole className="w-6 h-6 text-primary" />
                </div>
            </div>
          <CardTitle className="text-2xl">Aplikasi Kasir</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk akses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            action={async (formData) => {
                const res = await login(null, formData);
                // Jika ada error, tampilkan toast
                if (res?.error) {
                    toast.error("Gagal Login: " + res.error);
                }
            }} 
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="kasir@toko.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <LoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}