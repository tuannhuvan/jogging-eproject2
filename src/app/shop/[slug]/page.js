"use client"

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Minus, Plus, Check, Phone, ChevronRight, Shield, Truck, RefreshCw, Award, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

function cleanImageUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  
  if (url.startsWith('o-')) {
    const httpIndex = url.indexOf('http');
    const dataIndex = url.indexOf('data:');
    
    let startIndex = -1;
    if (httpIndex !== -1 && dataIndex !== -1) {
      startIndex = Math.min(httpIndex, dataIndex);
    } else {
      startIndex = Math.max(httpIndex, dataIndex);
    }
    
    if (startIndex !== -1) {
      return url.substring(startIndex);
    }
  }
  return url;
}

export default function ProductDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerEmail, setReviewerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const descriptionRef = useRef(null)

  const productImages = product ? [
    product.image_url,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean) : []

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single()
      
      if (data) {
        setProduct(data)

        if (data.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', data.category_id)
            .single()
          if (catData) setCategory(catData)

          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4)
          if (relatedData) setRelatedProducts(relatedData)
        }

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false })
        
        if (reviewsData) setReviews(reviewsData)

        if (user) {
          const { data: orderData } = await supabase
            .from('order_items')
            .select('orders!inner(user_id, status)')
            .eq('product_id', data.id)
            .eq('orders.user_id', user.id)
            .eq('orders.status', 'delivered')
            .limit(1)
          
          setHasPurchased(orderData && orderData.length > 0)
        }
      }
      setLoading(false)
    }
    fetchProduct()
  }, [params.slug, user])

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

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!product) return

    const userName = user && profile ? profile.full_name : reviewerName.trim()
    if (!userName) {
      toast.error('Vui lòng nhập tên của bạn')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: product.id,
        user_id: user?.id || null,
        user_name: userName,
        rating,
        comment: comment.trim()
      })
      .select()
      .single()

    if (error) {
      toast.error('Không thể gửi đánh giá')
    } else if (data) {
      setReviews([data, ...reviews])
      setComment('')
      setRating(5)
      setReviewerName('')
      setReviewerEmail('')
      toast.success('Đánh giá đã được gửi')
    }
    setSubmitting(false)
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 bg-muted rounded" />)}
              </div>
            </div>
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

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/shop" className="hover:text-primary transition-colors">Cửa hàng</Link>
            {category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href={`/shop?category=${category.slug}`} className="hover:text-primary transition-colors">
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-red-500 text-white px-3 py-1 rounded font-bold text-sm">
                        Giảm giá!
                      </span>
                    </div>
                  )}
                  <Image
                    src={cleanImageUrl(productImages[selectedImage] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-20 h-20 rounded border-2 flex-shrink-0 overflow-hidden ${
                          selectedImage === idx ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={cleanImageUrl(img)}
                          alt={`${product.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-baseline gap-3 mb-4">
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {product.original_price.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  <span className="text-3xl font-bold text-red-500">
                    {product.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border rounded-lg">
                    <button
                      className="p-3 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 min-w-[60px] text-center font-medium">{quantity}</span>
                    <button
                      className="p-3 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    size="lg"
                    className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white py-6"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity <= 0}
                  >
                    THÊM VÀO GIỎ HÀNG
                  </Button>
                </div>

                <div className="flex gap-3 mb-6">
                  <a
                    href="tel:0785519888"
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    0976.493.683
                  </a>
                  <a
                    href="https://chat.zalo.me/0976493683"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    ZALO
                  </a>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Sản phẩm chính hãng</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Hướng dẫn sử dụng</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Bảo hành 1 đổi 1</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>COD toàn quốc</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 col-span-2">
                      <Check className="w-4 h-4" />
                      <span>Trả trong 14 ngày</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <p><span className="text-gray-500">Mã:</span> <span className="font-medium">{product.slug}</span></p>
                  {category && (
                    <p>
                      <span className="text-gray-500">Danh mục:</span>{' '}
                      <Link href={`/shop?category=${category.slug}`} className="text-blue-600 hover:underline">
                        {category.name}
                      </Link>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Từ khóa:</span>{' '}
                    <span className="text-blue-600">
                      {product.name.toLowerCase().split(' ').slice(0, 4).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'description'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  MÔ TẢ
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  THÔNG TIN BỔ SUNG
                </button>
                <button
                  onClick={() => setActiveTab('related')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'related'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  NỘI DUNG LIÊN QUAN
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ĐÁNH GIÁ ({reviews.length})
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {activeTab === 'description' && (
                <div ref={descriptionRef}>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {product.description}
                    </p>
                    
                    <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                      <p className="font-medium mb-2">Mục lục <span className="text-gray-400 text-sm">[Ẩn]</span></p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        <li>Giới thiệu {product.name}</li>
                        <li>Thuộc tính nổi bật</li>
                        <li>Hướng dẫn sử dụng</li>
                        <li>Kết luận</li>
                        <li>Mua hàng tại JOG</li>
                      </ol>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Giới thiệu {product.name}</h2>
                    <p className="text-gray-600 mb-6">
                      {product.name} là sản phẩm chất lượng cao dành cho người yêu thích chạy bộ và thể thao. 
                      Sản phẩm được thiết kế với công nghệ tiên tiến, mang lại trải nghiệm thoải mái và hiệu suất cao trong mọi hoạt động.
                    </p>

                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6 my-8">
                      <h3 className="text-xl font-bold text-teal-800 text-center mb-4">{product.name}</h3>
                      <div className="flex justify-center">
                        <div className="relative w-48 h-48">
                          <Image
                            src={cleanImageUrl(product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Kết luận</h2>
                    <p className="text-gray-600 mb-6">
                      {product.name} là lựa chọn hoàn hảo cho những ai đang tìm kiếm sản phẩm chất lượng với giá cả hợp lý. 
                      Sản phẩm có độ bền cao, thiết kế đẹp mắt và phù hợp với nhiều đối tượng sử dụng.
                    </p>

                    <div className="bg-gray-100 rounded-lg p-6 text-center my-8">
                      <h3 className="text-xl font-bold mb-4">Mua hàng tại JOG</h3>
                      <p className="text-gray-600 mb-4">
                        Để có chiết khấu tốt nhất thị trường, hoặc nhu cầu tư vấn sản phẩm, hoặc thông tin kỹ thuật,
                        vui lòng liên hệ với chúng tôi theo hotline bên dưới để được tư vấn tốt nhất.
                      </p>
                      <p className="text-2xl font-bold text-red-500 mb-4">
                        {'>>>'} 0976.493.683 {'<<<'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-6 my-8">
                      <h3 className="text-xl font-bold text-center mb-4 text-orange-800">TẠI SAO NÊN CHỌN JOG?</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-orange-800">HÀNG CHÍNH HÃNG CHẤT LƯỢNG TỐT NHẤT</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-orange-800">CAM KẾT GIÁ TỐT NHẤT KHU VỰC</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-orange-800">DỊCH VỤ BẢO HÀNH HẬU MÃI TẬN TÌNH LÂU DÀI</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">THÔNG TIN BỔ SUNG</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">THƯƠNG HIỆU</p>
                      <p className="font-medium">JOG Running</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">XUẤT XỨ</p>
                      <p className="font-medium">Việt Nam</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">ĐIỀU KIỆN LÀM VIỆC</p>
                      <p className="font-medium">+2-30°C, ≤75% RH</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">ĐIỀU KIỆN BẢO QUẢN</p>
                      <p className="font-medium">Nơi khô ráo, thoáng mát</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">HẠN SỬ DỤNG</p>
                      <p className="font-medium">24 tháng</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-500 text-sm mb-1">VỊ TRÍ DÙNG</p>
                      <p className="font-medium">Trong nhà, ngoài trời</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'related' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Nội dung liên quan</h3>
                  
                  {relatedProducts.length > 0 && (
                    <>
                      <h4 className="font-medium mb-4">Related Products</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {relatedProducts.map((item) => (
                          <Link key={item.id} href={`/shop/${item.slug}`}>
                            <Card className="hover:shadow-lg transition-shadow">
                              <div className="relative aspect-square">
                                <Image
                                  src={cleanImageUrl(item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              </div>
                              <CardContent className="p-3">
                                <h5 className="font-medium text-sm line-clamp-2 mb-2">{item.name}</h5>
                                <div className="flex items-center gap-1 mb-1">
                                  {[1,2,3,4,5].map((star) => (
                                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <p className="text-red-500 font-bold text-sm">
                                  {item.price?.toLocaleString('vi-VN')} đ
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {category && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Danh mục SP liên quan</h4>
                        <Link 
                          href={`/shop?category=${category.slug}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {category.name}
                        </Link>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 italic">Từ khoá SP liên quan</h4>
                        <p className="text-sm text-blue-600">
                          {product.name.toLowerCase().split(' ').join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    {reviews.length} đánh giá cho {product.name}
                  </h3>
                  
                  {reviews.length === 0 && (
                    <p className="text-gray-500 mb-6">Chưa có đánh giá nào.</p>
                  )}

                  {reviews.length > 0 && (
                    <div className="space-y-4 mb-8">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {review.user_name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{review.user_name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[1,2,3,4,5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Hãy là người đầu tiên nhận xét "{product.name}"
                    </p>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Đánh giá của bạn *</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Nhận xét của bạn *</label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Viết nhận xét của bạn về sản phẩm..."
                          rows={4}
                          required
                        />
                      </div>

                      {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Tên *</label>
                            <Input
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="Tên của bạn"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <Input
                              type="email"
                              value={reviewerEmail}
                              onChange={(e) => setReviewerEmail(e.target.value)}
                              placeholder="Email của bạn"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <label className="flex items-start gap-2 mb-4 text-sm text-gray-600">
                        <input type="checkbox" className="mt-1" />
                        <span>Lưu tên của tôi, email, và trang web trong trình duyệt này cho lần bình luận kế tiếp của tôi.</span>
                      </label>

                      <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                        {submitting ? 'Đang gửi...' : 'GỬI ĐI'}
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 py-3 px-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <Image
                src={cleanImageUrl(product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-sm line-clamp-1">{product.name}</p>
              <div className="flex items-baseline gap-2">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {product.original_price.toLocaleString('vi-VN')} đ
                  </span>
                )}
                <span className="text-red-500 font-bold">
                  {product.price.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded">
              <button
                className="p-2 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 min-w-[40px] text-center">{quantity}</span>
              <button
                className="p-2 hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              THÊM VÀO GIỎ HÀNG
            </Button>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </>
  )
}
