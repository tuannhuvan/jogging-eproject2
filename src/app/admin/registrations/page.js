"use client"

/**
 * ADMIN REGISTRATIONS PAGE - Trang quản lý đăng ký tham gia sự kiện
 * 
 * Trang này cho phép admin quản lý tất cả các đăng ký tham gia giải chạy
 * Bao gồm các chức năng: xem danh sách, cập nhật trạng thái, xóa đăng ký
 * 
 * Dữ liệu được lưu trữ trong bảng 'registrations' của Supabase
 * Liên kết với bảng 'events' để lấy thông tin sự kiện
 * 
 * Các trường chính:
 * - event_id: ID sự kiện đăng ký
 * - user_id: ID người dùng (nếu đã đăng nhập)
 * - full_name: Họ tên người đăng ký
 * - email: Email người đăng ký
 * - distance: Cự ly đăng ký (5km, 10km, 21km, 42km)
 * - status: Trạng thái đăng ký (pending/confirmed/cancelled)
 * - payment_status: Trạng thái thanh toán
 * - amount_paid: Số tiền đã thanh toán
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2, ArrowLeft, Search, Calendar, User, Mail, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
 * Component chính - Trang quản lý đăng ký tham gia
 * Hiển thị bảng danh sách đăng ký với các chức năng quản lý
 */
