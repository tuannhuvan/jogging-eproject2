"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, FileText, Users, ShoppingCart, Star, Settings, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

// Trang bảng điều khiển quản trị
export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    posts: 0,
    orders: 0,
    reviews: 0
  })

  // Chuyển hướng nếu người dùng không phải admin và tải số liệu thống kê
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    if (user && profile?.role === 'admin') {
      async function fetchStats() {
        const [productsRes, postsRes, ordersRes, reviewsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('reviews').select('id', { count: 'exact', head: true })
        ])
        
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

  const statCards = [
    { title: 'Sản phẩm', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { title: 'Bài viết', value: stats.posts, icon: FileText, color: 'bg-green-500' },
    { title: 'Đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'bg-purple-500' },
    { title: 'Đánh giá', value: stats.reviews, icon: Star, color: 'bg-yellow-500' }
  ]

  const menuItems = [
    { href: '/admin/products', label: 'Quản lý sản phẩm', icon: Package },
    { href: '/admin/posts', label: 'Quản lý bài viết', icon: FileText },
    { href: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
    { href: '/admin/users', label: 'Quản lý người dùng', icon: Users }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Trang quản trị</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/products/new">
                <Button className="w-full gap-2">
                  <Package className="w-5 h-5" />
                  Thêm sản phẩm mới
                </Button>
              </Link>
              <Link href="/admin/posts/new">
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="w-5 h-5" />
                  Viết bài mới
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
