"use client"

/**
 * ADMIN POSTS PAGE - Trang quản lý bài viết
 * 
 * Trang này cho phép admin quản lý tất cả bài viết trên hệ thống
 * Bao gồm các chức năng: xem danh sách, thêm mới, sửa, xóa bài viết
 * 
 * Dữ liệu được lưu trữ trong bảng 'posts' của Supabase
 * Liên kết với bảng 'categories' để phân loại bài viết
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft, Search, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/**
 * Component chính - Trang quản lý bài viết
 * Hiển thị bảng danh sách bài viết với các chức năng CRUD
 */
export default function AdminPostsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách bài viết
  const [posts, setPosts] = useState([])
  
  // State lưu danh sách danh mục bài viết
  const [categories, setCategories] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State điều khiển hiển thị dialog thêm/sửa
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State lưu bài viết đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingPost, setEditingPost] = useState(null)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State dữ liệu form thêm/sửa bài viết
  const [formData, setFormData] = useState({
    title: '',      // Tiêu đề bài viết
    slug: '',       // Đường dẫn URL thân thiện
    content: '',    // Nội dung chi tiết
    excerpt: '',    // Tóm tắt bài viết
    image_url: '',  // URL hình ảnh đại diện
    category_id: '', // ID danh mục
    author: '',     // Tên tác giả
    is_featured: false // Đánh dấu bài viết nổi bật
  })

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
   * Hàm tải dữ liệu bài viết và danh mục từ Supabase
   * Gọi song song 2 API để tối ưu thời gian tải
   */
  async function fetchData() {
    // Gọi song song API lấy bài viết và danh mục
    const [postsRes, categoriesRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('type', 'post')
    ])
    
    // Cập nhật state với dữ liệu nhận được
    if (postsRes.data) setPosts(postsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    
    // Tắt trạng thái loading
    setLoading(false)
  }

  /**
   * Hàm tạo slug từ tiêu đề bài viết
   * Chuyển đổi tiêu đề tiếng Việt thành URL thân thiện
   * Ví dụ: "Bài viết hay" -> "bai-viet-hay"
   * @param {string} title - Tiêu đề bài viết
   * @returns {string} Slug đã được chuẩn hóa
   */
  function generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')                    // Chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, '')     // Loại bỏ dấu
      .replace(/đ/g, 'd')                  // Chuyển đ thành d
      .replace(/[^a-z0-9]+/g, '-')         // Thay ký tự đặc biệt bằng dấu gạch ngang
      .replace(/(^-|-$)/g, '')             // Loại bỏ dấu gạch ngang ở đầu và cuối
  }

  /**
   * Hàm đặt lại form về trạng thái ban đầu
   * Được gọi sau khi thêm/sửa thành công hoặc đóng dialog
   */
  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image_url: '',
      category_id: '',
      author: '',
      is_featured: false
    })
    setEditingPost(null)
  }

  /**
   * Hàm mở dialog chỉnh sửa bài viết
   * Điền dữ liệu bài viết cần sửa vào form
   * @param {Object} post - Đối tượng bài viết cần chỉnh sửa
   */
  function openEditDialog(post) {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      category_id: post.category_id?.toString() || '',
      author: post.author || '',
      is_featured: post.is_featured || false
    })
    setIsDialogOpen(true)
  }

  /**
   * Hàm xử lý submit form thêm/sửa bài viết
   * Phân biệt giữa thêm mới và cập nhật dựa trên editingPost
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    // Ngăn hành vi mặc định của form
    e.preventDefault()
    
    // Chuẩn bị dữ liệu bài viết để gửi lên server
    const postData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title), // Tự động tạo slug nếu không nhập
      content: formData.content,
      excerpt: formData.excerpt,
      image_url: formData.image_url,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      author: formData.author,
      is_featured: formData.is_featured
    }

    // Nếu đang chỉnh sửa bài viết
    if (editingPost) {
      // Gọi API cập nhật bài viết
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', editingPost.id)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu cập nhật thất bại
        toast.error('Không thể cập nhật bài viết: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Cập nhật bài viết thành công')
        fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Nếu đang thêm mới bài viết
      const { error } = await supabase.from('posts').insert(postData)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu thêm thất bại
        toast.error('Không thể thêm bài viết: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Thêm bài viết thành công')
        fetchData()
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  /**
   * Hàm xử lý xóa bài viết
   * Hiển thị xác nhận trước khi xóa
   * @param {number} id - ID của bài viết cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return

    // Gọi API xóa bài viết
    const { error } = await supabase.from('posts').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa bài viết: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa bài viết thành công')
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  /**
   * Hàm xử lý URL hình ảnh
   * Trả về URL hợp lệ hoặc ảnh mặc định nếu URL không hợp lệ
   * @param {string} url - URL hình ảnh cần kiểm tra
   * @returns {string} URL hình ảnh hợp lệ
   */
  function getImageUrl(url) {
    // Kiểm tra URL có tồn tại và là chuỗi không
    if (!url || typeof url !== 'string') return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100'
    
    // Kiểm tra URL có bắt đầu bằng http, / hoặc data: không
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
      return url
    }
    
    // Trả về ảnh mặc định nếu URL không hợp lệ
    return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100'
  }

  // Lọc bài viết theo từ khóa tìm kiếm (tìm trong tiêu đề hoặc tác giả)
  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header với nút quay lại, tiêu đề và nút thêm mới */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Nút quay lại trang admin */}
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Quản lý Bài viết</h1>
          </div>
          
          {/* Dialog thêm/sửa bài viết */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            {/* Nút mở dialog thêm mới */}
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm bài viết
              </Button>
            </DialogTrigger>
            
            {/* Nội dung dialog */}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Tiêu đề dialog thay đổi tùy theo đang thêm hay sửa */}
                <DialogTitle>{editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</DialogTitle>
              </DialogHeader>
              
              {/* Form nhập liệu */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hàng 1: Tiêu đề và Slug */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Trường tiêu đề bài viết */}
                  <div className="space-y-2">
                    <Label>Tiêu đề bài viết *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                      placeholder="Nhập tiêu đề bài viết"
                      required
                    />
                  </div>
                  {/* Trường slug (tự động tạo từ tiêu đề) */}
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="tu-dong-tao-tu-tieu-de"
                    />
                  </div>
                </div>
                
                {/* Trường tóm tắt bài viết */}
                <div className="space-y-2">
                  <Label>Tóm tắt</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Mô tả ngắn gọn về bài viết..."
                    rows={2}
                  />
                </div>

                {/* Trường nội dung chi tiết */}
                <div className="space-y-2">
                  <Label>Nội dung bài viết *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Nhập nội dung chi tiết của bài viết..."
                    rows={8}
                    required
                  />
                </div>

                {/* Hàng 2: Tác giả và Danh mục */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Trường tác giả */}
                  <div className="space-y-2">
                    <Label>Tác giả</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Tên tác giả"
                    />
                  </div>
                  {/* Trường chọn danh mục */}
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trường URL hình ảnh */}
                <div className="space-y-2">
                  <Label>URL hình ảnh</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {/* Hiển thị preview hình ảnh nếu có URL */}
                  {formData.image_url && (
                    <div className="relative w-full h-40 mt-2 rounded overflow-hidden bg-muted">
                      <Image
                        src={getImageUrl(formData.image_url)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Checkbox đánh dấu bài viết nổi bật */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_featured" className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Bài viết nổi bật
                  </Label>
                </div>

                {/* Nút submit form */}
                <Button type="submit" className="w-full">
                  {editingPost ? 'Cập nhật bài viết' : 'Thêm bài viết'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng hiển thị danh sách bài viết */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Bài viết</th>
                    <th className="text-left p-4">Tác giả</th>
                    <th className="text-left p-4">Danh mục</th>
                    <th className="text-left p-4">Nổi bật</th>
                    <th className="text-left p-4">Ngày tạo</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có bài viết */}
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Không tìm thấy bài viết nào
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách bài viết
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột bài viết (hình ảnh + tiêu đề + slug) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Hình ảnh thumbnail */}
                            <div className="relative w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={getImageUrl(post.image_url)}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Tiêu đề và slug */}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[300px]">{post.title}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                /{post.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Cột tác giả */}
                        <td className="p-4">{post.author || '-'}</td>
                        {/* Cột danh mục (tìm tên từ ID) */}
                        <td className="p-4">
                          {categories.find(c => c.id === post.category_id)?.name || '-'}
                        </td>
                        {/* Cột trạng thái nổi bật (hiển thị icon sao) */}
                        <td className="p-4">
                          {post.is_featured ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className="w-5 h-5 text-muted-foreground" />
                          )}
                        </td>
                        {/* Cột ngày tạo (định dạng theo locale Việt Nam) */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        {/* Cột thao tác (nút sửa và xóa) */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút chỉnh sửa */}
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hiển thị tổng số bài viết */}
        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số: {filteredPosts.length} bài viết
        </div>
      </div>
    </div>
  )
}
