import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import MainNav from "@/components/main-nav"
import { createClient } from '@/utils/supabase/server' // Import createClient server

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS Kasir App",
  description: "Aplikasi Kasir Next.js + Supabase",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 1. Ambil User di sisi Server
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Kirim data user ke MainNav */}
        <MainNav user={user} /> 
        
        <main>
            {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}