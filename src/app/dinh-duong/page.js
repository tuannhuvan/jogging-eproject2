"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Play } from 'lucide-react'

// Trang dinh dưỡng cho runner
export default function DinhDuongPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Tải dữ liệu bài viết về dinh dưỡng khi component được gắn kết
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getPosts()
        if (data) {
          // Filter for nutrition-related categories (assuming 3 and 4 based on previous code)
          setPosts(data.filter(p => p.category_id === 3 || p.category_id === 4))
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Dữ liệu video hướng dẫn (cố định cho ví dụ)
  const videos = [
    {
      id: 1,
      title: "Chế độ ăn trước cuộc đua Marathon",
      thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      duration: "15:30"
    },
    {
      id: 2,
      title: "Bổ sung nước đúng cách khi chạy",
      thumbnail: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
      duration: "10:45"
    },
    {
      id: 3,
      title: "Thực đơn recovery sau tập luyện",
      thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
      duration: "12:20"
    }
  ]

  // Hiển thị nội dung trang dinh dưỡng
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-accent to-accent/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Dinh dưỡng cho Runner</h1>
          <p className="text-xl text-white/90">
            Chế độ ăn uống khoa học để nâng cao hiệu suất và phục hồi
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Video hướng dẫn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <Card key={video.id} className="overflow-hidden cursor-pointer group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Bài viết về dinh dưỡng</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có bài viết nào về dinh dưỡng.</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <Link key={post.id} href={`/kien-thuc/${post.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in h-full" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image_url || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-accent font-medium">{post.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors mb-2">
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
        </section>
      </div>
    </div>
  )
}
