"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Filter, ShoppingCart } from 'lucide-react'
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

function ShopContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts(),
          api.getCategories({ type: 'product' })
        ])
        if (productsRes) setProducts(productsRes)
        if (categoriesRes) setCategories(categoriesRes)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products
    .filter(p => {
      if (selectedCategory === 'all') return true
      const cat = categories.find(c => c.slug === selectedCategory)
      return cat ? p.category_id === cat.id : true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  function handleAddToCart(product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    })
    toast.success('Đã thêm vào giỏ hàng')
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-chart-3 to-chart-3/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Cửa hàng</h1>
          <p className="text-xl text-white/90">
            Trang thiết bị chạy bộ chính hãng
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              Tất cả
            </Button>
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

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không có sản phẩm nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <Link href={`/shop/${product.slug}`}>
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
                </Link>
                <CardContent className="p-4">
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
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
                      className="h-8 w-8"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ShopContent />
    </Suspense>
  )
}
