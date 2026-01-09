"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon, MessageCircle, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

// Trang chi tiết bài viết kiến thức
export default function PostDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Tải dữ liệu bài viết và bình luận khi component được gắn kết
  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single()
      
      if (data) {
        setPost(data)
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', data.id)
          .order('created_at', { ascending: false })
        
        if (commentsData) setComments(commentsData)
      }
      setLoading(false)
    }
    fetchPost()
  }, [params.slug])

  // Hàm xử lý gửi bình luận mới
  async function handleSubmitComment(e) {
    e.preventDefault()
    if (!user || !profile || !post || !newComment.trim()) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        user_name: profile.full_name,
        content: newComment.trim()
      })
      .select()
      .single()

    if (error) {
      toast.error('Không thể gửi bình luận')
    } else if (data) {
      setComments([data, ...comments])
      setNewComment('')
      toast.success('Bình luận đã được gửi')
    }
    setSubmitting(false)
  }

  // Hiển thị trạng thái tải dữ liệu
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-64 bg-muted rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    )
  }

  // Hiển thị thông báo nếu không tìm thấy bài viết
    if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
        <Link href="/kien-thuc">
          <Button>Quay lại kiến thức chạy bộ</Button>
        </Link>
      </div>
    )
  }

  // Hiển thị nội dung bài viết và bình luận
  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] md:h-[400px]">
        <Image
          src={post.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600'}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Link href="/kien-thuc" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments.length} bình luận
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <article className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          <div className="border-t pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Bình luận ({comments.length})
            </h3>

            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="mb-4"
                  rows={3}
                />
                <Button type="submit" disabled={submitting || !newComment.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </Button>
              </form>
            ) : (
              <Card className="mb-8">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground mb-4">Đăng nhập để bình luận</p>
                  <Link href="/dang-nhap">
                    <Button>Đăng nhập</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </p>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comment.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm pl-10">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
