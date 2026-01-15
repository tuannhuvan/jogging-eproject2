"use client"

/**
 * ADMIN ATHLETES PAGE - Trang quản lý vận động viên
 * 
 * Trang này cho phép admin quản lý tất cả vận động viên (người dùng) trong hệ thống
 * Bao gồm các chức năng: xem danh sách, xem chi tiết, chỉnh sửa và xóa thông tin
 * 
 * Dữ liệu được lưu trữ trong bảng 'profiles' của Supabase
 * Liên kết với bảng 'clubs' để hiển thị câu lạc bộ của vận động viên
 * 
 * Các trường chính:
 * - full_name: Họ tên đầy đủ
 * - email: Địa chỉ email
 * - phone: Số điện thoại
 * - role: Vai trò (admin/athlete)
 * - club_id: ID câu lạc bộ
 * - running_experience_years: Số năm kinh nghiệm chạy bộ
 * - dob: Ngày sinh
 * - address: Địa chỉ
 * - region: Khu vực/Tỉnh thành
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ArrowLeft, Search, User, MapPin, Phone, Mail, Calendar, Award, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
 * Component chính - Trang quản lý vận động viên
 * Hiển thị bảng danh sách vận động viên với các chức năng CRUD
 */
export default function AdminAthletesPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách vận động viên
  const [athletes, setAthletes] = useState([])
  
  // State lưu danh sách câu lạc bộ (để hiển thị tên CLB)
  const [clubs, setClubs] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State lọc theo vai trò
  const [filterRole, setFilterRole] = useState('all')

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
   * Hàm tải dữ liệu vận động viên và câu lạc bộ từ Supabase
   * Gọi song song 2 API để tối ưu thời gian tải
   */
  async function fetchData() {
    // Gọi song song API lấy profiles và clubs
    const [profilesRes, clubsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('clubs').select('id, name')
    ])
    
    // Cập nhật state với dữ liệu nhận được
    if (profilesRes.data) setAthletes(profilesRes.data)
    if (clubsRes.data) setClubs(clubsRes.data)
    
    // Hiển thị lỗi nếu có
    if (profilesRes.error) toast.error('Không thể tải danh sách vận động viên')
    
    // Tắt trạng thái loading
    setLoading(false)
  }

  /**
   * Hàm xử lý xóa vận động viên
   * Hiển thị xác nhận trước khi xóa
   * Lưu ý: Xóa profile không xóa tài khoản auth
   * @param {string} id - ID của vận động viên cần xóa (UUID)
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa vận động viên này? Thao tác này không thể hoàn tác.')) return

    // Gọi API xóa profile
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa vận động viên: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa vận động viên thành công')
      setAthletes(athletes.filter(a => a.id !== id))
    }
  }

  /**
   * Hàm xử lý URL avatar
   * Trả về URL hợp lệ hoặc ảnh mặc định
   * @param {string} url - URL avatar cần kiểm tra
   * @returns {string} URL avatar hợp lệ
   */
  function getAvatarUrl(url) {
    // Kiểm tra URL có tồn tại và là chuỗi không
    if (!url || typeof url !== 'string') {
      return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'
    }
    // Kiểm tra URL có bắt đầu bằng http, / hoặc data: không
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
      return url
    }
    // Trả về ảnh mặc định nếu URL không hợp lệ
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'
  }

  /**
   * Hàm lấy tên câu lạc bộ từ ID
   * @param {number} clubId - ID của câu lạc bộ
   * @returns {string} Tên câu lạc bộ hoặc '-' nếu không tìm thấy
   */
  function getClubName(clubId) {
    const club = clubs.find(c => c.id === clubId)
    return club?.name || '-'
  }

  // Lọc vận động viên theo từ khóa tìm kiếm và vai trò
  const filteredAthletes = athletes.filter(athlete => {
    // Kiểm tra từ khóa tìm kiếm (trong tên, email hoặc số điện thoại)
    const matchSearch = 
      athlete.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.phone?.includes(searchTerm)
    
    // Kiểm tra lọc vai trò
    const matchRole = filterRole === 'all' || athlete.role === filterRole
    
    return matchSearch && matchRole
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
              <h1 className="text-3xl font-bold">Quản lý Vận động viên</h1>
              <p className="text-muted-foreground">Quản lý thông tin người dùng trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex gap-4 mb-6">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Bộ lọc vai trò */}
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
              <SelectItem value="athlete">Vận động viên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Tổng số vận động viên */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{athletes.length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Số quản trị viên */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quản trị viên</p>
                <p className="text-2xl font-bold">{athletes.filter(a => a.role === 'admin').length}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Số vận động viên thường */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vận động viên</p>
                <p className="text-2xl font-bold">{athletes.filter(a => a.role === 'athlete').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bảng hiển thị danh sách vận động viên */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Vận động viên</th>
                    <th className="text-left p-4">Liên hệ</th>
                    <th className="text-left p-4">Câu lạc bộ</th>
                    <th className="text-left p-4">Kinh nghiệm</th>
                    <th className="text-left p-4">Vai trò</th>
                    <th className="text-left p-4">Ngày tham gia</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có vận động viên */}
                  {filteredAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Không tìm thấy vận động viên nào</p>
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách vận động viên
                    filteredAthletes.map((athlete) => (
                      <tr key={athlete.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột thông tin vận động viên (avatar + tên + khu vực) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={getAvatarUrl(athlete.avatar_url)}
                                alt={athlete.full_name || 'Avatar'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Tên và khu vực */}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[150px]">
                                {athlete.full_name || 'Chưa cập nhật'}
                              </p>
                              {athlete.region && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {athlete.region}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Cột liên hệ (email + điện thoại) */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="truncate max-w-[180px]">{athlete.email || '-'}</span>
                            </p>
                            {athlete.phone && (
                              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {athlete.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        {/* Cột câu lạc bộ */}
                        <td className="p-4">
                          <span className="text-sm">{getClubName(athlete.club_id)}</span>
                        </td>
                        {/* Cột kinh nghiệm chạy bộ */}
                        <td className="p-4">
                          {athlete.running_experience_years ? (
                            <span className="text-sm">{athlete.running_experience_years} năm</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        {/* Cột vai trò với badge màu */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            athlete.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 font-bold'  // Quản trị - màu tím
                              : 'bg-blue-100 text-blue-700'                // Vận động viên - màu xanh
                          }`}>
                            {athlete.role === 'admin' ? 'Quản trị viên' : 'Vận động viên'}
                          </span>
                        </td>
                        {/* Cột ngày tham gia */}
                        <td className="p-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {athlete.created_at 
                              ? new Date(athlete.created_at).toLocaleDateString('vi-VN')
                              : '-'
                            }
                          </div>
                        </td>
                        {/* Cột thao tác - chỉ có nút xóa */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút xóa (ẩn nếu là chính mình) */}
                            {athlete.id !== user?.id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive" 
                                onClick={() => handleDelete(athlete.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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
          Hiển thị {filteredAthletes.length} / {athletes.length} vận động viên
        </div>
      </div>
    </div>
  )
}
