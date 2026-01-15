"use client"

/**
 * HEADER COMPONENT - Thanh điều hướng chính của ứng dụng
 * 
 * Hiển thị logo, menu điều hướng, giỏ hàng và thông tin người dùng
 * Hỗ trợ responsive cho cả desktop và mobile
 */

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { api } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Danh sách các liên kết điều hướng chính
// Được định nghĩa ngoài component để tránh tạo lại mảng mỗi lần render
const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/events', label: 'Sự kiện' },
  { href: '/kien-thuc', label: 'Kiến thức' },
  { href: '/dinh-duong', label: 'Dinh dưỡng' },
  { href: '/shop', label: 'Cửa hàng' },
  { href: '/clubs', label: 'Cộng đồng' },
]

/**
 * Component Header chính
 * Bao gồm: logo, menu điều hướng, giỏ hàng, tài khoản người dùng
 * và bộ đếm lượt truy cập
 */
export function Header() {
  // State quản lý trạng thái mở/đóng menu mobile
  const [isOpen, setIsOpen] = useState(false)
  // State lưu số lượt truy cập website
  const [visitorCount, setVisitorCount] = useState(0)
  // State theo dõi khi người dùng cuộn trang
  const [scrolled, setScrolled] = useState(false)
  // State kiểm tra component đã mounted chưa để tránh lỗi hydration
  const [mounted, setMounted] = useState(false)
  // Lấy thông tin user và profile từ AuthContext
  const { user, profile, signOut } = useAuth()
  // Lấy tổng số sản phẩm trong giỏ hàng từ CartContext
  const { totalItems } = useCart()

  // Effect lấy số lượt truy cập khi component mount
  useEffect(() => {
    setMounted(true)
    async function fetchVisitorCount() {
      try {
        const count = await api.getVisitors()
        if (typeof count === 'number') {
          setVisitorCount(count)
        }
      } catch (error) {
        console.error('Error in fetchVisitorCount:', error)
      }
    }
    fetchVisitorCount()
  }, [])

  // Effect theo dõi sự kiện cuộn để thay đổi style header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    // Cleanup: hủy event listener khi component unmount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
      {/* Hiển thị số lượt truy cập ở góc phải */}
      <div className="absolute top-2 right-4 text-xs text-muted-foreground flex items-center gap-1">
        <User className="w-3 h-3" />
        <span>{mounted ? visitorCount.toLocaleString() : '0'} lượt truy cập</span>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full 
            flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary 
            to-accent bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              JOG
            </span>
          </Link>

          {/* Menu điều hướng cho desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Phần bên phải: giỏ hàng và tài khoản (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Icon giỏ hàng với badge số lượng */}
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Menu dropdown tài khoản hoặc nút đăng nhập */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{profile?.full_name || 'Tài khoản'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Hiển thị link Quản trị nếu user là admin */}
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Quản trị</Link>
                    </DropdownMenuItem>
                  )}
                  {/* Hiển thị link Nhà cung cấp nếu user là supplier */}
                  {profile?.role === 'supplier' && (
                    <DropdownMenuItem asChild>
                      <Link href="/supplier">Nhà cung cấp</Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem asChild>
                      <Link href="/profile">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/don-hang">Đơn hàng của tôi</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      Đăng xuất
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/dang-nhap">
                <Button variant="default" size="sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          {/* Nút hamburger menu cho mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu mobile - hiển thị khi isOpen = true */}
        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <nav className="flex flex-col gap-2">
              {/* Các link điều hướng */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Link giỏ hàng */}
              <div className="flex items-center gap-3 px-4 pt-4 border-t mt-2">
                <Link href="/cart" className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Giỏ hàng ({totalItems})</span>
                </Link>
              </div>
              {/* Menu tài khoản cho mobile */}
              {user ? (
                  <div className="px-4 pt-2">
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="block py-2">Quản trị</Link>
                    )}
                    {profile?.role === 'supplier' && (
                      <Link href="/supplier" className="block py-2">Nhà cung cấp</Link>
                    )}
                    <Link href="/profile" className="block py-2">Hồ sơ cá nhân</Link>
                    <Link href="/don-hang" className="block py-2">Đơn hàng của tôi</Link>
                    <button onClick={signOut} className="text-destructive py-2">Đăng xuất</button>
                  </div>
              ) : (
                <div className="px-4 pt-2">
                  <Link href="/dang-nhap">
                    <Button className="w-full">Đăng nhập</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
