"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, CreditCard, MapPin, Phone, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500', icon: CheckCircle },
  shipped: { label: 'Đang giao', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Đã giao', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500', icon: XCircle }
}

const paymentStatusConfig = {
  pending: { label: 'Chờ thanh toán', color: 'bg-orange-500' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-500' },
  failed: { label: 'Thanh toán thất bại', color: 'bg-red-500' }
}

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dang-nhap')
      return
    }

    if (user && params.id) {
      async function fetchOrder() {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (orderError || !orderData) {
          toast.error('Không tìm thấy đơn hàng')
          router.push('/don-hang')
          return
        }

        if (isSuccess && orderData.payment_status !== 'paid') {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid', status: 'confirmed' })
            .eq('id', params.id)
          
          orderData.payment_status = 'paid'
          orderData.status = 'confirmed'
          
          clearCart()
          setShowSuccess(true)
          toast.success('Thanh toán thành công!')
        }

        setOrder(orderData)

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products(name, image_url)')
          .eq('order_id', params.id)

        if (itemsData) setOrderItems(itemsData)
        setLoading(false)
      }
      fetchOrder()
    }
  }, [user, authLoading, params.id, router, isSuccess, clearCart])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending

  return (
    <div className="min-h-screen bg-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <Link href="/don-hang" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đơn hàng
        </Link>

        {showSuccess && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Đặt hàng thành công!</h2>
              <p className="text-green-700">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm liên hệ để giao hàng.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Đơn hàng #{order.id}</h1>
          <div className="flex gap-2">
            <Badge className={`${status.color} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <Badge className={`${paymentStatus.color} text-white`}>
              <CreditCard className="w-3 h-3 mr-1" />
              {paymentStatus.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Sản phẩm đã đặt ({orderItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.products?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                          alt={item.products?.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.products?.name || 'Sản phẩm'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(item.price).toLocaleString('vi-VN')}đ x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{order.shipping_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Chi tiết thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{parseFloat(order.total_amount).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-primary">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="text-xl font-bold text-primary">
                      {parseFloat(order.total_amount).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Ngày đặt:</span>
                    <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {order.stripe_session_id && (
                    <div className="flex justify-between">
                      <span>Mã thanh toán:</span>
                      <span className="font-mono text-xs">{order.stripe_session_id.slice(-8)}</span>
                    </div>
                  )}
                </div>

                <Link href="/shop">
                  <Button className="w-full mt-4">Tiếp tục mua sắm</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
