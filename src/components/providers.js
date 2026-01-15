"use client"

/**
 * PROVIDERS COMPONENT - Thành phần bao bọc ứng dụng
 * 
 * Cung cấp các Context Provider cần thiết cho toàn bộ ứng dụng
 * Bao gồm: xác thực người dùng, giỏ hàng và thông báo hệ thống
 */

import { AuthProvider } from "../lib/auth-context"
import { CartProvider } from "../lib/cart-context"
import { Header } from "./header"
import { Footer } from "./footer"
import { Toaster } from "sonner"

/**
 * Component Providers
 * Bao bọc children với các context sau:
 * - AuthProvider: Quản lý trạng thái xác thực người dùng
 * - CartProvider: Quản lý giỏ hàng mua sắm
 * - Header: Thanh điều hướng chính
 * - Footer: Chân trang
 * - Toaster: Hiển thị thông báo toast (từ thư viện Sonner)
 * 
 * @param {React.ReactNode} children - Các component con cần được bao bọc
 */
export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Thanh điều hướng ở trên cùng */}
        <Header />
        {/* Nội dung chính với animation chuyển trang */}
        <main className="min-h-screen page-transition">
          {children}
        </main>
        {/* Chân trang */}
        <Footer />
        {/* Component hiển thị thông báo toast - vị trí góc trên phải */}
        <Toaster position="top-right" richColors />
      </CartProvider>
    </AuthProvider>
  )
}
