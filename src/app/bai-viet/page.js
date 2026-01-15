"use client"

/**
 * BAI VIET PAGE - Trang danh sách bài viết kiến thức chạy bộ
 * 
 * Trang này hiển thị:
 * - Banner header với tiêu đề và mô tả
 * - Tabs phân loại theo danh mục
 * - Danh sách bài viết dạng grid với hình ảnh, tiêu đề, tác giả
 * 
 * Route: /bai-viet
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Component trang danh sách bài viết
 * Hiển thị các bài viết về kiến thức chạy bộ với khả năng lọc theo danh mục
 */
export default function BaiVietPage() {
  // State lưu danh sách bài viết
  const [posts, setPosts] = useState([])
  // State lưu danh sách danh mục
  const [categories, setCategories] = useState([])
  // State lưu danh mục đang được chọn
  const [activeCategory, setActiveCategory] = useState('all')
  // State theo dõi trạng thái đang tải
  const [loading, setLoading] = useState(true)

  // Effect: Tải dữ liệu bài viết và danh mục khi component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Gọi song song 2 API để tối ưu thời gian tải
        const [postsRes, categoriesRes] = await Promise.all([
          api.getPosts(),
          api.getCategories({ type: 'post' })
        ])
        // Cập nhật state với dữ liệu nhận được
        if (postsRes) setPosts(postsRes)
        if (categoriesRes) setCategories(categoriesRes)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    // Gọi hàm fetchData để tải dữ liệu
    fetchData()
  }, [])

  // Lọc bài viết theo danh mục đang chọn
  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category_id === parseInt(activeCategory))

  return (
    <div className="min-h-screen">
      {/* Banner header với gradient màu primary */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Kiến thức chạy bộ</h1>
          <p className="text-xl text-white/90">
            Kiến thức chạy bộ từ chuyên gia cho mọi cấp độ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs phân loại theo danh mục */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-transparent">
            {/* Tab "Tất cả" */}
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Tất cả
            </TabsTrigger>
            {/* Render các tab danh mục động */}
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {/* Hiển thị skeleton loading khi đang tải */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              // Hiển thị thông báo khi không có bài viết
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chưa có bài viết nào trong danh mục này.</p>
              </div>
            ) : (
              // Grid hiển thị danh sách bài viết
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post, index) => (
                    <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in h-full" style={{ animationDelay: `${index * 50}ms` }}>
                      {/* Hình ảnh bài viết */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Badge "Nổi bật" nếu bài viết được đánh dấu */}
                        {post.is_featured && (
                          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                            Nổi bật
                          </span>
                        )}
                      </div>
                      {/* Nội dung bài viết */}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Tên tác giả */}
                          <span className="text-xs text-primary font-medium">{post.author}</span>
                          {/* Ngày đăng */}
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {/* Tiêu đề bài viết */}
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {post.title}
                        </h3>
                        {/* Mô tả ngắn */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
