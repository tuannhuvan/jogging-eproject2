"use client"

import { AuthProvider } from "../lib/auth-context"
import { CartProvider } from "../lib/cart-context"
import { Header } from "./header"
import { Footer } from "./footer"
import { Toaster } from "sonner"

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main className="min-h-screen page-transition">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </AuthProvider>
  )
}