export default function AdminRegistrationsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách đăng ký
  const [registrations, setRegistrations] = useState([])
  
  // State lưu danh sách sự kiện (để hiển thị tên sự kiện)
  const [events, setEvents] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State điều khiển hiển thị dialog chỉnh sửa
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State lưu đăng ký đang được chỉnh sửa
  const [editingRegistration, setEditingRegistration] = useState(null)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State lọc theo trạng thái
  const [filterStatus, setFilterStatus] = useState('all')
  
  // State lọc theo sự kiện
  const [filterEvent, setFilterEvent] = useState('all')
  
  // State dữ liệu form chỉnh sửa
  const [formData, setFormData] = useState({
    full_name: '',        // Họ tên người đăng ký
    email: '',            // Email
    distance: '',         // Cự ly đăng ký
    status: 'pending',    // Trạng thái đăng ký
    payment_status: ''    // Trạng thái thanh toán
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
   * Hàm tải dữ liệu đăng ký và sự kiện từ Supabase
   * Gọi song song 2 API để tối ưu thời gian tải
   */
  async function fetchData() {
    // Gọi song song API lấy registrations và events
    const [registrationsRes, eventsRes] = await Promise.all([
      supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('events')
        .select('id, name')
    ])
    
    // Cập nhật state với dữ liệu nhận được
    if (registrationsRes.data) setRegistrations(registrationsRes.data)
    if (eventsRes.data) setEvents(eventsRes.data)
    
    // Hiển thị lỗi nếu có
    if (registrationsRes.error) toast.error('Không thể tải danh sách đăng ký')
    
    // Tắt trạng thái loading
    setLoading(false)
  }

  /**
   * Hàm đặt lại form về trạng thái ban đầu
   */
  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      distance: '',
      status: 'pending',
      payment_status: ''
    })
    setEditingRegistration(null)
  }

  /**
   * Hàm mở dialog chỉnh sửa đăng ký
   * Điền dữ liệu đăng ký cần sửa vào form
   * @param {Object} registration - Đối tượng đăng ký cần chỉnh sửa
   */
  function openEditDialog(registration) {
    setEditingRegistration(registration)
    setFormData({
      full_name: registration.full_name || '',
      email: registration.email || '',
      distance: registration.distance || '',
      status: registration.status || 'pending',
      payment_status: registration.payment_status || ''
    })
    setIsDialogOpen(true)
  }

  /**
   * Hàm xử lý submit form chỉnh sửa đăng ký
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    // Ngăn hành vi mặc định của form
    e.preventDefault()
    
    // Chuẩn bị dữ liệu để cập nhật
    const updateData = {
      full_name: formData.full_name,
      email: formData.email,
      distance: formData.distance,
      status: formData.status,
      payment_status: formData.payment_status
    }

    // Gọi API cập nhật thông tin đăng ký
    const { error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', editingRegistration.id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu cập nhật thất bại
      toast.error('Không thể cập nhật đăng ký: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Cập nhật đăng ký thành công')
      fetchData()
      setIsDialogOpen(false)
      resetForm()
    }
  }

  /**
   * Hàm xử lý xóa đăng ký
   * Hiển thị xác nhận trước khi xóa
   * @param {number} id - ID của đăng ký cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa đăng ký này?')) return

    // Gọi API xóa đăng ký
    const { error } = await supabase.from('registrations').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa đăng ký: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa đăng ký thành công')
      setRegistrations(registrations.filter(r => r.id !== id))
    }
  }

  /**
   * Hàm cập nhật nhanh trạng thái đăng ký
   * @param {number} id - ID của đăng ký
   * @param {string} newStatus - Trạng thái mới
   */
  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) {
      toast.error('Không thể cập nhật trạng thái')
    } else {
      toast.success('Cập nhật trạng thái thành công')
      // Cập nhật state local để phản hồi nhanh
      setRegistrations(registrations.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      ))
    }
  }

  /**
   * Hàm lấy tên sự kiện từ ID
   * @param {number} eventId - ID của sự kiện
   * @returns {string} Tên sự kiện hoặc '-' nếu không tìm thấy
   */
  function getEventName(eventId) {
    const event = events.find(e => e.id === eventId)
    return event?.name || '-'
  }

  /**
   * Hàm lấy class CSS cho badge trạng thái đăng ký
   * @param {string} status - Trạng thái đăng ký
   * @returns {string} Class CSS cho badge
   */
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'confirmed':
        // Đã xác nhận - màu xanh lá
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        // Đã hủy - màu đỏ
        return 'bg-red-100 text-red-700'
      case 'pending':
      default:
        // Chờ xử lý - màu vàng
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  /**
   * Hàm lấy tên tiếng Việt của trạng thái
   * @param {string} status - Trạng thái đăng ký
   * @returns {string} Tên trạng thái bằng tiếng Việt
   */
  function getStatusName(status) {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận'
      case 'cancelled': return 'Đã hủy'
      case 'pending': 
      default: return 'Chờ xử lý'
    }
  }

  /**
   * Hàm lấy class CSS cho badge trạng thái thanh toán
   * @param {string} status - Trạng thái thanh toán
   * @returns {string} Class CSS cho badge
   */
  function getPaymentBadgeClass(status) {
    switch (status) {
      case 'paid':
        // Đã thanh toán - màu xanh lá
        return 'bg-green-100 text-green-700'
      case 'failed':
        // Thất bại - màu đỏ
        return 'bg-red-100 text-red-700'
      case 'refunded':
        // Đã hoàn tiền - màu tím
        return 'bg-purple-100 text-purple-700'
      default:
        // Chưa thanh toán - màu xám
        return 'bg-slate-100 text-slate-700'
    }
  }

  /**
   * Hàm lấy tên tiếng Việt của trạng thái thanh toán
   * @param {string} status - Trạng thái thanh toán
   * @returns {string} Tên trạng thái bằng tiếng Việt
   */
  function getPaymentStatusName(status) {
    switch (status) {
      case 'paid': return 'Đã thanh toán'
      case 'failed': return 'Thất bại'
      case 'refunded': return 'Đã hoàn tiền'
      default: return 'Chưa thanh toán'
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

  // Lọc đăng ký theo từ khóa tìm kiếm, trạng thái và sự kiện
  const filteredRegistrations = registrations.filter(reg => {
    // Kiểm tra từ khóa tìm kiếm (trong tên hoặc email)
    const matchSearch = 
      reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Kiểm tra lọc trạng thái
    const matchStatus = filterStatus === 'all' || reg.status === filterStatus
    
    // Kiểm tra lọc sự kiện
    const matchEvent = filterEvent === 'all' || reg.event_id?.toString() === filterEvent
    
    return matchSearch && matchStatus && matchEvent
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
        {/* Header với nút quay lại và tiêu đề */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Nút quay lại trang admin */}
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Quản lý Đăng ký tham gia</h1>
              <p className="text-muted-foreground">Quản lý các đăng ký tham gia giải chạy</p>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Bộ lọc trạng thái */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Bộ lọc sự kiện */}
          <Select value={filterEvent} onValueChange={setFilterEvent}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Lọc theo sự kiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sự kiện</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Tổng số đăng ký */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Đã xác nhận */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'confirmed').length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Chờ xử lý */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'pending').length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Đã hủy */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã hủy</p>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'cancelled').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bảng hiển thị danh sách đăng ký */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Người đăng ký</th>
                    <th className="text-left p-4">Sự kiện</th>
                    <th className="text-left p-4">Cự ly</th>
                    <th className="text-left p-4">Thanh toán</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Ngày đăng ký</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có đăng ký */}
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Không tìm thấy đăng ký nào</p>
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách đăng ký
                    filteredRegistrations.map((registration) => (
                      <tr key={registration.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột thông tin người đăng ký */}
                        <td className="p-4">
                          <div className="min-w-0">
                            <p className="font-medium">{registration.full_name || 'Chưa cập nhật'}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {registration.email || '-'}
                            </p>
                          </div>
                        </td>
                        {/* Cột sự kiện */}
                        <td className="p-4">
                          <p className="text-sm max-w-[200px] truncate">
                            {getEventName(registration.event_id)}
                          </p>
                        </td>
                        {/* Cột cự ly */}
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {registration.distance || '-'}
                          </span>
                        </td>
                        {/* Cột thanh toán */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentBadgeClass(registration.payment_status)}`}>
                              {getPaymentStatusName(registration.payment_status)}
                            </span>
                            {registration.amount_paid && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {formatPrice(registration.amount_paid)}
                              </p>
                            )}
                          </div>
                        </td>
                        {/* Cột trạng thái với dropdown cập nhật nhanh */}
                        <td className="p-4">
                          <Select 
                            value={registration.status} 
                            onValueChange={(value) => updateStatus(registration.id, value)}
                          >
                            <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusBadgeClass(registration.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        {/* Cột ngày đăng ký */}
                        <td className="p-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {registration.created_at 
                              ? new Date(registration.created_at).toLocaleDateString('vi-VN', {
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
                        {/* Cột thao tác */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút chỉnh sửa */}
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(registration)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDelete(registration.id)}
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
          Hiển thị {filteredRegistrations.length} / {registrations.length} đăng ký
        </div>

        {/* Dialog chỉnh sửa đăng ký */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin đăng ký</DialogTitle>
            </DialogHeader>
            
            {/* Form chỉnh sửa */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trường họ tên */}
              <div className="space-y-2">
                <Label>Họ và tên *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              {/* Trường email */}
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email"
                  required
                />
              </div>

              {/* Hàng: Cự ly và Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                {/* Trường cự ly */}
                <div className="space-y-2">
                  <Label>Cự ly</Label>
                  <Select
                    value={formData.distance}
                    onValueChange={(value) => setFormData({ ...formData, distance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cự ly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5km">5km</SelectItem>
                      <SelectItem value="10km">10km</SelectItem>
                      <SelectItem value="21km">21km (Half Marathon)</SelectItem>
                      <SelectItem value="42km">42km (Full Marathon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Trường trạng thái */}
                <div className="space-y-2">
                  <Label>Trạng thái đăng ký</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trường trạng thái thanh toán */}
              <div className="space-y-2">
                <Label>Trạng thái thanh toán</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Chưa thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                    <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nút submit form */}
              <Button type="submit" className="w-full">
                Cập nhật đăng ký
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
