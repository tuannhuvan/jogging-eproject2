"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Trang Thanh toán đơn hàng (Checkout)
export default function CheckoutPage() {
  const router = useRouter()
  // Lấy thông tin từ giỏ hàng (sản phẩm, tổng tiền, hàm xóa giỏ hàng)
  const { items, totalAmount, clearCart } = useCart()
  // Lấy thông tin người dùng từ AuthContext
  const { user, profile } = useAuth()
  // Quản lý trạng thái đang xử lý và trạng thái thành công
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  // Dữ liệu biểu mẫu thông tin giao hàng
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: '',
    address: '',
    note: ''
  })

  // Nếu chưa đăng nhập, chuyển hướng người dùng về trang đăng nhập
  if (!user) {
    router.push('/dang-nhap')
    return null
  }

  // Nếu giỏ hàng trống (và không phải vừa đặt hàng xong), chuyển hướng về trang giỏ hàng
  if (items.length === 0 && !success) {
    router.push('/cart')
    return null
  }

  // Xử lý khi người dùng nhấn nút "Xác nhận đặt hàng"
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Bước 1: Tạo bản ghi đơn hàng chính trong bảng 'orders'
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address: formData.address,
        phone: formData.phone,
        status: 'pending' // Trạng thái ban đầu là chờ xác nhận
      })
      .select()
      .single()

    // Kiểm tra lỗi khi tạo đơn hàng
    if (orderError || !orderData) {
      toast.error('Không thể tạo đơn hàng')
      setLoading(false)
      return
    }

    // Bước 2: Chuẩn bị dữ liệu chi tiết các sản phẩm trong đơn hàng
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    // Bước 3: Lưu chi tiết sản phẩm vào bảng 'order_items'
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    // Kiểm tra lỗi khi lưu chi tiết sản phẩm
    if (itemsError) {
      toast.error('Không thể thêm sản phẩm vào đơn hàng')
      setLoading(false)
      return
    }

    // Bước 4: Xóa giỏ hàng, hiển thị thông báo thành công và cập nhật UI
    clearCart()
    setSuccess(true)
    toast.success('Đặt hàng thành công!')
    setLoading(false)
  }

  // Giao diện hiển thị sau khi đặt hàng thành công
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center animate-fade-in">
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/don-hang">
              <Button>Xem đơn hàng</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Giao diện biểu mẫu thanh toán
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Form nhập thông tin giao hàng */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ giao hàng</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Danh sách các sản phẩm đang đặt */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tính toán tổng tiền */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-primary">Miễn phí</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="text-xl font-bold text-primary">
                      {totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
