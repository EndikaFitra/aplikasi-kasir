'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  // Hapus import SheetDescription jika tidak dipakai lagi di tempat lain
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
    Menu, ShoppingCart, Package, FileBarChart, 
    Wallet, LogOut, UserCircle 
} from 'lucide-react'
import { useState } from 'react'
import { type User } from '@supabase/supabase-js'

export default function MainNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/login' || pathname === '/') return null

  const menuItems = [
    { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { href: '/products', label: 'Produk', icon: Package },
    { href: '/reports', label: 'Laporan', icon: FileBarChart },
    { href: '/debts', label: 'Piutang', icon: Wallet },
  ]

  const userEmail = user?.email || 'Staff Kasir'

  return (
    <div className="border-b bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="text-left mb-6 border-b pb-4">
              <SheetTitle>Menu Aplikasi</SheetTitle>
              
              {/* --- PERBAIKAN DI SINI --- */}
              {/* Ganti <SheetDescription> dengan <div> biasa */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <UserCircle className="h-8 w-8 text-primary" />
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Halo, Admin</span>
                    <span className="text-xs text-gray-500">{userEmail}</span>
                </div>
              </div>
              {/* ------------------------- */}

            </SheetHeader>

            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button 
                      variant={isActive ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-3 ${isActive ? 'bg-primary/10 text-primary font-bold' : ''}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              
              <div className="h-px bg-gray-200 my-2" />
              
              <form action={logout}>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                    Keluar
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="font-bold text-lg hidden sm:block text-primary">Aplikasi Kasir</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500 mr-2">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-700">Login sebagai:</span>
            <span className="text-xs text-gray-500">{userEmail}</span>
        </div>
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <UserCircle className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}