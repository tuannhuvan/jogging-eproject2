"use client"

/**
 * CART PAGE - Trang giỏ hàng
 * 
 * Trang này hiển thị:
 * - Danh sách sản phẩm trong giỏ hàng
 * - Tăng/giảm số lượng, xóa sản phẩm
 * - Tổng tiền và nút thanh toán
 * 
 * Route: /cart
 */

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

/**
 * Component trang giỏ hàng
 * Quản lý và hiển thị các sản phẩm trong giỏ hàng
 */
export default function CartPage() {
  // Lấy các hàm và dữ liệu từ CartContext
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart()
  // Lấy thông tin user từ AuthContext
  const { user } = useAuth()

  // Hiển thị trang trống nếu giỏ hàng không có sản phẩm
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link href="/shop">
          <Button className="gap-2">
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    )
  }

  // Hiển thị nội dung trang giỏ hàng khi có sản phẩm
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Tiêu đề với số lượng sản phẩm */}
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng ({items.length} sản phẩm)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm - 2/3 chiều rộng trên desktop */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Hình ảnh sản phẩm */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Thông tin sản phẩm */}
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                      {/* Điều khiển số lượng */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          {/* Nút giảm số lượng */}
                          <button
                            className="p-1.5 hover:bg-muted transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          {/* Hiển thị số lượng */}
                          <span className="px-3 min-w-[40px] text-center text-sm">
                            {item.quantity}
                          </span>
                          {/* Nút tăng số lượng */}
                          <button
                            className="p-1.5 hover:bg-muted transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Nút xóa sản phẩm */}
                        <button
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Thành tiền */}
                    <div className="text-right">
                      <p className="font-bold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Nút xóa tất cả sản phẩm */}
            <Button variant="outline" onClick={clearCart} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </Button>
          </div>

          {/* Tóm tắt đơn hàng - 1/3 chiều rộng trên desktop */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
                
                {/* Chi tiết tổng tiền */}
                <div className="space-y-3 mb-6">
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

                {/* Nút thanh toán - phụ thuộc trạng thái đăng nhập */}
                {user ? (
                  <Link href="/thanh-toan">
                    <Button className="w-full gap-2" size="lg">
                      Tiến hành thanh toán
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Đăng nhập để thanh toán
                    </p>
                    <Link href="/dang-nhap">
                      <Button className="w-full">Đăng nhập</Button>
                    </Link>
                  </div>
                )}

                {/* Link tiếp tục mua sắm */}
                <Link href="/shop" className="block mt-4">
                  <Button variant="outline" className="w-full gap-2">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
