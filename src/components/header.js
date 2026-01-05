"use client"

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

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/bai-viet', label: 'Tư vấn & Bài viết' },
  { href: '/dinh-duong', label: 'Dinh dưỡng' },
  { href: '/shop', label: 'Cửa hàng' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [visitorCount, setVisitorCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    async function fetchVisitorCount() {
      try {
        const data = await api.getVisitors()
        if (data && data.count) {
          setVisitorCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching visitor count:', error)
      }
    }
    fetchVisitorCount()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
      <div className="absolute top-2 right-4 text-xs text-muted-foreground flex items-center gap-1">
        <User className="w-3 h-3" />
        <span>{visitorCount.toLocaleString()} lượt truy cập</span>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              JOG.com.vn
            </span>
          </Link>

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

          <div className="hidden md:flex items-center gap-3">
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

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
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Quản trị</Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'supplier' && (
                    <DropdownMenuItem asChild>
                      <Link href="/supplier">Nhà cung cấp</Link>
                    </DropdownMenuItem>
                  )}
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

          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <nav className="flex flex-col gap-2">
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
              <div className="flex items-center gap-3 px-4 pt-4 border-t mt-2">
                <Link href="/cart" className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Giỏ hàng ({totalItems})</span>
                </Link>
              </div>
              {user ? (
                <div className="px-4 pt-2">
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="block py-2">Quản trị</Link>
                  )}
                  {profile?.role === 'supplier' && (
                    <Link href="/supplier" className="block py-2">Nhà cung cấp</Link>
                  )}
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
