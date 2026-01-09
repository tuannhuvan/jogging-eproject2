"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Star, ShoppingBag, BookOpen, Apple, Calendar, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'

const bannerSlides = [
  {
    title: "Khám phá thế giới chạy bộ",
    subtitle: "Kiến thức - Kỹ thuật - Trang thiết bị",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600",
    cta: { text: "Khám phá ngay", href: "/kien-thuc" }
  },
  {
    title: "Bộ sưu tập giày chạy 2024",
    subtitle: "Nike, Adidas, ASICS - Giá tốt nhất",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600",
    cta: { text: "Mua sắm ngay", href: "/shop" }
  },
  {
    title: "Dinh dưỡng cho Runner",
    subtitle: "Ăn uống khoa học - Chạy bền bỉ",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600",
    cta: { text: "Tìm hiểu thêm", href: "/dinh-duong" }
  }
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [posts, setPosts] = useState([])
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, productsRes, eventsRes] = await Promise.all([
          api.getPosts({ is_featured: 'true', limit: 3 }),
          api.getProducts({ is_featured: 'true', limit: 4 }),
          api.getEvents()
        ])
        if (postsRes) setPosts(postsRes)
        if (productsRes) setProducts(productsRes)
        if (eventsRes) setEvents(eventsRes.filter(e => e.status === 'Open').slice(0, 3))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)

  return (
    <div>
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-xl animate-fade-in">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-white/90 mb-8">
                    {slide.subtitle}
                  </p>
                  <Link href={slide.cta.href}>
                    <Button size="lg" className="gap-2">
                      {slide.cta.text}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-16 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link href="/events" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sự kiện</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Khám phá và đăng ký các giải chạy bộ mới nhất
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/kien-thuc" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-emerald-500" />
                  </div>
                    <h3 className="text-xl font-bold mb-2">Kiến thức chạy bộ</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Kỹ thuật chạy bộ, hướng dẫn luyện tập và kiến thức chuyên sâu từ chuyên gia
                    </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dinh-duong" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Apple className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dinh dưỡng</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chế độ ăn uống khoa học dành riêng cho Runner
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/clubs" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cộng đồng</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Kết nối với các câu lạc bộ và những người cùng đam mê
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/shop" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cửa hàng</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Trang thiết bị chính hãng - Giày, quần áo, phụ kiện
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Sự kiện sắp tới</h2>
                <p className="text-muted-foreground mt-1">Các giải chạy không thể bỏ lỡ</p>
              </div>
              <Link href="/events">
                <Button variant="outline" className="gap-2">
                  Xem tất cả <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={event.image_url || 'https://images.unsplash.com/photo-1547483100-3023e602446f?w=800'}
                        alt={event.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                        Sắp diễn ra
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">
                        {event.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Bài viết nổi bật</h2>
              <p className="text-muted-foreground mt-1">Kiến thức mới nhất về chạy bộ</p>
            </div>
            <Link href="/kien-thuc">
              <Button variant="outline" className="gap-2">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-primary font-medium mb-2">{post.author}</p>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
              <p className="text-muted-foreground mt-1">Được yêu thích nhất</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="gap-2">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.original_price && product.original_price > product.price && (
                      <span className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-1 rounded">
                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-primary">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.original_price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tham gia cộng đồng Runner Việt Nam
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để nhận thông tin về các sự kiện chạy bộ, ưu đãi độc quyền và kiến thức bổ ích
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button size="lg" variant="secondary" className="whitespace-nowrap">
              Đăng ký ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
