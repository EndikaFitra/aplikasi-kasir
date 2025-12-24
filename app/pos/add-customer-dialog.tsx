'use client'

import { useState } from 'react'
import { createCustomer } from './actions' // Import action baru
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Pastikan sudah add textarea, atau ganti Input biasa
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function AddCustomerDialog({ onSuccess }: { onSuccess?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const result = await createCustomer(null, formData)
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      setOpen(false)
      // Callback opsional: Jika sukses, otomatis pilih user ini di dropdown parent
      if (onSuccess && result.newCustomer) {
        onSuccess(result.newCustomer.id.toString())
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Tambah Pelanggan Baru">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="nama" name="nama" required placeholder="Contoh: Budi Santoso" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="no_hp">No. HP / WhatsApp</Label>
            <Input id="no_hp" name="no_hp" type="tel" placeholder="08..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" name="alamat" placeholder="Alamat domisili..." />
          </div>

          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}