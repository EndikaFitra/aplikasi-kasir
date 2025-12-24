'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileSpreadsheet, Filter, Banknote, TrendingUp, Calendar } from 'lucide-react' // Tambah Icon
import { toast } from 'sonner'
import Link from 'next/link'

interface ReportClientProps {
  transactions: any[]
  summary: {
    salesToday: number
    totalUnpaid: number
  }
  // Props baru untuk stats hasil filter
  filteredStats: {
    omset: number
    profit: number
  }
  initialStartDate?: string
  initialEndDate?: string
}

export default function ReportClient({ 
    transactions, 
    summary, 
    filteredStats, 
    initialStartDate, 
    initialEndDate 
}: ReportClientProps) {
    
  const router = useRouter()
  const [startDate, setStartDate] = useState(initialStartDate || '')
  const [endDate, setEndDate] = useState(initialEndDate || '')
  const [isExporting, setIsExporting] = useState(false)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    router.push(`/reports?${params.toString()}`)
  }

  const handleExportExcel = () => {
    try {
      setIsExporting(true)
      if (transactions.length === 0) {
        toast.error("Tidak ada data")
        return
      }

      // Format Data Excel (Menambahkan kolom Profit per Transaksi opsional)
      const dataToExport = transactions.map((t) => {
        // Hitung profit per row transaksi untuk excel
        const profitTransaksi = t.transaction_items.reduce((acc: number, item: any) => {
            const beli = item.products?.harga_beli || 0
            return acc + ((item.price_at_transaction - beli) * item.quantity)
        }, 0)

        return {
            ID: t.id.substring(0, 8),
            Tanggal: new Date(t.created_at).toLocaleString('id-ID'),
            Customer: t.customers?.nama || 'Umum',
            Metode: t.payment_method,
            Items: t.transaction_items.map((i:any) => i.products?.nama).join(', '),
            Total_Omset: t.total_amount,
            Estimasi_Profit: profitTransaksi 
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan")
      XLSX.writeFile(workbook, `Laporan_Profit_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success("Excel berhasil didownload")
    } catch (error) {
      toast.error("Gagal export")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: DASHBOARD UTAMA (Global / Hari Ini) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Penjualan Hari Ini */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Penjualan Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">Rp {summary.salesToday.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>

        {/* Card 2: Piutang Belum Lunas */}
        <Link href="/debts" className="block transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <Card className="bg-red-50 border-red-100 hover:bg-red-100 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-red-900">Piutang Belum Lunas</CardTitle>
                <Banknote className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">Rp {summary.totalUnpaid.toLocaleString('id-ID')}</div>
                <p className="text-xs text-red-400 mt-1 underline">Klik untuk detail & bayar</p>
            </CardContent>
            </Card>
        </Link>

        {/* Card 3: Total Omset (Sesuai Filter) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Omset (Filter)</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {filteredStats.omset.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Berdasarkan tanggal dipilih</p>
          </CardContent>
        </Card>

        {/* Card 4: TOTAL KEUNTUNGAN (Highlight) */}
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Keuntungan (Filter)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">Rp {filteredStats.profit.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-600">
                Margin: {filteredStats.omset > 0 ? ((filteredStats.profit / filteredStats.omset) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & DATA TABLE (Sama seperti sebelumnya) */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-t pt-6">
        <div className="flex items-end gap-2 w-full md:w-auto">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Dari Tanggal</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Sampai Tanggal</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleFilter} variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
        
        <Button onClick={handleExportExcel} className="w-full md:w-auto bg-green-600 hover:bg-green-700">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {/* Optional: Tampilkan profit per baris jika mau */}
              {/* <TableHead className="text-right text-green-600">Profit</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                    {new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </TableCell>
                <TableCell>{t.customers ? t.customers.nama : 'Umum'}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                    {t.transaction_items.map((i:any) => `${i.products?.nama} (${i.quantity})`).join(', ')}
                </TableCell>
                <TableCell>{t.payment_method}</TableCell>
                <TableCell>{t.payment_status}</TableCell>
                <TableCell className="text-right font-bold">
                    Rp {t.total_amount.toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Tidak ada data.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}