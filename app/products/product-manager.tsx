'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom' // Hook untuk loading state tombol
import { saveProduct, deleteProduct } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Plus, Package } from 'lucide-react'
import { toast } from "sonner" // Import Sonner

// Komponen Tombol Submit (Wajib dipisah agar useFormStatus bekerja)
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Menyimpan...' : 'Simpan Produk'}
    </Button>
  )
}

export default function ProductManager({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // Fungsi Buka Modal Edit
  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setIsOpen(true)
  }

  // Fungsi Buka Modal Baru
  const handleAddNew = () => {
    setEditingProduct(null)
    setIsOpen(true)
  }

  // Fungsi Hapus dengan Konfirmasi
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return
    
    // Optimistic UI update bisa ditambahkan di sini, tapi kita pakai simple await dulu
    const promise = deleteProduct(id)
    
    toast.promise(promise, {
      loading: 'Menghapus...',
      success: 'Produk berhasil dihapus',
      error: 'Gagal menghapus produk'
    })
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Package className="h-8 w-8" /> Manajemen Produk
        </h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk Baru
        </Button>
      </div>

      {/* TABEL DATA */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="hidden md:table-cell">Barcode</TableHead>
              <TableHead>Harga Beli</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                   Belum ada produk. Silakan tambah data.
                 </TableCell>
               </TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.barcode || '-'}</TableCell>
                <TableCell>Rp {p.harga_beli.toLocaleString('id-ID')}</TableCell>
                <TableCell>Rp {p.harga_jual.toLocaleString('id-ID')}</TableCell>
                <TableCell>Rp {(p.harga_jual - p.harga_beli).toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stok < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stok}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL FORM (ADD / EDIT) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          </DialogHeader>
          
          <form 
            action={async (formData) => {
              const result = await saveProduct(null, formData)
              if (result?.success) {
                toast.success(result.message)
                setIsOpen(false)
              } else {
                toast.error(result?.error || "Terjadi kesalahan")
              }
            }} 
            className="grid gap-4 py-4"
          >
            {/* Hidden Input untuk ID jika Edit */}
            {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}

            <div className="grid gap-2">
              <Label htmlFor="nama">Nama Produk</Label>
              <Input id="nama" name="nama" defaultValue={editingProduct?.nama} required placeholder="Contoh: Indomie Goreng" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode (Scan/Ketik)</Label>
              <Input id="barcode" name="barcode" defaultValue={editingProduct?.barcode} placeholder="899..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="harga_beli">Harga Beli</Label>
                <Input id="harga_beli" name="harga_beli" type="number" defaultValue={editingProduct?.harga_beli} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="harga_jual">Harga Jual</Label>
                <Input id="harga_jual" name="harga_jual" type="number" defaultValue={editingProduct?.harga_jual} required placeholder="0" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stok">Stok Awal</Label>
              <Input id="stok" name="stok" type="number" defaultValue={editingProduct?.stok || 0} required />
            </div>

            <div className="flex justify-end pt-4">
              <SubmitButton />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}