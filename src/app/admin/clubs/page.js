"use client"

/**
 * ADMIN CLUBS PAGE - Trang quản lý câu lạc bộ
 * 
 * Trang này cho phép admin quản lý các câu lạc bộ chạy bộ
 * Bao gồm các chức năng: xem danh sách, thêm mới, sửa, xóa câu lạc bộ
 * 
 * Dữ liệu được lưu trữ trong bảng 'clubs' của Supabase
 * Các trường chính: name, description, location, status, image_url, founding_date
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft, Search, Users, MapPin, Calendar } from 'lucide-react'
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
 * Component chính - Trang quản lý câu lạc bộ
 * Hiển thị bảng danh sách câu lạc bộ với các chức năng CRUD
 */
export default function AdminClubsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách câu lạc bộ
  const [clubs, setClubs] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State điều khiển hiển thị dialog thêm/sửa
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State lưu câu lạc bộ đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingClub, setEditingClub] = useState(null)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State dữ liệu form thêm/sửa câu lạc bộ
  const [formData, setFormData] = useState({
    name: '',           // Tên câu lạc bộ
    description: '',    // Mô tả về câu lạc bộ
    location: '',       // Khu vực hoạt động
    status: 'active',   // Trạng thái: active (hoạt động), inactive (tạm dừng)
    image_url: '',      // URL hình ảnh đại diện
    founding_date: ''   // Ngày thành lập
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
      fetchClubs()
    }
  }, [user, profile, authLoading, router])

  /**
   * Hàm tải danh sách câu lạc bộ từ Supabase
   * Sắp xếp theo ngày tạo mới nhất
   */
  async function fetchClubs() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setClubs(data)
    if (error) toast.error('Không thể tải danh sách câu lạc bộ')
    
    setLoading(false)
  }

  /**
   * Hàm đặt lại form về trạng thái ban đầu
   * Được gọi sau khi thêm/sửa thành công hoặc đóng dialog
   */
  function resetForm() {
    setFormData({
      name: '',
      description: '',
      location: '',
      status: 'active',
      image_url: '',
      founding_date: ''
    })
    setEditingClub(null)
  }

  /**
   * Hàm mở dialog chỉnh sửa câu lạc bộ
   * Điền dữ liệu câu lạc bộ cần sửa vào form
   * @param {Object} club - Đối tượng câu lạc bộ cần chỉnh sửa
   */
  function openEditDialog(club) {
    setEditingClub(club)
    setFormData({
      name: club.name || '',
      description: club.description || '',
      location: club.location || '',
      status: club.status || 'active',
      image_url: club.image_url || '',
      founding_date: club.founding_date || ''
    })
    setIsDialogOpen(true)
  }

  /**
   * Hàm xử lý submit form thêm/sửa câu lạc bộ
   * Phân biệt giữa thêm mới và cập nhật dựa trên editingClub
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    // Ngăn hành vi mặc định của form
    e.preventDefault()
    
    // Chuẩn bị dữ liệu câu lạc bộ để gửi lên server
    const clubData = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      status: formData.status,
      image_url: formData.image_url,
      founding_date: formData.founding_date || null
    }

    // Nếu đang chỉnh sửa câu lạc bộ
    if (editingClub) {
      // Gọi API cập nhật câu lạc bộ
      const { error } = await supabase
        .from('clubs')
        .update(clubData)
        .eq('id', editingClub.id)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu cập nhật thất bại
        toast.error('Không thể cập nhật câu lạc bộ: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Cập nhật câu lạc bộ thành công')
        fetchClubs()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Nếu đang thêm mới câu lạc bộ
      const { error } = await supabase.from('clubs').insert(clubData)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu thêm thất bại
        toast.error('Không thể thêm câu lạc bộ: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Thêm câu lạc bộ thành công')
        fetchClubs()
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  /**
   * Hàm xử lý xóa câu lạc bộ
   * Hiển thị xác nhận trước khi xóa
   * @param {number} id - ID của câu lạc bộ cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa câu lạc bộ này?')) return

    // Gọi API xóa câu lạc bộ
    const { error } = await supabase.from('clubs').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa câu lạc bộ: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa câu lạc bộ thành công')
      setClubs(clubs.filter(c => c.id !== id))
    }
  }

  /**
   * Hàm xử lý URL hình ảnh
   * Trả về URL hợp lệ hoặc ảnh mặc định
   * @param {string} url - URL hình ảnh cần kiểm tra
   * @returns {string} URL hình ảnh hợp lệ
   */
  function getImageUrl(url) {
    // Kiểm tra URL có tồn tại và là chuỗi không
    if (!url || typeof url !== 'string') {
      return 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=100'
    }
    // Kiểm tra URL có bắt đầu bằng http, / hoặc data: không
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
      return url
    }
    // Trả về ảnh mặc định nếu URL không hợp lệ
    return 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=100'
  }

  // Lọc câu lạc bộ theo từ khóa tìm kiếm (tìm trong tên hoặc khu vực)
  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold">Quản lý Câu lạc bộ</h1>
          </div>
          
          {/* Dialog thêm/sửa câu lạc bộ */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            {/* Nút mở dialog thêm mới */}
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm câu lạc bộ
              </Button>
            </DialogTrigger>
            
            {/* Nội dung dialog */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Tiêu đề dialog thay đổi tùy theo đang thêm hay sửa */}
                <DialogTitle>{editingClub ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ mới'}</DialogTitle>
              </DialogHeader>
              
              {/* Form nhập liệu */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trường tên câu lạc bộ */}
                <div className="space-y-2">
                  <Label>Tên câu lạc bộ *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên câu lạc bộ"
                    required
                  />
                </div>

                {/* Hàng: Khu vực và Trạng thái */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Trường khu vực hoạt động */}
                  <div className="space-y-2">
                    <Label>Khu vực hoạt động</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="VD: Hà Nội, TP.HCM..."
                    />
                  </div>
                  
                  {/* Trường chọn trạng thái */}
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Các tùy chọn trạng thái */}
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trường ngày thành lập */}
                <div className="space-y-2">
                  <Label>Ngày thành lập</Label>
                  <Input
                    type="date"
                    value={formData.founding_date}
                    onChange={(e) => setFormData({ ...formData, founding_date: e.target.value })}
                  />
                </div>

                {/* Trường mô tả */}
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về câu lạc bộ, hoạt động, mục tiêu..."
                    rows={4}
                  />
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

                {/* Nút submit form */}
                <Button type="submit" className="w-full">
                  {editingClub ? 'Cập nhật' : 'Thêm câu lạc bộ'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc khu vực..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng hiển thị danh sách câu lạc bộ */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Câu lạc bộ</th>
                    <th className="text-left p-4">Khu vực</th>
                    <th className="text-left p-4">Ngày thành lập</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Ngày tạo</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có câu lạc bộ */}
                  {filteredClubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Không tìm thấy câu lạc bộ nào</p>
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách câu lạc bộ
                    filteredClubs.map((club) => (
                      <tr key={club.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột câu lạc bộ (hình ảnh + tên + mô tả) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Hình ảnh câu lạc bộ */}
                            <div className="relative w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={getImageUrl(club.image_url)}
                                alt={club.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Tên và mô tả ngắn */}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">{club.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {club.description || 'Chưa có mô tả'}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Cột khu vực với icon */}
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{club.location || '-'}</span>
                          </div>
                        </td>
                        {/* Cột ngày thành lập */}
                        <td className="p-4">
                          {club.founding_date ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(club.founding_date).toLocaleDateString('vi-VN')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        {/* Cột trạng thái với badge màu */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            club.status === 'active' 
                              ? 'bg-green-100 text-green-700'   // Hoạt động - màu xanh
                              : 'bg-slate-100 text-slate-700'  // Tạm dừng - màu xám
                          }`}>
                            {club.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        {/* Cột ngày tạo */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {club.created_at 
                            ? new Date(club.created_at).toLocaleDateString('vi-VN')
                            : '-'
                          }
                        </td>
                        {/* Cột thao tác */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút chỉnh sửa */}
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(club)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDelete(club.id)}
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

        {/* Hiển thị tổng số câu lạc bộ */}
        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số: {filteredClubs.length} câu lạc bộ
        </div>
      </div>
    </div>
  )
}
