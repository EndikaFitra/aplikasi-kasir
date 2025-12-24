import EscPosEncoder from 'esc-pos-encoder'

// Helper untuk format Rupiah
const formatRupiah = (num: number) => num.toLocaleString('id-ID')

export const generateReceiptCommands = (transaction: any) => {
  const encoder = new EscPosEncoder()

  // 1. Header
  let receipt = encoder
    .initialize()
    .align('center')
    .bold(true)
    .line('TOKO SERBA ADA')
    .bold(false)
    .line('Jl. Sudirman No. 10, Jakarta')
    .line('--------------------------------') // Garis pemisah 32 karakter (standar 58mm)
    
  // 2. Detail Transaksi
  receipt
    .align('left')
    .text(`No: ${transaction.id.slice(0, 8)}\n`) // Ambil 8 digit UUID
    .text(`Tgl: ${new Date().toLocaleString('id-ID')}\n`)
    .text(`Kasir: Admin\n`)
    .line('--------------------------------')

  // 3. List Item
  // Format: Nama Barang (kiri) ..... Harga (kanan)
  // Printer 58mm biasanya muat 32 karakter per baris
  
  transaction.items.forEach((item: any) => {
    const name = item.nama.substring(0, 20) // Potong nama jika kepanjangan
    const totalItemPrice = item.price * item.quantity
    
    // Baris 1: Nama Barang
    receipt.text(name + '\n')
    
    // Baris 2: Qty x Harga ....... Subtotal
    // Contoh: 2 x 5.000 ....... 10.000
    const leftText = `${item.quantity} x ${formatRupiah(item.price)}`
    const rightText = formatRupiah(totalItemPrice)
    
    // Hitung spasi tengah agar rata kanan
    const spaceCount = 32 - leftText.length - rightText.length
    const spaces = ' '.repeat(Math.max(0, spaceCount))
    
    receipt.text(leftText + spaces + rightText + '\n')
  })

  // 4. Total & Footer
  const totalStr = formatRupiah(transaction.total)
  const labelTotal = 'TOTAL'
  const spaceTotal = 32 - labelTotal.length - totalStr.length

  receipt
    .line('--------------------------------')
    .bold(true)
    .text(labelTotal + ' '.repeat(Math.max(0, spaceTotal)) + totalStr + '\n')
    .bold(false)
    .line('--------------------------------')
    .align('center')
    .line(`Metode: ${transaction.paymentMethod}`)
    .newline()
    .line('Terima Kasih atas Kunjungan Anda')
    .line('Barang yang dibeli tidak dapat')
    .line('dikembalikan')
    .newline()
    .newline()
    .newline() // Feed paper agak banyak biar mudah disobek
    
  return receipt.encode()
}