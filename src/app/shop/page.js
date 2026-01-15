"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Filter, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Số sản phẩm hiển thị mỗi trang
const PRODUCTS_PER_PAGE = 12

// Dữ liệu mẫu cho hình ảnh nếu không có trong database
const fallbackImages = {
  product: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800'
  ]
}

// Hàm làm sạch URL hình ảnh để tránh lỗi từ visual editor loader
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

// Nội dung chính của trang cửa hàng
function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Lấy danh mục và trang hiện tại từ URL (nếu có)
  const categoryParam = searchParams.get('category')
  const pageParam = parseInt(searchParams.get('page')) || 1
  // Quản lý trạng thái sản phẩm, danh mục, danh mục đang chọn, sắp xếp và trạng thái tải
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  // Trang hiện tại (bắt đầu từ 1)
  const [currentPage, setCurrentPage] = useState(pageParam)
  const { addItem } = useCart()

  // Tải dữ liệu sản phẩm và danh mục sản phẩm từ API khi component được gắn kết (mount)
  useEffect(() => {
    async function fetchData() {
      try {
        // Tải song song danh sách sản phẩm và danh mục loại 'product'
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts(),
          api.getCategories({ type: 'product' })
        ])
        if (productsRes) setProducts(productsRes)
        if (categoriesRes) setCategories(categoriesRes)
        setLoading(false)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu cửa hàng:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Xử lý lọc sản phẩm theo danh mục và sắp xếp theo các tiêu chí (giá, mới nhất)
  const filteredProducts = products
    .filter(p => {
      if (selectedCategory === 'all') return true
      const cat = categories.find(c => c.slug === selectedCategory)
      return cat ? p.category_id === cat.id : true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': // Giá tăng dần
          return a.price - b.price
        case 'price-desc': // Giá giảm dần
          return b.price - a.price
        case 'newest': // Mới nhất lên đầu
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Tính toán phân trang
  const totalProducts = filteredProducts.length
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  // Lấy sản phẩm cho trang hiện tại
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  // Reset về trang 1 khi thay đổi danh mục hoặc sắp xếp
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy])

  // Hàm chuyển trang
  function goToPage(page) {
    setCurrentPage(page)
    // Cập nhật URL với tham số page
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/shop?${params.toString()}`, { scroll: false })
    // Cuộn lên đầu danh sách sản phẩm
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  // Hàm xử lý thêm sản phẩm vào giỏ hàng và hiển thị thông báo
  function handleAddToCart(product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    })
    toast.success('Đã thêm sản phẩm vào giỏ hàng')
  }

  // Giao diện hiển thị trang cửa hàng
  return (
    <div className="min-h-screen">
      {/* Phần tiêu đề cửa hàng (Hero Section) */}
      <div className="bg-gradient-to-r from-chart-3 to-chart-3/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Cửa hàng trang bị</h1>
          <p className="text-xl text-white/90">
            Trang thiết bị, phụ kiện chạy bộ chính hãng và chất lượng
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Bộ lọc theo danh mục và sắp xếp */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Nút lọc 'Tất cả' */}
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              Tất cả
            </Button>
            {/* Danh sách các danh mục sản phẩm từ database */}
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.slug)}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Chọn tiêu chí sắp xếp */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Danh sách sản phẩm - Hiển thị Skeleton khi đang tải */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-6 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Thông báo khi không tìm thấy sản phẩm phù hợp */
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với yêu cầu.</p>
          </div>
          ) : (
            /* Lưới hiển thị danh sách sản phẩm */
            <>
              {/* Thông tin phân trang */}
              <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                <span>
                  Hiển thị {startIndex + 1} - {Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts)} / {totalProducts} sản phẩm
                </span>
                {totalPages > 1 && (
                  <span>Trang {currentPage} / {totalPages}</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden group animate-fade-in flex flex-col h-full" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link href={`/shop/${product.slug}`}>
                      {/* Hình ảnh sản phẩm kèm nhãn giảm giá */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                          {/* Ảnh chính */}
                          <Image
                            src={cleanImageUrl(product.image_url || fallbackImages.product[index % fallbackImages.product.length])}
                            alt={product.name}
                          fill
                          className={`object-cover transition-all duration-500 ${
                            product.images && product.images.length > 0 
                              ? 'group-hover:opacity-0 group-hover:scale-105' 
                              : 'group-hover:scale-105'
                          }`}
                        />
                        
                        {/* Ảnh thứ 2 hiển thị khi hover (nếu có) */}
                        {product.images && product.images.length > 0 && (
                          <Image
                            src={cleanImageUrl(product.images[0])}
                            alt={`${product.name} hover`}
                            fill
                            className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 absolute inset-0"
                          />
                        )}

                      {product.original_price && product.original_price > product.price && (

                      <span className="absolute top-2 left-2 bg-destructive text-white text-[10px] md:text-xs px-2 py-1 rounded font-bold shadow-sm">
                        GIẢM {Math.round((1 - product.price / product.original_price) * 100)}%
                      </span>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4 flex flex-col flex-1">
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2 min-h-[40px]">
                      {product.name}
                    </h3>
                  </Link>
                  {/* Đánh giá 5 sao (giả định) */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  {/* Giá sản phẩm và nút thêm vào giỏ hàng */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through block">
                          {product.original_price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 border-primary/20 hover:bg-primary hover:text-white transition-all"
                      onClick={() => handleAddToCart(product)}
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {/* Nút trang trước */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Các nút số trang */}
                  <div className="flex items-center gap-1">
                    {/* Trang đầu tiên */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="h-10 w-10"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                      </>
                    )}

                    {/* Các trang xung quanh trang hiện tại */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                      .map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="h-10 w-10"
                        >
                          {page}
                        </Button>
                      ))}

                    {/* Trang cuối cùng */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="h-10 w-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Nút trang sau */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }


// Trang cửa hàng với Suspense để tải nội dung chính
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ShopContent />
    </Suspense>
  )
}
