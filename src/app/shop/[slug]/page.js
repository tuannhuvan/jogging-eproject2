"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, ShoppingBag, Minus, Plus, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

// Trang chi tiết sản phẩm
export default function ProductDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  // Tải dữ liệu sản phẩm và đánh giá khi component được gắn kết hoặc khi slug thay đổi
  useEffect(() => {
    async function fetchProduct() {
      try {
        const products = await api.getProducts({ slug: params.slug })
        if (products && products.length > 0) {
          const data = products[0]
          setProduct(data)
          
          const reviewsData = await api.getReviews({ product_id: data.id })
          if (reviewsData) setReviews(reviewsData)

          // trong trường hợp bạn muốn kiểm tra xem người dùng đã mua sản phẩm này chưa
          // thì bạn có thể thêm logic ở đây để kiểm tra đơn hàng của người dùng
          // setHasPurchased(...) 
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching product:', error)
        setLoading(false)
      }
    }
    // gọi hàm tải sản phẩm
    fetchProduct()
  }, [params.slug, user])

  // Hàm xử lý thêm sản phẩm vào giỏ hàng
  function handleAddToCart() {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      })
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`)
  }

  // Hàm xử lý gửi đánh giá
  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user || !profile || !product) return

    setSubmitting(true)
    try {
      const data = await api.postData('submit_review.php', {
        product_id: product.id,
        user_id: user.id,
        user_name: profile.full_name,
        rating,
        comment: comment.trim()
      })
      
      if (data && !data.error) {
        setReviews([data, ...reviews])
        setComment('')
        setRating(5)
        toast.success('Đánh giá đã được gửi')
      } else {
        toast.error(data?.error || 'Không thể gửi đánh giá')
      }
    } catch (error) {
      toast.error('Không thể gửi đánh giá')
    }
    setSubmitting(false)
  }

  // Tính điểm đánh giá trung bình
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5

  // Hiển thị trạng thái tải hoặc lỗi
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <Link href="/shop">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    )
  }

  // Hiển thị chi tiết sản phẩm
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.original_price && product.original_price > product.price && (
              <span className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 rounded">
                -{Math.round((1 - product.price / product.original_price) * 100)}%
              </span>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({reviews.length} đánh giá)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-muted-foreground line-through ml-3">
                  {product.original_price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <span className={product.stock_quantity > 0 ? 'text-primary' : 'text-destructive'}>
                {product.stock_quantity > 0 ? `Còn ${product.stock_quantity} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  className="p-2 hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                <button
                  className="p-2 hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingBag className="w-5 h-5" />
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm ({reviews.length})</h2>

          {user ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <span className="text-sm font-medium block mb-2">Đánh giá:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Nhận xét của bạn về sản phẩm..."
                    className="mb-4"
                    rows={3}
                  />
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Đăng nhập để đánh giá sản phẩm</p>
                <Link href="/dang-nhap">
                  <Button>Đăng nhập</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">
                          {(review.user_name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
