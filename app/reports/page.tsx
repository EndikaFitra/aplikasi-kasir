import { getSummaryStats, getTransactions } from './actions'
import ReportClient from './report-client'

export const metadata = {
  title: 'Laporan Keuangan & Profit',
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ReportsPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined

  // Ambil data transaksi sesuai filter
  const transactionsData = await getTransactions(startDate, endDate)
  const summaryStats = await getSummaryStats() // Stats hari ini (Sales & Piutang)

  // --- LOGIC BARU: Hitung Total Profit dari data yang difilter ---
  let totalProfitFiltered = 0
  let totalOmsetFiltered = 0

  if (transactionsData) {
    transactionsData.forEach((t) => {
      
      if (t.payment_method === 'PIUTANG' && t.payment_status === 'BELUM_LUNAS') {
        return; 
      }
      
      // Jika LUNAS atau CASH, baru dihitung
      totalOmsetFiltered += t.total_amount
      
      t.transaction_items.forEach((item: any) => {
        const hargaJual = item.price_at_transaction
        const hargaBeli = item.products?.harga_beli || 0 
        const profitItem = (hargaJual - hargaBeli) * item.quantity
        totalProfitFiltered += profitItem
      })
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Laporan Keuangan</h1>
      
      <ReportClient 
        transactions={transactionsData || []} 
        summary={summaryStats}
        // Kirim data profit yang baru dihitung
        filteredStats={{
            omset: totalOmsetFiltered,
            profit: totalProfitFiltered
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  )
}