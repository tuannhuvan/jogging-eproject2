"use client"

// =============================================================================
// TRANG HỒ SƠ CÁ NHÂN - PROFILE PAGE
// Chức năng CRUD đầy đủ cho người dùng:
// - Create: Tải lên ảnh đại diện (avatar)
// - Read: Hiển thị thông tin cá nhân từ database
// - Update: Cập nhật thông tin cá nhân và đổi mật khẩu
// - Delete: Xóa tài khoản vĩnh viễn
// =============================================================================

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Camera, 
  Save, 
  Trash2, 
  ArrowLeft,
  Mail,
  Calendar,
  Loader2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  // =============================================================================
  // HOOKS VÀ STATE MANAGEMENT
  // =============================================================================
  
  // Lấy thông tin user và profile từ Auth Context
  const { user, profile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  
  // Ref cho input file upload avatar
  const fileInputRef = useRef(null)
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true)           // Loading ban đầu
  const [saving, setSaving] = useState(false)            // Đang lưu thông tin
  const [uploadingAvatar, setUploadingAvatar] = useState(false)  // Đang upload ảnh
  const [deletingAccount, setDeletingAccount] = useState(false)  // Đang xóa tài khoản
  const [changingPassword, setChangingPassword] = useState(false) // Đang đổi mật khẩu
  
  // State hiển thị/ẩn mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // State form thông tin cá nhân
  // Các trường này mapping trực tiếp với bảng profiles trong database
  const [formData, setFormData] = useState({
    full_name: '',                    // Họ và tên
    phone: '',                        // Số điện thoại
    dob: '',                          // Ngày sinh (date of birth)
    age: '',                          // Tuổi
    address: '',                      // Địa chỉ chi tiết
    region: '',                       // Khu vực/Tỉnh thành
    running_experience_years: '',     // Số năm kinh nghiệm chạy bộ
    interests: ''                     // Sở thích, quan tâm
  })
  
  // State form đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',    // Mật khẩu hiện tại
    newPassword: '',        // Mật khẩu mới
    confirmPassword: ''     // Xác nhận mật khẩu mới
  })
  
  // State lưu URL ảnh đại diện
  const [avatarUrl, setAvatarUrl] = useState(null)

  // =============================================================================
  // EFFECT: KIỂM TRA ĐĂNG NHẬP VÀ LOAD DỮ LIỆU
  // =============================================================================
  useEffect(() => {
    // Redirect về trang đăng nhập nếu chưa đăng nhập
    if (!authLoading && !user) {
      router.push('/dang-nhap')
      return
    }

    // Khi có profile, điền dữ liệu vào form
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        dob: profile.dob || '',
        age: profile.age || '',
        address: profile.address || '',
        region: profile.region || '',
        running_experience_years: profile.running_experience_years || '',
        interests: profile.interests || ''
      })
      setAvatarUrl(profile.avatar_url)
      setLoading(false)
    }
  }, [user, profile, authLoading, router])

  // =============================================================================
  // XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN (CREATE)
  // Upload ảnh lên Supabase Storage bucket 'avatars'
  // Sau đó cập nhật URL vào bảng profiles
  // =============================================================================
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate loại file - chỉ chấp nhận ảnh
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate kích thước file - tối đa 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 2MB')
      return
    }

    try {
      setUploadingAvatar(true)
      
      // Tạo tên file unique với user id và timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Xóa ảnh cũ nếu có để tránh tích tụ file rác
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop()
        await supabase.storage.from('avatars').remove([oldFileName])
      }

      // Upload ảnh mới lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Lấy URL public của ảnh vừa upload
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Cập nhật URL avatar vào bảng profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Cập nhật state local và refresh profile trong context
      setAvatarUrl(publicUrl)
      if (refreshProfile) refreshProfile()
      toast.success('Cập nhật ảnh đại diện thành công')
    } catch (error) {
      console.error('Lỗi upload ảnh:', error)
      toast.error('Lỗi khi tải ảnh: ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // =============================================================================
  // XỬ LÝ CẬP NHẬT THÔNG TIN CÁ NHÂN (UPDATE)
  // Cập nhật các trường thông tin vào bảng profiles
  // =============================================================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    // Validate bắt buộc: Họ tên không được để trống
    if (!formData.full_name.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }

    try {
      setSaving(true)
      
      // Cập nhật thông tin vào database
      // Các trường rỗng sẽ được set null
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          dob: formData.dob || null,
          age: formData.age ? parseInt(formData.age) : null,
          address: formData.address.trim() || null,
          region: formData.region.trim() || null,
          running_experience_years: formData.running_experience_years ? parseInt(formData.running_experience_years) : null,
          interests: formData.interests.trim() || null
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile trong auth context để đồng bộ state
      if (refreshProfile) refreshProfile()
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error('Lỗi khi cập nhật: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // =============================================================================
  // XỬ LÝ ĐỔI MẬT KHẨU (UPDATE)
  // Sử dụng Supabase Auth API để đổi mật khẩu
  // Yêu cầu xác thực mật khẩu hiện tại trước khi đổi
  // =============================================================================
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    // Validate: Kiểm tra đã nhập đủ thông tin
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    // Validate: Mật khẩu mới tối thiểu 6 ký tự
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    // Validate: Xác nhận mật khẩu phải khớp
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    // Validate: Mật khẩu mới phải khác mật khẩu cũ
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }

    try {
      setChangingPassword(true)

      // Bước 1: Xác thực mật khẩu hiện tại bằng cách đăng nhập lại
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordData.currentPassword
      })

      if (signInError) {
        toast.error('Mật khẩu hiện tại không đúng')
        return
      }

      // Bước 2: Cập nhật mật khẩu mới
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) throw updateError

      // Reset form và thông báo thành công
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Đổi mật khẩu thành công!')
    } catch (error) {
      toast.error('Lỗi khi đổi mật khẩu: ' + error.message)
    } finally {
      setChangingPassword(false)
    }
  }

  // =============================================================================
  // XỬ LÝ XÓA TÀI KHOẢN (DELETE)
  // Xóa tất cả dữ liệu liên quan và đăng xuất
  // =============================================================================
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true)

      // Xóa ảnh đại diện trong Storage nếu có
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop()
        await supabase.storage.from('avatars').remove([fileName])
      }

      // Xóa profile trong database
      // Các bảng liên quan sẽ được cascade delete nếu đã setup FK
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      // Đăng xuất và redirect về trang chủ
      await signOut()
      toast.success('Tài khoản đã được xóa thành công')
      router.push('/')
    } catch (error) {
      toast.error('Lỗi khi xóa tài khoản: ' + error.message)
      setDeletingAccount(false)
    }
  }

  // =============================================================================
  // LOADING STATE - Hiển thị spinner khi đang tải dữ liệu
  // =============================================================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // =============================================================================
  // RENDER GIAO DIỆN CHÍNH
  // =============================================================================
  return (
    <div className="min-h-screen bg-muted/30 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Nút quay lại Dashboard */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* =================================================================
              CỘT TRÁI: ẢNH ĐẠI DIỆN VÀ THÔNG TIN CƠ BẢN
          ================================================================= */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Ảnh đại diện</CardTitle>
                <CardDescription>Nhấp vào ảnh để thay đổi</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {/* Container ảnh đại diện có thể click để upload */}
                <div 
                  className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Ảnh đại diện" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Placeholder khi chưa có ảnh
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                  
                  {/* Overlay hiển thị khi hover */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                
                {/* Input file ẩn để upload ảnh */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                
                {/* Hướng dẫn định dạng ảnh */}
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Định dạng: JPG, PNG<br/>Tối đa: 2MB
                </p>

                {/* Thông tin cơ bản: Email và ngày tham gia */}
                <div className="w-full mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Tham gia: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* =================================================================
              CỘT PHẢI: FORM CẬP NHẬT THÔNG TIN, ĐỔI MẬT KHẨU, XÓA TÀI KHOẢN
          ================================================================= */}
          <div className="md:col-span-2 space-y-6">
            {/* ---------------------------------------------------------
                CARD 1: FORM THÔNG TIN CÁ NHÂN
            --------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Họ và tên - Bắt buộc */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Họ và tên *</Label>
                      <Input 
                        id="full_name"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    
                    {/* Số điện thoại */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input 
                        id="phone"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="0123456789"
                      />
                    </div>
                    
                    {/* Ngày sinh */}
                    <div className="space-y-2">
                      <Label htmlFor="dob">Ngày sinh</Label>
                      <Input 
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={e => setFormData({...formData, dob: e.target.value})}
                      />
                    </div>
                    
                    {/* Tuổi */}
                    <div className="space-y-2">
                      <Label htmlFor="age">Tuổi</Label>
                      <Input 
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        placeholder="25"
                      />
                    </div>
                    
                    {/* Địa chỉ - Full width */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input 
                        id="address"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        placeholder="Số nhà, đường, phường/xã..."
                      />
                    </div>
                    
                    {/* Khu vực/Tỉnh thành */}
                    <div className="space-y-2">
                      <Label htmlFor="region">Khu vực</Label>
                      <Input 
                        id="region"
                        value={formData.region}
                        onChange={e => setFormData({...formData, region: e.target.value})}
                        placeholder="Hà Nội, TP.HCM..."
                      />
                    </div>
                    
                    {/* Kinh nghiệm chạy bộ */}
                    <div className="space-y-2">
                      <Label htmlFor="experience">Kinh nghiệm chạy (năm)</Label>
                      <Input 
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.running_experience_years}
                        onChange={e => setFormData({...formData, running_experience_years: e.target.value})}
                        placeholder="2"
                      />
                    </div>
                    
                    {/* Sở thích - Full width, textarea */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="interests">Sở thích / Quan tâm</Label>
                      <Textarea 
                        id="interests"
                        value={formData.interests}
                        onChange={e => setFormData({...formData, interests: e.target.value})}
                        placeholder="Marathon, Trail running, Dinh dưỡng thể thao..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  {/* Nút lưu thay đổi */}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ---------------------------------------------------------
                CARD 2: FORM ĐỔI MẬT KHẨU
            --------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu đăng nhập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Mật khẩu hiện tại */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="pr-10"
                      />
                      {/* Nút toggle hiển thị/ẩn mật khẩu */}
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Nhập lại mật khẩu mới"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nút đổi mật khẩu */}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Đổi mật khẩu
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ---------------------------------------------------------
                CARD 3: VÙNG NGUY HIỂM - XÓA TÀI KHOẢN
            --------------------------------------------------------- */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Vùng nguy hiểm
                </CardTitle>
                <CardDescription>
                  Hành động này không thể hoàn tác
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div>
                    <h4 className="font-semibold">Xóa tài khoản</h4>
                    <p className="text-sm text-muted-foreground">
                      Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                    </p>
                  </div>
                  
                  {/* Dialog xác nhận xóa tài khoản */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deletingAccount}>
                        {deletingAccount ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa tài khoản
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Tài khoản của bạn sẽ bị xóa vĩnh viễn 
                          cùng với tất cả dữ liệu liên quan bao gồm:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Thông tin cá nhân</li>
                            <li>Lịch sử đơn hàng</li>
                            <li>Đăng ký giải chạy</li>
                            <li>Đánh giá và bình luận</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Xác nhận xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
