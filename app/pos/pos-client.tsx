'use client'

import { useState, useEffect } from 'react'
import { useCartStore, Product } from '@/store/useCartStore'
import { processTransaction } from './actions'
import AddCustomerDialog from './add-customer-dialog'
import { toast } from "sonner"

// Icons
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, Banknote, User, PackageOpen 
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"

interface POSClientProps {
  products: Product[]
  customers: any[]
}

export default function POSClient({ products, customers }: POSClientProps) {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State Pembayaran
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PIUTANG'>('CASH')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [cashReceived, setCashReceived] = useState<string>('') // String agar input bisa kosong

  // --- ZUSTAND STORE ---
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    decreaseQuantity, 
    clearCart, 
    totalAmount 
  } = useCartStore()

  // --- CALCULATIONS ---
  const total = totalAmount()
  
  // Hitung Kembalian (Cash)
  const cashValue = parseFloat(cashReceived) || 0
  const change = cashValue - total
  const isCashInsufficient = paymentMethod === 'CASH' && (cashValue < total)

  // Filter Produk
  const filteredProducts = products.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  )

  // --- EFFECTS ---
  // Reset input uang saat modal dibuka/tutup
  useEffect(() => {
    if (isCheckoutOpen) {
        setCashReceived('') 
    }
  }, [isCheckoutOpen])

  // --- HANDLERS ---

  const handleCheckout = async () => {
    // 1. Validasi Keranjang
    if (cart.length === 0) return toast.error("Keranjang kosong!")
    
    // 2. Validasi Piutang
    if (paymentMethod === 'PIUTANG' && !selectedCustomer) {
      return toast.error("Wajib pilih customer untuk transaksi Piutang!")
    }

    // 3. Validasi Cash
    if (paymentMethod === 'CASH' && isCashInsufficient) {
        return toast.error("Uang tunai kurang!")
    }

    setIsProcessing(true)
    
    // 4. Proses Transaksi ke Server
    const result = await processTransaction({
        cart,
        total: total,
        paymentMethod,
        customerId: selectedCustomer ? parseInt(selectedCustomer) : null
    })

    setIsProcessing(false)

    if (result.success) {
        // Tampilkan Sukses + Info Kembalian
        const message = paymentMethod === 'CASH' 
            ? `Transaksi Berhasil! Kembalian: Rp ${change.toLocaleString('id-ID')}`
            : result.message
        
        toast.success(message, { duration: 5000 }) // Durasi agak lama biar kasir sempat baca

        // Reset State
        clearCart()
        setIsCheckoutOpen(false)
        setPaymentMethod('CASH')
        setSelectedCustomer('')
        setCashReceived('')
    } else {
        toast.error(result.error)
    }
  }

  const setQuickCash = (amount: number) => {
    setCashReceived(amount.toString())
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] gap-4 p-4 bg-gray-50 overflow-hidden">
      
      {/* ================= KIRI: DAFTAR PRODUK ================= */}
      <div className="w-full md:w-2/3 flex flex-col gap-4 h-full">
        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama produk atau scan barcode..." 
            className="pl-9 bg-white shadow-sm h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {/* Grid Produk (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
                <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-95 flex flex-col justify-between"
                onClick={() => addToCart(product)}
                >
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{product.nama}</h3>
                        <p className="text-xs text-gray-400">{product.barcode || 'No Barcode'}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-end">
                    <span className="font-bold text-primary text-sm sm:text-base">
                        Rp {product.harga_jual.toLocaleString('id-ID')}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${product.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Stok: {product.stok}
                    </span>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-10">
                    <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
                    <p>Produk tidak ditemukan.</p>
                </div>
            )}
        </div>
      </div>

      {/* ================= KANAN: KERANJANG (CART) ================= */}
      <div className="w-full md:w-1/3 bg-white rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
        {/* Header Cart */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5" /> Keranjang
            </h2>
            <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" /> Reset
            </Button>
        </div>

        {/* List Item (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <ShoppingCart className="w-16 h-16 mb-2 opacity-20" />
                    <p className="text-sm">Belum ada item.</p>
                </div>
            ) : (
                cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex-1 pr-2">
                            <p className="font-medium text-sm line-clamp-1">{item.nama}</p>
                            <p className="text-xs text-gray-500">
                                Rp {item.harga_jual.toLocaleString('id-ID')} x {item.quantity}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md bg-white shadow-sm" onClick={() => decreaseQuantity(item.id)}>
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md bg-white shadow-sm" onClick={() => addToCart(item)}>
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 ml-1" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))
            )}
        </div>

        {/* Footer Cart (Total & Action) */}
        <div className="p-4 border-t bg-gray-50 shrink-0 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Tagihan:</span>
                <span className="text-2xl font-extrabold text-primary">
                    Rp {totalAmount().toLocaleString('id-ID')}
                </span>
            </div>
            
            <Button 
                size="lg" 
                className="w-full text-lg h-12 font-bold shadow-lg"
                disabled={cart.length === 0} 
                onClick={() => setIsCheckoutOpen(true)}
            >
                <CreditCard className="mr-2 h-5 w-5" /> Bayar Sekarang
            </Button>
        </div>
      </div>

      {/* ================= MODAL CHECKOUT ================= */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="text-center text-xl">Konfirmasi Pembayaran</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-2">
                
                {/* 1. Pilih Metode Bayar */}
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant={paymentMethod === 'CASH' ? 'default' : 'outline'} 
                        className={`h-14 text-base border-2 ${paymentMethod === 'CASH' ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('CASH')}
                    >
                        <Banknote className="mr-2 h-5 w-5" /> Tunai
                    </Button>
                    <Button 
                        variant={paymentMethod === 'PIUTANG' ? 'default' : 'outline'} 
                        className={`h-14 text-base border-2 ${paymentMethod === 'PIUTANG' ? 'border-primary' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('PIUTANG')}
                    >
                        <User className="mr-2 h-5 w-5" /> Piutang
                    </Button>
                </div>

                {/* 2. Logic Tampilan Berdasarkan Metode */}
                
                {/* --- JIKA CASH --- */}
                {paymentMethod === 'CASH' && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-dashed">
                        <div className="space-y-2">
                            <Label className="text-gray-600">Uang Diterima (Rp)</Label>
                            <Input 
                                type="number" 
                                className="text-right text-2xl font-bold h-14 bg-white"
                                placeholder="0"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Quick Cash Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setQuickCash(total)} className="text-xs">Uang Pas</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickCash(20000)} className="text-xs">20.000</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickCash(50000)} className="text-xs">50.000</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickCash(100000)} className="text-xs">100.000</Button>
                        </div>

                        {/* Display Kembalian */}
                        <div className={`flex justify-between items-center p-3 rounded-lg border-l-4 shadow-sm bg-white ${change >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <span className="text-sm font-semibold text-gray-600">Kembalian:</span>
                            <span className={`text-xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {change >= 0 ? `Rp ${change.toLocaleString('id-ID')}` : 'Kurang'}
                            </span>
                        </div>
                    </div>
                )}

                {/* --- JIKA PIUTANG --- */}
                {paymentMethod === 'PIUTANG' && (
                    <div className="space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Label className="text-blue-900">Pilih Pelanggan <span className="text-red-500">*</span></Label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                    <SelectTrigger className="bg-white h-10">
                                        <SelectValue placeholder="Cari nama pelanggan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.nama} {c.no_hp && `(${c.no_hp})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* INTEGRASI ADD CUSTOMER DI SINI */}
                            <AddCustomerDialog onSuccess={(newId) => setSelectedCustomer(newId)} />
                        </div>
                        <p className="text-xs text-blue-600 italic">
                            *Pelanggan wajib dipilih untuk pencatatan hutang.
                        </p>
                    </div>
                )}

                {/* Total Summary */}
                <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-lg font-medium text-gray-600">Total Tagihan</span>
                    <span className="text-3xl font-extrabold text-primary">Rp {total.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)} className="h-12">Batal</Button>
                
                <Button 
                    onClick={handleCheckout} 
                    disabled={isProcessing || (paymentMethod === 'CASH' && isCashInsufficient)}
                    className={`h-12 w-full sm:w-auto font-bold text-lg ${isCashInsufficient && paymentMethod === 'CASH' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isProcessing ? 'Memproses...' : 'BAYAR'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}