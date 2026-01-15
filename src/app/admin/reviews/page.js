"use client"

/**
 * ADMIN REVIEWS PAGE - Trang quản lý đánh giá sản phẩm
 * 
 * Trang này cho phép admin quản lý tất cả đánh giá từ khách hàng
 * Bao gồm các chức năng: xem danh sách, tìm kiếm, xóa đánh giá
 * 
 * Dữ liệu được lưu trữ trong bảng 'reviews' của Supabase
 * Liên kết với bảng 'products' để hiển thị tên sản phẩm
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Trash2, Star, MessageSquare, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/**
 * Component chính - Trang quản lý đánh giá
 * Hiển thị bảng danh sách đánh giá với các chức năng quản lý
 */
export default function AdminReviewsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách đánh giá
  const [reviews, setReviews] = useState([])
  
  // State lưu danh sách sản phẩm (để hiển thị tên sản phẩm)
  const [products, setProducts] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * Effect kiểm tra quyền truy cập và tải dữ liệu ban đầu
   * Chỉ admin mới có thể truy cập trang này
   */
  useEffect(() => {
    // Kiểm tra nếu không phải admin thì chuyển hướng về trang chủ
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    // Nếu là admin thì tải dữ liệu
    if (user && profile?.role === 'admin') {
      fetchData()
    }
  }, [user, profile, authLoading, router])

  /**
   * Hàm tải dữ liệu đánh giá và sản phẩm từ Supabase
   * Gọi song song 2 API để tối ưu thời gian tải
   */
  async function fetchData() {
    // Gọi song song API lấy đánh giá và sản phẩm
    const [reviewsRes, productsRes] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name')
    ])
    
    // Cập nhật state với dữ liệu nhận được
    if (reviewsRes.data) setReviews(reviewsRes.data)
    if (productsRes.data) setProducts(productsRes.data)
    
    // Tắt trạng thái loading
    setLoading(false)
  }

  /**
   * Hàm xử lý xóa đánh giá
   * Hiển thị xác nhận trước khi xóa
   * @param {number} id - ID của đánh giá cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return

    // Gọi API xóa đánh giá
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa đánh giá: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa đánh giá thành công')
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  /**
   * Hàm lấy tên sản phẩm từ ID
   * @param {number} productId - ID sản phẩm
   * @returns {string} Tên sản phẩm hoặc 'Không xác định'
   */
  function getProductName(productId) {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Không xác định'
  }

  /**
   * Hàm render số sao đánh giá
   * @param {number} rating - Số sao (1-5)
   * @returns {JSX.Element} Component hiển thị sao
   */
  function renderStars(rating) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Lọc đánh giá theo từ khóa tìm kiếm (tìm trong comment hoặc user_name)
  const filteredReviews = reviews.filter(review =>
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductName(review.product_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (authLoading || loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header với nút quay lại và tiêu đề */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Nút quay lại trang admin */}
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Quản lý Đánh giá</h1>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo nội dung, người đánh giá hoặc sản phẩm..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng hiển thị danh sách đánh giá */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Sản phẩm</th>
                    <th className="text-left p-4">Người đánh giá</th>
                    <th className="text-left p-4">Số sao</th>
                    <th className="text-left p-4">Nội dung</th>
                    <th className="text-left p-4">Ngày gửi</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có đánh giá */}
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có đánh giá nào</p>
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách đánh giá
                    filteredReviews.map((review) => (
                      <tr key={review.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột tên sản phẩm */}
                        <td className="p-4">
                          <span className="font-medium text-primary">
                            {getProductName(review.product_id)}
                          </span>
                        </td>
                        {/* Cột người đánh giá */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{review.user_name}</span>
                          </div>
                        </td>
                        {/* Cột số sao */}
                        <td className="p-4">
                          {renderStars(review.rating)}
                        </td>
                        {/* Cột nội dung đánh giá */}
                        <td className="p-4">
                          <p className="max-w-[300px] truncate text-muted-foreground">
                            {review.comment || <em className="opacity-50">Không có nội dung</em>}
                          </p>
                        </td>
                        {/* Cột ngày gửi */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {review.created_at 
                            ? new Date(review.created_at).toLocaleDateString('vi-VN')
                            : '-'
                          }
                        </td>
                        {/* Cột thao tác */}
                        <td className="p-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive" 
                            onClick={() => handleDelete(review.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hiển thị tổng số đánh giá */}
        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số: {filteredReviews.length} đánh giá
        </div>
      </div>
    </div>
  )
}
