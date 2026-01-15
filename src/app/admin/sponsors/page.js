"use client"

/**
 * ADMIN SPONSORS PAGE - Trang quản lý nhà tài trợ
 * 
 * Trang này cho phép admin quản lý các nhà tài trợ của các sự kiện chạy bộ
 * Bao gồm các chức năng: xem danh sách, thêm mới, sửa, xóa nhà tài trợ
 * 
 * Dữ liệu được lưu trữ trong bảng 'sponsors' của Supabase
 * Các trường chính: name, logo_url, website_url, description, tier
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, ArrowLeft, Search, ExternalLink } from 'lucide-react'
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
 * Component chính - Trang quản lý nhà tài trợ
 * Hiển thị bảng danh sách nhà tài trợ với các chức năng CRUD
 */
export default function AdminSponsorsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State lưu danh sách nhà tài trợ
  const [sponsors, setSponsors] = useState([])
  
  // State trạng thái loading
  const [loading, setLoading] = useState(true)
  
  // State điều khiển hiển thị dialog thêm/sửa
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State lưu nhà tài trợ đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingSponsor, setEditingSponsor] = useState(null)
  
  // State từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  
  // State dữ liệu form thêm/sửa nhà tài trợ
  const [formData, setFormData] = useState({
    name: '',         // Tên nhà tài trợ
    logo_url: '',     // URL logo nhà tài trợ
    website_url: '',  // Website của nhà tài trợ
    description: '',  // Mô tả về nhà tài trợ
    tier: 'bronze'    // Hạng tài trợ: gold (vàng), silver (bạc), bronze (đồng)
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
      fetchSponsors()
    }
  }, [user, profile, authLoading, router])

  /**
   * Hàm tải danh sách nhà tài trợ từ Supabase
   * Sắp xếp theo ngày tạo mới nhất
   */
  async function fetchSponsors() {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setSponsors(data)
    if (error) toast.error('Không thể tải danh sách nhà tài trợ')
    
    setLoading(false)
  }

  /**
   * Hàm đặt lại form về trạng thái ban đầu
   * Được gọi sau khi thêm/sửa thành công hoặc đóng dialog
   */
  function resetForm() {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      tier: 'bronze'
    })
    setEditingSponsor(null)
  }

  /**
   * Hàm mở dialog chỉnh sửa nhà tài trợ
   * Điền dữ liệu nhà tài trợ cần sửa vào form
   * @param {Object} sponsor - Đối tượng nhà tài trợ cần chỉnh sửa
   */
  function openEditDialog(sponsor) {
    setEditingSponsor(sponsor)
    setFormData({
      name: sponsor.name || '',
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      tier: sponsor.tier || 'bronze'
    })
    setIsDialogOpen(true)
  }

  /**
   * Hàm xử lý submit form thêm/sửa nhà tài trợ
   * Phân biệt giữa thêm mới và cập nhật dựa trên editingSponsor
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    // Ngăn hành vi mặc định của form
    e.preventDefault()
    
    // Chuẩn bị dữ liệu nhà tài trợ để gửi lên server
    const sponsorData = {
      name: formData.name,
      logo_url: formData.logo_url,
      website_url: formData.website_url,
      description: formData.description,
      tier: formData.tier
    }

    // Nếu đang chỉnh sửa nhà tài trợ
    if (editingSponsor) {
      // Gọi API cập nhật nhà tài trợ
      const { error } = await supabase
        .from('sponsors')
        .update(sponsorData)
        .eq('id', editingSponsor.id)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu cập nhật thất bại
        toast.error('Không thể cập nhật nhà tài trợ: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Cập nhật nhà tài trợ thành công')
        fetchSponsors()
        setIsDialogOpen(false)
        resetForm()
      }
    } else {
      // Nếu đang thêm mới nhà tài trợ
      const { error } = await supabase.from('sponsors').insert(sponsorData)
      
      if (error) {
        // Hiển thị thông báo lỗi nếu thêm thất bại
        toast.error('Không thể thêm nhà tài trợ: ' + error.message)
      } else {
        // Hiển thị thông báo thành công và cập nhật danh sách
        toast.success('Thêm nhà tài trợ thành công')
        fetchSponsors()
        setIsDialogOpen(false)
        resetForm()
      }
    }
  }

  /**
   * Hàm xử lý xóa nhà tài trợ
   * Hiển thị xác nhận trước khi xóa
   * @param {string} id - ID của nhà tài trợ cần xóa (UUID)
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận
    if (!confirm('Bạn có chắc muốn xóa nhà tài trợ này?')) return

    // Gọi API xóa nhà tài trợ
    const { error } = await supabase.from('sponsors').delete().eq('id', id)
    
    if (error) {
      // Hiển thị thông báo lỗi nếu xóa thất bại
      toast.error('Không thể xóa nhà tài trợ: ' + error.message)
    } else {
      // Hiển thị thông báo thành công và cập nhật danh sách
      toast.success('Xóa nhà tài trợ thành công')
      setSponsors(sponsors.filter(s => s.id !== id))
    }
  }

  /**
   * Hàm lấy style badge theo hạng tài trợ
   * Mỗi hạng có màu sắc khác nhau để dễ phân biệt
   * @param {string} tier - Hạng tài trợ (gold, silver, bronze)
   * @returns {string} Class CSS cho badge
   */
  function getTierBadgeClass(tier) {
    switch (tier) {
      case 'gold':
        // Hạng vàng - nền vàng nhạt, chữ vàng đậm
        return 'bg-yellow-100 text-yellow-700 font-bold'
      case 'silver':
        // Hạng bạc - nền xám nhạt, chữ xám đậm
        return 'bg-slate-200 text-slate-700'
      case 'bronze':
      default:
        // Hạng đồng - nền cam nhạt, chữ cam đậm
        return 'bg-orange-100 text-orange-700'
    }
  }

  /**
   * Hàm lấy tên tiếng Việt của hạng tài trợ
   * @param {string} tier - Hạng tài trợ (gold, silver, bronze)
   * @returns {string} Tên hạng bằng tiếng Việt
   */
  function getTierName(tier) {
    switch (tier) {
      case 'gold': return 'Vàng'
      case 'silver': return 'Bạc'
      case 'bronze': return 'Đồng'
      default: return tier
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
      return 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100'
    }
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
      return url
    }
    return 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100'
  }

  // Lọc nhà tài trợ theo từ khóa tìm kiếm (tìm trong tên hoặc mô tả)
  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold">Quản lý Nhà tài trợ</h1>
          </div>
          
          {/* Dialog thêm/sửa nhà tài trợ */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            {/* Nút mở dialog thêm mới */}
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm nhà tài trợ
              </Button>
            </DialogTrigger>
            
            {/* Nội dung dialog */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Tiêu đề dialog thay đổi tùy theo đang thêm hay sửa */}
                <DialogTitle>{editingSponsor ? 'Chỉnh sửa nhà tài trợ' : 'Thêm nhà tài trợ mới'}</DialogTitle>
              </DialogHeader>
              
              {/* Form nhập liệu */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trường tên nhà tài trợ */}
                <div className="space-y-2">
                  <Label>Tên nhà tài trợ *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên nhà tài trợ"
                    required
                  />
                </div>

                {/* Hàng: Hạng tài trợ và Website */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Trường chọn hạng tài trợ */}
                  <div className="space-y-2">
                    <Label>Hạng tài trợ *</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value) => setFormData({ ...formData, tier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hạng" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Các tùy chọn hạng tài trợ */}
                        <SelectItem value="gold">🥇 Vàng (Gold)</SelectItem>
                        <SelectItem value="silver">🥈 Bạc (Silver)</SelectItem>
                        <SelectItem value="bronze">🥉 Đồng (Bronze)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Trường website */}
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                </div>

                {/* Trường URL logo */}
                <div className="space-y-2">
                  <Label>URL Logo</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  {/* Hiển thị preview logo nếu có URL */}
                  {formData.logo_url && (
                    <div className="relative w-32 h-20 mt-2 rounded overflow-hidden bg-muted border">
                      <Image
                        src={getImageUrl(formData.logo_url)}
                        alt="Preview"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                </div>

                {/* Trường mô tả */}
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về nhà tài trợ..."
                    rows={3}
                  />
                </div>

                {/* Nút submit form */}
                <Button type="submit" className="w-full">
                  {editingSponsor ? 'Cập nhật' : 'Thêm nhà tài trợ'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng hiển thị danh sách nhà tài trợ */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header bảng */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Nhà tài trợ</th>
                    <th className="text-left p-4">Hạng</th>
                    <th className="text-left p-4">Website</th>
                    <th className="text-left p-4">Mô tả</th>
                    <th className="text-left p-4">Ngày tạo</th>
                    <th className="text-right p-4">Thao tác</th>
                  </tr>
                </thead>
                {/* Body bảng */}
                <tbody>
                  {/* Hiển thị thông báo nếu không có nhà tài trợ */}
                  {filteredSponsors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Không tìm thấy nhà tài trợ nào
                      </td>
                    </tr>
                  ) : (
                    // Render danh sách nhà tài trợ
                    filteredSponsors.map((sponsor) => (
                      <tr key={sponsor.id} className="border-t hover:bg-muted/30 transition-colors">
                        {/* Cột nhà tài trợ (logo + tên) */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Logo nhà tài trợ */}
                            <div className="relative w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0 border">
                              <Image
                                src={getImageUrl(sponsor.logo_url)}
                                alt={sponsor.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            {/* Tên nhà tài trợ */}
                            <span className="font-medium">{sponsor.name}</span>
                          </div>
                        </td>
                        {/* Cột hạng tài trợ với badge màu */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs uppercase ${getTierBadgeClass(sponsor.tier)}`}>
                            {getTierName(sponsor.tier)}
                          </span>
                        </td>
                        {/* Cột website với link */}
                        <td className="p-4">
                          {sponsor.website_url ? (
                            <a 
                              href={sponsor.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Truy cập
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        {/* Cột mô tả (cắt ngắn nếu quá dài) */}
                        <td className="p-4">
                          <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {sponsor.description || '-'}
                          </p>
                        </td>
                        {/* Cột ngày tạo */}
                        <td className="p-4 text-sm text-muted-foreground">
                          {sponsor.created_at 
                            ? new Date(sponsor.created_at).toLocaleDateString('vi-VN')
                            : '-'
                          }
                        </td>
                        {/* Cột thao tác */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút chỉnh sửa */}
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(sponsor)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDelete(sponsor.id)}
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

        {/* Hiển thị tổng số nhà tài trợ */}
        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số: {filteredSponsors.length} nhà tài trợ
        </div>
      </div>
    </div>
  )
}
