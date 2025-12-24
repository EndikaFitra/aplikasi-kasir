'use client'

import { useState, useEffect } from 'react'
import { getUnpaidTransactions, payDebt } from '@/app/debts/action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge' // Perlu npx shadcn@latest add badge
import { toast } from 'sonner'
import { Wallet, Search } from 'lucide-react'

export default function DebtPage() {
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State Modal Bayar
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [selectedTrans, setSelectedTrans] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const data = await getUnpaidTransactions()
      setDebts(data || [])
    } catch (e) {
      toast.error("Gagal memuat data piutang")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPay = (trans: any) => {
    setSelectedTrans(trans)
    setPayAmount('') // Reset input
    setIsPayOpen(true)
  }

  const handleProcessPay = async () => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error("Masukkan jumlah valid")
    
    setIsProcessing(true)
    const res = await payDebt(selectedTrans.id, Number(payAmount))
    setIsProcessing(false)

    if (res.success) {
      toast.success(res.message)
      setIsPayOpen(false)
      loadDebts() // Refresh list
    } else {
      toast.error(res.error)
    }
  }

  // Filter Client Side
  const filteredDebts = debts.filter(d => 
    d.customers?.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-red-600" /> Daftar Piutang
        </h1>
        <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Cari nama customer..." 
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Hutang</TableHead>
                <TableHead>Sisa Tagihan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Memuat...</TableCell></TableRow>
              ) : filteredDebts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada piutang belum lunas.</TableCell></TableRow>
              ) : filteredDebts.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{t.customers?.nama}</TableCell>
                  <TableCell>Rp {t.total_amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell className="font-bold text-red-600">Rp {t.remaining_amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                        Belum Lunas
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleOpenPay(t)}>
                        Bayar / Cicil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL BAYAR */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pembayaran Piutang</DialogTitle>
            </DialogHeader>
            
            {selectedTrans && (
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Customer:</span>
                            <span className="font-bold">{selectedTrans.customers?.nama}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Total Awal:</span>
                            <span>Rp {selectedTrans.total_amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span>Sisa Hutang:</span>
                            <span className="text-red-600">Rp {selectedTrans.remaining_amount.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Jumlah Bayar</label>
                        <Input 
                            type="number" 
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="0"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => setPayAmount(selectedTrans.remaining_amount.toString())}>
                                Lunasi Semua
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPayOpen(false)}>Batal</Button>
                <Button onClick={handleProcessPay} disabled={isProcessing}>
                    {isProcessing ? 'Memproses...' : 'Simpan Pembayaran'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}