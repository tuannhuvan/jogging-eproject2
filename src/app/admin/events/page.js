"use client"

/**
 * ADMIN EVENTS PAGE - Trang quản lý sự kiện và giải chạy
 * 
 * Trang này cho phép admin quản lý tất cả các sự kiện chạy bộ trong hệ thống
 * Bao gồm các chức năng: xem danh sách, thêm mới, sửa, xóa sự kiện
 * 
 * Dữ liệu được lưu trữ trong bảng 'events' của Supabase
 * Các trường chính:
 * - name: Tên giải chạy
 * - description: Mô tả chi tiết
 * - date: Ngày diễn ra
 * - location: Địa điểm tổ chức
 * - status: Trạng thái (draft/published/completed/cancelled)
 * - image_url: Hình ảnh sự kiện
 * - price_5km, price_10km, price_21km, price_42km: Giá vé theo cự ly
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft, Search, Calendar, MapPin, Users, Eye } from 'lucide-react'
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
 * Component chính - Trang quản lý sự kiện và giải chạy
 * Hiển thị bảng danh sách sự kiện với các chức năng CRUD
 */
export default function AdminEventsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách sự kiện
  const [events, setEvents] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State điều khiển hiển thị dialog thêm/sửa
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State lưu sự kiện đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingEvent, setEditingEvent] = useState(null)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State lọc theo trạng thái
  const [filterStatus, setFilterStatus] = useState('all')
  
  // State dữ liệu form thêm/sửa sự kiện
  const [formData, setFormData] = useState({
    name: '',           // Tên giải chạy
    description: '',    // Mô tả chi tiết
    date: '',           // Ngày diễn ra
    location: '',       // Địa điểm tổ chức
    status: 'draft',    // Trạng thái: draft (nháp), published (công bố), completed (hoàn thành), cancelled (hủy)
    image_url: '',      // URL hình ảnh
    price_5km: '',      // Giá vé cự ly 5km
    price_10km: '',     // Giá vé cự ly 10km
    price_21km: '',     // Giá vé cự ly 21km (half marathon)
    price_42km: ''      // Giá vé cự ly 42km (full marathon)
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
      fetchEvents()
    }
  }, [user, profile, authLoading, router])

  /**
   * Hàm tải danh sách sự kiện từ Supabase
   * Sắp xếp theo ngày diễn ra (sự kiện gần nhất lên đầu)
   */
  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    
    if (data) setEvents(data)
    if (error) toast.error('Không thể tải danh sách sự kiện')
    
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
      date: '',
      location: '',
      status: 'draft',
      image_url: '',
      price_5km: '',
      price_10km: '',
      price_21km: '',
      price_42km: ''
    })
    setEditingEvent(null)
  }

  /**
   * Hàm mở dialog chỉnh sửa sự kiện
   * Điền dữ liệu sự kiện cần sửa vào form
   * @param {Object} event - Đối tượng sự kiện cần chỉnh sửa
   */
  function openEditDialog(event) {
    setEditingEvent(event)
    // Chuyển đổi ngày từ ISO sang format phù hợp với input datetime-local
    const dateValue = event.date ? new Date(event.date).toISOString().slice(0, 16) : ''
    setFormData({
      name: event.name || '',
      description: event.description || '',
      date: dateValue,
      location: event.location || '',
      status: event.status || 'draft',
      image_url: event.image_url || '',
      price_5km: event.price_5km?.toString() || '',
      price_10km: event.price_10km?.toString() || '',
      price_21km: event.price_21km?.toString() || '',
      price_42km: event.price_42km?.toString() || ''
    })
    setIsDialogOpen(true)
  }

  /**
   * Hàm xử lý submit form thêm/sửa sự kiện
   * Phân biệt giữa thêm mới và cập nhật dựa trên editingEvent
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    // Ngăn hành vi mặc định của form
    e.preventDefault()
    
    // Chuẩn bị dữ liệu sự kiện để gửi lên server
    const eventData = {
      name: formData.name,
      description: formData.description,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      location: formData.location,
      status: formData.status,
      image_url: formData.image_url,
      price_5km: formData.price_5km ? parseInt(formData.price_5km) : null,
      price_10km: formData.price_10km ? parseInt(formData.price_10km) : null,
      price_21km: formData.price_21km ? parseInt(formData.price_21km) : null,
      price_42km: formData.price_42km ? parseInt(formData.price_42km) : null
    }

    // Nếu đang chỉnh sửa sự kiện
    if (editingEvent) {
      // Gọi API cập nhật sự kiện
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu cập nhật thất bại
        toast.error('Không thể cập nhật sự kiện: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Cập nhật sự kiện thành công')
        fetchEvents()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Nếu đang thêm mới sự kiện
      const { error } = await supabase.from('events').insert(eventData)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu thêm thất bại
        toast.error('Không thể thêm sự kiện: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Thêm sự kiện thành công')
        fetchEvents()
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  /**
   * Hàm xử lý xóa sự kiện
   * Hiển thị xác nhận trước khi xóa
   * @param {number} id - ID của sự kiện cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa sự kiện này? Tất cả đăng ký liên quan cũng sẽ bị xóa.')) return

    // Gọi API xóa sự kiện
    const { error } = await supabase.from('events').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa sự kiện: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa sự kiện thành công')
      setEvents(events.filter(e => e.id !== id))
    }
  }

  /**
   * Hàm xử lý URL hình ảnh
   * Trả về URL hợp lệ hoặc ảnh mặc định
   * @param {string} url - URL hình ảnh cần kiểm tra
   * @returns {string} URL hình ảnh hợp lệ
   */
  function getImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400'
    }
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
      return url
    }
    return 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400'
  }

  /**
   * Hàm lấy class CSS cho badge trạng thái
   * @param {string} status - Trạng thái sự kiện
   * @returns {string} Class CSS cho badge
   */
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'published':
        // Đã công bố - màu xanh lá
        return 'bg-green-100 text-green-700'
      case 'completed':
        // Đã hoàn thành - màu xanh dương
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        // Đã hủy - màu đỏ
        return 'bg-red-100 text-red-700'
      case 'draft':
      default:
        // Bản nháp - màu vàng
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  /**
   * Hàm lấy tên tiếng Việt của trạng thái
   * @param {string} status - Trạng thái sự kiện
   * @returns {string} Tên trạng thái bằng tiếng Việt
   */
  function getStatusName(status) {
    switch (status) {
      case 'published': return 'Đang mở đăng ký'
      case 'completed': return 'Đã kết thúc'
      case 'cancelled': return 'Đã hủy'
      case 'draft': 
      default: return 'Bản nháp'
    }
  }

  /**
   * Hàm format số tiền theo định dạng VNĐ
   * @param {number} amount - Số tiền cần format
   * @returns {string} Chuỗi số tiền đã format
   */
  function formatPrice(amount) {
    if (!amount) return '-'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Lọc sự kiện theo từ khóa tìm kiếm và trạng thái
  const filteredEvents = events.filter(event => {
    // Kiểm tra từ khóa tìm kiếm (trong tên hoặc địa điểm)
    const matchSearch = 
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Kiểm tra lọc trạng thái
    const matchStatus = filterStatus === 'all' || event.status === filterStatus
    
    return matchSearch && matchStatus
  })

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
            <div>
              <h1 className="text-3xl font-bold">Quản lý Sự kiện & Giải chạy</h1>
              <p className="text-muted-foreground">Quản lý các giải chạy và sự kiện thể thao</p>
            </div>
          </div>
          
          {/* Dialog thêm/sửa sự kiện */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            {/* Nút mở dialog thêm mới */}
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm sự kiện
              </Button>
            </DialogTrigger>
            
            {/* Nội dung dialog */}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Tiêu đề dialog thay đổi tùy theo đang thêm hay sửa */}
                <DialogTitle>{editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}</DialogTitle>
              </DialogHeader>
              
              {/* Form nhập liệu */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trường tên sự kiện */}
                <div className="space-y-2">
                  <Label>Tên giải chạy *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: VnExpress Marathon Hanoi 2024"
                    required
                  />
                </div>

                {/* Hàng: Ngày giờ và Địa điểm */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Trường ngày giờ */}
                  <div className="space-y-2">
                    <Label>Ngày giờ diễn ra *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  {/* Trường địa điểm */}
                  <div className="space-y-2">
                    <Label>Địa điểm *</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="VD: Hà Nội, TP.HCM..."
                      required
                    />
                  </div>
                </div>

                {/* Trường trạng thái */}
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
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Đang mở đăng ký</SelectItem>
                      <SelectItem value="completed">Đã kết thúc</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trường mô tả */}
                <div className="space-y-2">
                  <Label>Mô tả chi tiết</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về giải chạy, quy định, phần thưởng..."
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
                    <div className="relative w-full h-48 mt-2 rounded overflow-hidden bg-muted">
                      <Image
                        src={getImageUrl(formData.image_url)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Phần giá vé theo cự ly */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Giá vé theo cự ly (VNĐ)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Giá vé 5km */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Cự ly 5km</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price_5km}
                        onChange={(e) => setFormData({ ...formData, price_5km: e.target.value })}
                        placeholder="VD: 300000"
                      />
                    </div>
                    {/* Giá vé 10km */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Cự ly 10km</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price_10km}
                        onChange={(e) => setFormData({ ...formData, price_10km: e.target.value })}
                        placeholder="VD: 500000"
                      />
                    </div>
                    {/* Giá vé 21km (Half Marathon) */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Cự ly 21km (Half)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price_21km}
                        onChange={(e) => setFormData({ ...formData, price_21km: e.target.value })}
                        placeholder="VD: 800000"
                      />
                    </div>
                    {/* Giá vé 42km (Full Marathon) */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Cự ly 42km (Full)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price_42km}
                        onChange={(e) => setFormData({ ...formData, price_42km: e.target.value })}
                        placeholder="VD: 1200000"
                      />
                    </div>
                  </div>
                </div>

                {/* Nút submit form */}
                <Button type="submit" className="w-full">
                  {editingEvent ? 'Cập nhật sự kiện' : 'Thêm sự kiện'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex gap-4 mb-6">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc địa điểm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Bộ lọc trạng thái */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Đang mở đăng ký</SelectItem>
              <SelectItem value="completed">Đã kết thúc</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Tổng số sự kiện */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Sự kiện đang mở */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang mở</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'published').length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Sự kiện đã kết thúc */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Eye className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã kết thúc</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'completed').length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Bản nháp */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bản nháp</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'draft').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bảng hiển thị danh sách sự kiện */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Sự kiện</th>
                    <th className="text-left p-4">Ngày diễn ra</th>
                    <th className="text-left p-4">Địa điểm</th>
                    <th className="text-left p-4">Giá vé</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có sự kiện */}
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Không tìm thấy sự kiện nào</p>
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách sự kiện
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột sự kiện (hình ảnh + tên + mô tả) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Hình ảnh sự kiện */}
                            <div className="relative w-20 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={getImageUrl(event.image_url)}
                                alt={event.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Tên và mô tả ngắn */}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[250px]">{event.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {event.description || 'Chưa có mô tả'}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Cột ngày diễn ra */}
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {event.date 
                              ? new Date(event.date).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'
                            }
                          </div>
                        </td>
                        {/* Cột địa điểm */}
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {event.location || '-'}
                          </div>
                        </td>
                        {/* Cột giá vé (hiển thị giá thấp nhất - cao nhất) */}
                        <td className="p-4">
                          <div className="text-sm">
                            {/* Tìm giá thấp nhất và cao nhất */}
                            {(() => {
                              const prices = [
                                event.price_5km,
                                event.price_10km,
                                event.price_21km,
                                event.price_42km
                              ].filter(p => p)
                              
                              if (prices.length === 0) return '-'
                              
                              const min = Math.min(...prices)
                              const max = Math.max(...prices)
                              
                              if (min === max) return formatPrice(min)
                              return `${formatPrice(min)} - ${formatPrice(max)}`
                            })()}
                          </div>
                        </td>
                        {/* Cột trạng thái với badge màu */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(event.status)}`}>
                            {getStatusName(event.status)}
                          </span>
                        </td>
                        {/* Cột thao tác */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút xem chi tiết */}
                            <Link href={`/events/${event.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* Nút chỉnh sửa */}
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDelete(event.id)}
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

        {/* Hiển thị số lượng kết quả */}
        <div className="mt-4 text-sm text-muted-foreground">
          Hiển thị {filteredEvents.length} / {events.length} sự kiện
        </div>
      </div>
    </div>
  )
}
