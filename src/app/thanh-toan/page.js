/**
 * Trang Thanh toán - Checkout Page
 * 
 * Chức năng:
 * - Hiển thị form nhập thông tin giao hàng
 * - Auto-fill thông tin từ profile nếu đã đăng nhập
 * - Chọn phương thức thanh toán: COD hoặc MoMo
 * - Tạo đơn hàng và xử lý thanh toán
 * 
 * Phương thức thanh toán:
 * 1. COD (Cash On Delivery): Thanh toán khi nhận hàng
 *    - API: /api/checkout/cod
 *    - Redirect: /don-hang/{orderId}?success=true
 * 
 * 2. MoMo: Thanh toán qua ví điện tử
 *    - API: /api/checkout/momo
 *    - Redirect: MoMo payment page -> callback -> /don-hang/{orderId}
 * 
 * Yêu cầu:
 * - Người dùng phải đăng nhập
 * - Giỏ hàng không được trống
 * - Phải nhập địa chỉ và số điện thoại
 * 
 * Luồng COD:
 * 1. User nhập thông tin và chọn COD
 * 2. Gọi API /api/checkout/cod
 * 3. API tạo order, trừ tồn kho
 * 4. Redirect về /don-hang/{orderId}?success=true
 * 5. Admin quản lý đơn hàng, cập nhật trạng thái khi giao hàng thành công
 */
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, CreditCard, MapPin, Phone, Loader2, Lock, Banknote, Wallet, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function CheckoutPage() {
  // === HOOKS ===
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const { user, profile, loading: authLoading } = useAuth()
  
  // === STATE ===
  // Trạng thái loading khi xử lý thanh toán
  const [loading, setLoading] = useState(false)
  // Phương thức thanh toán: 'cod' hoặc 'momo'
  const [paymentMethod, setPaymentMethod] = useState('cod')
  // Dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    shippingAddress: '',
    phone: '',
  })

  // === EFFECTS ===
  /**
   * Auto-fill thông tin từ profile khi đã đăng nhập
   * Cập nhật form khi profile thay đổi
   */
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        shippingAddress: profile.address || prev.shippingAddress,
        phone: profile.phone || prev.phone,
      }))
    }
  }, [profile])

  // === RENDER: Loading state ===
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  // === RENDER: Chưa đăng nhập ===
  // Yêu cầu đăng nhập để thanh toán, sau đó quay lại trang này
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Bạn cần đăng nhập để thanh toán. Sau khi đăng nhập, bạn sẽ được quay lại trang thanh toán.
        </p>
        <div className="flex gap-4">
          <Link href="/dang-nhap?redirect=/thanh-toan">
            <Button>Đăng nhập</Button>
          </Link>
          <Link href="/dang-nhap?tab=register&redirect=/thanh-toan">
            <Button variant="outline">Đăng ký tài khoản</Button>
          </Link>
        </div>
      </div>
    )
  }

  // === RENDER: Giỏ hàng trống ===
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link href="/shop">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    )
  }

  // === HANDLERS ===
  /**
   * Xử lý thanh toán khi submit form
   * - COD: Tạo đơn hàng, redirect về trang đơn hàng
   * - MoMo: Tạo phiên thanh toán, redirect sang MoMo
   */
  async function handleCheckout(e) {
    e.preventDefault()

    // Validate form
    if (!formData.fullName) {
      toast.error('Vui lòng nhập họ tên người nhận')
      return
    }
    if (!formData.shippingAddress) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    if (!formData.phone) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    setLoading(true)
    try {
      // Chuẩn bị dữ liệu sản phẩm
      const checkoutItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      // Chọn API endpoint dựa trên phương thức thanh toán
      const apiUrl = paymentMethod === 'cod' ? '/api/checkout/cod' : '/api/checkout/momo'

      // Gọi API checkout
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          userId: user.id,
          fullName: formData.fullName,
          shippingAddress: formData.shippingAddress,
          phone: formData.phone,
        }),
      })

      // Parse response
      const data = await response.json()

      // Kiểm tra lỗi từ API
      if (!response.ok) {
        throw new Error(data.error || 'Không thể xử lý đơn hàng')
      }

      // Xử lý COD - đặt hàng thành công
      if (paymentMethod === 'cod') {
        clearCart()
        toast.success('Đặt hàng thành công! Đơn hàng của bạn đã được gửi đến admin.')
        router.push(`/don-hang/${data.orderId}?success=true`)
      } 
      // Xử lý MoMo - redirect sang trang thanh toán
      else {
        clearCart()
        if (data.payUrl) {
          window.location.href = data.payUrl
        } else {
          throw new Error('Không nhận được URL thanh toán MoMo')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Đã xảy ra lỗi khi thanh toán')
      setLoading(false)
    }
  }

  // === RENDER: Trang thanh toán ===
  return (
    <div className="min-h-screen bg-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột bên trái - Form nhập thông tin */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card thông tin giao hàng */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Thông tin giao hàng
                  </CardTitle>
                  {profile && (
                    <CardDescription>
                      Thông tin được tự động điền từ tài khoản của bạn
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input họ tên */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Họ tên người nhận
                    </label>
                    <Input
                      placeholder="Nhập họ tên người nhận hàng"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {/* Input địa chỉ */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Địa chỉ giao hàng</label>
                    <Textarea
                      placeholder="Nhập địa chỉ giao hàng chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  {/* Input số điện thoại */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Số điện thoại
                    </label>
                    <Input
                      type="tel"
                      placeholder="Nhập số điện thoại liên hệ"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card chọn phương thức thanh toán */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Option COD */}
                  <label 
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>
                  {/* Option MoMo */}
                  <label 
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <Wallet className="w-6 h-6 text-pink-500" />
                    <div>
                      <p className="font-medium">Thanh toán qua MoMo</p>
                      <p className="text-sm text-muted-foreground">Ví điện tử MoMo, QR Code, ATM</p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              {/* Card danh sách sản phẩm */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Sản phẩm ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                          <p className="font-bold text-primary">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cột bên phải - Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="text-primary">Miễn phí</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-bold">Tổng cộng</span>
                      <span className="text-xl font-bold text-primary">
                        {totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  {/* Nút thanh toán */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : paymentMethod === 'cod' ? (
                      <>
                        <Banknote className="w-5 h-5" />
                        Đặt hàng (COD)
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Thanh toán với MoMo
                      </>
                    )}
                  </Button>

                  {/* Mô tả phương thức thanh toán */}
                  <p className="text-xs text-center text-muted-foreground">
                    {paymentMethod === 'cod' 
                      ? 'Bạn sẽ thanh toán khi nhận hàng. Đơn hàng sẽ được admin xác nhận.' 
                      : 'Thanh toán an toàn qua ví MoMo'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
