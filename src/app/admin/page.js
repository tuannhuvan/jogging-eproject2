"use client"

/**
 * ADMIN DASHBOARD PAGE - Trang tổng quan quản trị
 * 
 * Trang này hiển thị:
 * - Thống kê tổng quan (số sản phẩm, bài viết, đơn hàng, đánh giá)
 * - Menu quản lý nội dung
 * - Các thao tác nhanh
 * 
 * Chỉ admin mới có quyền truy cập trang này
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, FileText, Users, ShoppingCart, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

/**
 * Component trang Dashboard Admin
 * Hiển thị thống kê và menu quản lý
 */
export default function AdminDashboard() {
  const router = useRouter()
  // Lấy thông tin user và profile từ AuthContext
  const { user, profile, authLoading } = useAuth()
  // State lưu số liệu thống kê
  const [stats, setStats] = useState({
    products: 0,   // Số sản phẩm
    posts: 0,      // Số bài viết
    orders: 0,     // Số đơn hàng
    reviews: 0     // Số đánh giá
  })

  // Effect: Kiểm tra quyền admin và lấy dữ liệu thống kê
  useEffect(() => {
    // Chuyển hướng về trang chủ nếu không phải admin
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    // Nếu là admin, lấy số liệu thống kê từ database
    if (user && profile?.role === 'admin') {
      async function fetchStats() {
        // Gọi song song 4 API để đếm số lượng từng loại
        const [productsRes, postsRes, ordersRes, reviewsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('reviews').select('id', { count: 'exact', head: true })
        ])
        
        // Cập nhật state với số liệu
        setStats({
          products: productsRes.count || 0,
          posts: postsRes.count || 0,
          orders: ordersRes.count || 0,
          reviews: reviewsRes.count || 0
        })
      }
      fetchStats()
    }
  }, [user, profile, authLoading, router])

  // Hiển thị skeleton loading khi đang tải hoặc không có quyền
  if (authLoading || !user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cấu hình các thẻ thống kê - mỗi thẻ có tiêu đề, giá trị, icon và màu sắc
  const statCards = [
    { title: 'Sản phẩm', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { title: 'Bài viết', value: stats.posts, icon: FileText, color: 'bg-green-500' },
    { title: 'Đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'bg-purple-500' },
    { title: 'Đánh giá', value: stats.reviews, icon: Star, color: 'bg-yellow-500' }
  ]

  // Cấu hình menu điều hướng đến các trang quản lý
  const menuItems = [
    { href: '/admin/products', label: 'Quản lý sản phẩm', icon: Package },
    { href: '/admin/posts', label: 'Quản lý bài viết', icon: FileText },
    { href: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
    { href: '/admin/users', label: 'Quản lý người dùng', icon: Users }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header: Icon và tiêu đề trang */}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Trang quản trị</h1>
        </div>

        {/* Grid hiển thị 4 thẻ thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Bên trái: Label và số liệu */}
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    {/* Bên phải: Icon với màu nền tương ứng */}
                    <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Grid 2 cột: Menu quản lý và Thao tác nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Menu quản lý nội dung */}
          <Card>
            <CardHeader>
              <CardTitle>Quản lý nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          {/* Card: Các thao tác nhanh */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/products">
                <Button className="w-full gap-2">
                  <Package className="w-5 h-5" />
                  Xem danh sách sản phẩm
                </Button>
              </Link>
              <Link href="/admin/posts">
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="w-5 h-5" />
                  Xem bài viết
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
