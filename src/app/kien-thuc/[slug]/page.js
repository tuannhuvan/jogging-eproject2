"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon, MessageCircle, Send, ChevronDown, ChevronUp, Phone, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'


// Trang chi tiết bài viết kiến thức
export default function PostDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toc, setToc] = useState([])
  const [processedContent, setProcessedContent] = useState('')
  const [isTocVisible, setIsTocVisible] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState([])

  // Tải dữ liệu bài viết và bình luận khi component được gắn kết
  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single()
    
      // Nếu tìm thấy bài viết, tải bình luận liên quan
      if (data) {
        setPost(data)
        
        // Xử lý mục lục và nội dung
        if (data.content) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(data.content, 'text/html')
          const headings = doc.querySelectorAll('h2, h3')
          const tocItems = []
          let h2Count = 0
          let h3Count = 0

          headings.forEach((heading) => {
            const level = heading.tagName.toLowerCase() === 'h2' ? 1 : 2
            if (level === 1) h2Count++
            const id = `section-${h2Count}${level === 2 ? `-${++h3Count}` : (h3Count = 0, '')}`
            heading.id = id
            tocItems.push({
              id,
              text: heading.innerText,
              level,
              number: level === 1 ? `${h2Count}` : `${h2Count}.${h3Count}`
            })
          })
          setToc(tocItems)
          setProcessedContent(doc.body.innerHTML)
        } else {
          setProcessedContent('')
        }

        // Lấy bài viết liên quan
        const { data: related } = await supabase
          .from('posts')
          .select('id, title, slug, image_url, created_at')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4)
        
        if (related) setRelatedPosts(related)

        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', data.id)
          .order('created_at', { ascending: false })
        
        // Thiết lập bình luận
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

    // Xử lý kết quả gửi bình luận
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

  // Hiển thị nếu không tìm thấy bài viết
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy kiến thức</h1>
        <Link href="/kien-thuc">
          <Button>Quay lại danh sách kiến thức</Button>
        </Link>
      </div>
    )
  }

  // Hiển thị nội dung bài viết và bình luận
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="mb-2">
              <span className="bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded uppercase">Kien thuc</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                ĐĂNG BỞI {post.author?.toUpperCase() || 'ADMIN'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 md:p-10 mb-8">
            {/* Mục lục */}
            {toc.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4 mb-8 max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Mục lục 
                    <button 
                      onClick={() => setIsTocVisible(!isTocVisible)}
                      className="text-primary hover:underline text-sm font-normal"
                    >
                      [{isTocVisible ? 'Ẩn' : 'Hiện'}]
                    </button>
                  </h2>
                </div>
                {isTocVisible && (
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li 
                        key={item.id} 
                        className={`${item.level === 2 ? 'pl-6' : 'font-medium'} text-gray-700 hover:text-primary transition-colors`}
                      >
                        <a href={`#${item.id}`} className="flex items-start gap-2">
                          <span className="text-primary font-bold">
                            {item.number}.
                          </span>
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <article className="prose prose-lg prose-blue max-w-none mb-12">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: processedContent || post.content }} 
              />
            </article>

            {/* Chân trang SEO */}
            <div className="mt-12 space-y-8">
              <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-800 mb-4 uppercase">Mua hàng tại hệ thống Jogging</h3>
                <p className="text-gray-700 mb-6"> Để có chiết khấu tốt nhất thị trường, hoặc nhu cầu tư vấn sản phẩm, hoặc thông tin kỹ thuật, vui lòng liên hệ với chúng tôi theo hotline bên dưới để được tư vấn tốt nhất.</p>
                <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-black text-primary">
                  <span>&gt;&gt;&gt;</span>
                  <a href="tel:0785519888" className="hover:scale-105 transition-transform">0976.493.683</a>
                  <span>&lt;&lt;&lt;</span>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-6">
                <h3 className="bg-yellow-400 inline-block px-4 py-1 text-lg font-bold mb-4 uppercase">Tại sao nên chọn hệ thống Jogging?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-800 font-bold">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    HÀNG CHÍNH HÃNG CHẤT LƯỢNG TỐT NHẤT
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 font-bold">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    CAM KẾT GIÁ TỐT NHẤT KHU VỰC
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 font-bold">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    DỊCH VỤ BẢO HÀNH HẬU MÃI TẬN TÌNH LÂU DÀI
                  </li>
                </ul>
              </div>

              <div className="text-gray-600 italic text-sm space-y-2 border-l-4 border-gray-200 pl-4 py-2">
                <p>Bài viết: <strong>{post.title}</strong></p>
                <p>Được biên tập bởi công sức của BTV <strong>{post.author || 'ADMIN'}</strong></p>
                <p>Vui lòng liên kết tới web của chúng tôi khi tái sử dụng thông tin. Chân thành cảm ơn.</p>
              </div>
            </div>

            {/* Bài viết liên quan */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <ExternalLink className="w-6 h-6 text-primary" />
                  Nội dung liên quan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((rPost) => (
                    <Link key={rPost.id} href={`/kien-thuc/${rPost.slug}`} className="group">
                      <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                          <Image
                            src={rPost.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400'}
                            alt={rPost.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                            {rPost.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(rPost.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bình luận */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-10">
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
                  <Card key={comment.id} className="border-none bg-gray-50">
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
                      <p className="text-sm pl-10 text-gray-700">{comment.content}</p>
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
