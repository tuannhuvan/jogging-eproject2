"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dữ liệu mẫu cho hình ảnh nếu không có trong database
const fallbackImages = {
  post: [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    'https://images.unsplash.com/photo-1530541930197-ff16ac7a7b2e?w=800',
    'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=800',
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800'
  ]
}

// Trang hiển thị danh sách kiến thức chạy bộ (Blog/Kiến thức)
export default function KienThucPage() {
  // Quản lý trạng thái bài viết, danh mục, danh mục đang chọn và trạng thái tải
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Tải dữ liệu bài viết và danh mục từ API khi component được gắn kết (mount)
  useEffect(() => {
    async function fetchData() {
      try {
        // Thực hiện tải song song bài viết và danh mục loại 'post'
        const [postsRes, categoriesRes] = await Promise.all([
          api.getPosts(),
          api.getCategories({ type: 'post' })
        ])
        if (postsRes) setPosts(postsRes)
        if (categoriesRes) setCategories(categoriesRes)
        setLoading(false)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kiến thức:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Lọc bài viết dựa trên danh mục người dùng đang chọn trên thanh tab
  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category_id === parseInt(activeCategory))

  // Giao diện chính của trang kiến thức
  return (
    <div className="min-h-screen">
      {/* Phần tiêu đề trang (Hero Section) */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Kiến thức chạy bộ</h1>
          <p className="text-xl text-white/90">
            Kỹ thuật, dinh dưỡng và kinh nghiệm từ các chuyên gia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Thanh lọc theo danh mục sử dụng Tabs component */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Tất cả
            </TabsTrigger>
            {/* Duyệt qua danh sách danh mục để tạo các nút lọc */}
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
            {/* Hiển thị Skeleton khi đang tải dữ liệu */}
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
              /* Hiển thị khi không có bài viết nào trong danh mục */
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chưa có nội dung nào trong danh mục này.</p>
              </div>
            ) : (
              /* Hiển thị danh sách các bài viết */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in h-full" style={{ animationDelay: `${index * 50}ms` }}>
                      {/* Hình ảnh đại diện bài viết */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Nhãn bài viết nổi bật */}
                        {post.is_featured && (
                          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                            Nổi bật
                          </span>
                        )}
                      </div>
                      {/* Nội dung tóm tắt bài viết */}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-primary font-medium">{post.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {post.title}
                        </h3>
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

