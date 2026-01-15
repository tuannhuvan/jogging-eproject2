"use client"

/**
 * ADMIN SETTINGS PAGE - Trang cài đặt hệ thống
 * 
 * Trang này cho phép admin cấu hình toàn bộ các thiết lập của hệ thống Jogging Portal.
 * Các thiết lập bao gồm:
 * - Thông tin chung: Tên trang web, slogan, logo, favicon.
 * - Liên hệ: Email, số điện thoại, địa chỉ văn phòng.
 * - Mạng xã hội: Liên kết Facebook, YouTube, Instagram, Strava.
 * - Cấu hình hệ thống: Chế độ bảo trì, cho phép đăng ký, giới hạn tải lên.
 * - SEO cơ bản: Meta title, meta description, keywords mặc định.
 * 
 * Dữ liệu thường được lưu trong bảng 'system_settings' (key-value pair) 
 * hoặc một object JSON trong Supabase.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Save, 
  ArrowLeft, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Search as SeoIcon,
  Bell,
  Database,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/**
 * Component chính - Trang cài đặt hệ thống
 * Sử dụng Tabs để phân loại các nhóm cài đặt cho dễ quản lý
 */
export default function AdminSettingsPage() {
  // Hook điều hướng
  const router = useRouter()
  
  // Lấy thông tin xác thực từ context
  const { user, profile, loading: authLoading } = useAuth()
  
  // State trạng thái loading khi lưu dữ liệu
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // State lưu trữ tất cả cấu hình hệ thống
  const [settings, setSettings] = useState({
    // 1. Thông tin chung
    site_name: 'Jogging Portal',
    site_description: 'Cổng thông tin chạy bộ hàng đầu Việt Nam',
    site_slogan: 'Chạy vì sức khỏe, kết nối cộng đồng',
    
    // 2. Liên hệ
    contact_email: 'contact@joggingportal.vn',
    contact_phone: '090 123 4567',
    contact_address: '123 Đường Chạy Bộ, Quận 1, TP. Hồ Chí Minh',
    
    // 3. Mạng xã hội
    social_facebook: 'https://facebook.com/joggingportal',
    social_youtube: 'https://youtube.com/joggingportal',
    social_strava: 'https://strava.com/clubs/joggingportal',
    
    // 4. Cấu hình hệ thống
    enable_registration: true,     // Cho phép người dùng mới đăng ký
    maintenance_mode: false,       // Chế độ bảo trì (chỉ admin truy cập được)
    email_notifications: true,     // Gửi thông báo email khi có sự kiện mới
    auto_approve_clubs: false,     // Tự động duyệt câu lạc bộ mới
    
    // 5. SEO & Metadata
    meta_title: 'Jogging Portal - Kết nối đam mê chạy bộ',
    meta_description: 'Nền tảng quản lý giải chạy, câu lạc bộ và cộng đồng chạy bộ chuyên nghiệp.',
    meta_keywords: 'chạy bộ, jogging, marathon, giải chạy, câu lạc bộ chạy'
  })

  /**
   * Effect kiểm tra quyền truy cập admin
   * Nếu không phải admin, chuyển hướng về trang chủ
   */
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/')
      return
    }

    // Giả lập tải dữ liệu từ API/Database
    // Trong thực tế, bạn sẽ gọi: const { data } = await supabase.from('settings').select('*')
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [user, profile, authLoading, router])

  /**
   * Hàm xử lý khi người dùng nhấn nút Lưu
   * Sẽ gọi API để cập nhật dữ liệu vào database
   */
  async function handleSave() {
    setSaving(true)
    
    try {
      // Giả lập gọi API lưu dữ liệu
      // const { error } = await supabase.from('settings').upsert(settings)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Đã lưu tất cả thay đổi thành công!')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu cài đặt: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Hiển thị skeleton loading khi đang tải quyền truy cập
  if (authLoading || loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground italic">Đang tải cấu hình hệ thống...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header: Tiêu đề và các nút thao tác nhanh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
              <p className="text-muted-foreground">Quản lý cấu hình chung, liên hệ và các tùy chọn vận hành</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            {saving ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Lưu tất cả thay đổi</>
            )}
          </Button>
        </div>

        {/* Nội dung chính: Phân chia theo Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          
          {/* Danh sách các tab */}
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="general" className="flex items-center gap-2 py-2">
              <Globe className="w-4 h-4" /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 py-2">
              <Mail className="w-4 h-4" /> Liên hệ
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2 py-2">
              <Share2 className="w-4 h-4" /> Mạng xã hội
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 py-2">
              <ShieldCheck className="w-4 h-4" /> Vận hành
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2 py-2">
              <SeoIcon className="w-4 h-4" /> SEO
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Thông tin chung */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Website</CardTitle>
                <CardDescription>Cấu hình các thông tin cơ bản hiển thị trên trang chủ và thanh tiêu đề.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Tên website</Label>
                    <Input 
                      id="site_name" 
                      value={settings.site_name}
                      onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_slogan">Slogan</Label>
                    <Input 
                      id="site_slogan" 
                      value={settings.site_slogan}
                      onChange={(e) => setSettings({...settings, site_slogan: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_description">Mô tả ngắn</Label>
                    <Textarea 
                      id="site_description" 
                      rows={3}
                      value={settings.site_description}
                      onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Liên hệ */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>Địa chỉ và thông tin hiển thị ở phần Footer và trang Liên hệ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email hỗ trợ</Label>
                    <Input 
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Số điện thoại</Label>
                    <Input 
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Địa chỉ văn phòng</Label>
                  <Input 
                    value={settings.contact_address}
                    onChange={(e) => setSettings({...settings, contact_address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Mạng xã hội */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Liên kết mạng xã hội</CardTitle>
                <CardDescription>Kết nối cộng đồng qua các nền tảng phổ biến.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Facebook Fanpage</Label>
                    <Input 
                      placeholder="https://facebook.com/..."
                      value={settings.social_facebook}
                      onChange={(e) => setSettings({...settings, social_facebook: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kênh YouTube</Label>
                    <Input 
                      placeholder="https://youtube.com/..."
                      value={settings.social_youtube}
                      onChange={(e) => setSettings({...settings, social_youtube: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Câu lạc bộ Strava</Label>
                    <Input 
                      placeholder="https://strava.com/clubs/..."
                      value={settings.social_strava}
                      onChange={(e) => setSettings({...settings, social_strava: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Vận hành hệ thống */}
          <TabsContent value="system">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Cài đặt trạng thái website */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Trạng thái Website</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Chế độ bảo trì</Label>
                      <p className="text-sm text-muted-foreground italic text-red-500">
                        * Chỉ admin mới có thể truy cập phía người dùng
                      </p>
                    </div>
                    <Switch 
                      checked={settings.maintenance_mode}
                      onCheckedChange={(val) => setSettings({...settings, maintenance_mode: val})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cho phép đăng ký mới</Label>
                      <p className="text-sm text-muted-foreground">Mở cổng đăng ký tài khoản vận động viên</p>
                    </div>
                    <Switch 
                      checked={settings.enable_registration}
                      onCheckedChange={(val) => setSettings({...settings, enable_registration: val})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cài đặt thông báo & Duyệt tin */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Thông báo & Quy trình</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Thông báo Email</Label>
                      <p className="text-sm text-muted-foreground">Gửi email khi có đăng ký mới hoặc tin nhắn</p>
                    </div>
                    <Switch 
                      checked={settings.email_notifications}
                      onCheckedChange={(val) => setSettings({...settings, email_notifications: val})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Tự động duyệt CLB</Label>
                      <p className="text-sm text-muted-foreground">Cho phép CLB hiển thị ngay sau khi tạo</p>
                    </div>
                    <Switch 
                      checked={settings.auto_approve_clubs}
                      onCheckedChange={(val) => setSettings({...settings, auto_approve_clubs: val})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: SEO & Metadata */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Tối ưu hóa tìm kiếm (SEO)</CardTitle>
                <CardDescription>Cấu hình các thẻ meta mặc định để cải thiện thứ hạng trên Google.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề trang (Meta Title)</Label>
                    <Input 
                      value={settings.meta_title}
                      onChange={(e) => setSettings({...settings, meta_title: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground italic">Khuyên dùng: Dưới 60 ký tự</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả trang (Meta Description)</Label>
                    <Textarea 
                      rows={3}
                      value={settings.meta_description}
                      onChange={(e) => setSettings({...settings, meta_description: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground italic">Khuyên dùng: Dưới 160 ký tự</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Từ khóa (Keywords)</Label>
                    <Input 
                      placeholder="VD: chạy bộ, marathon, thể thao..."
                      value={settings.meta_keywords}
                      onChange={(e) => setSettings({...settings, meta_keywords: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground italic">Phân cách các từ bằng dấu phẩy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chân trang thông báo */}
        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Lưu ý bảo mật:</p>
            <p>Các thay đổi tại đây sẽ ảnh hưởng trực tiếp đến toàn bộ giao diện người dùng và trải nghiệm của vận động viên. Hãy kiểm tra kỹ trước khi nhấn Lưu.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
