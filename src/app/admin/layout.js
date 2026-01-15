"use client"

/**
 * ADMIN LAYOUT - Bố cục chung cho trang quản trị
 * 
 * File này định nghĩa layout chung cho tất cả các trang trong /admin
 * Bao gồm:
 * - Sidebar điều hướng bên trái (có thể thu gọn)
 * - Header với thanh tìm kiếm và thông tin admin
 * - Khu vực hiển thị nội dung chính
 * 
 * Chỉ user có role='admin' mới được truy cập
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingCart, 
  ShoppingBag,
  Package, 
  Trophy, 
  Handshake, 
  Users, 
  FileText, 
  Star, 
  BarChart2, 
  PieChart, 
  Settings,
  Search,
  Bell,
  HelpCircle,
  User,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
  Plus,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'

/**
 * Cấu hình menu sidebar
 * Mỗi item có: icon, label (tên hiển thị), href (đường dẫn), hasSub (có submenu không)
 */
const menuItems = [
  { icon: LayoutDashboard, label: 'Bảng tin', href: '/admin' },
  { icon: Calendar, label: 'Sự kiện & Giải chạy', href: '/admin/events', hasSub: true },
  { icon: Flag, label: 'Đăng ký tham gia', href: '/admin/registrations', hasSub: true },
  { icon: Package, label: 'Cửa hàng', href: '/admin/products', hasSub: true },
  { icon: ShoppingBag, label: 'Đơn hàng', href: '/admin/orders' },
  { icon: Trophy, label: 'Câu lạc bộ', href: '/admin/clubs', hasSub: true },
  { icon: Handshake, label: 'Nhà tài trợ', href: '/admin/sponsors', hasSub: true },
  { icon: Users, label: 'Vận động viên', href: '/admin/athletes', hasSub: true },
  { icon: FileText, label: 'Kiến thức chạy bộ', href: '/admin/posts', hasSub: true },
  { icon: Star, label: 'Đánh giá', href: '/admin/reviews' },
  { icon: BarChart2, label: 'Phân tích SEO', href: '/admin/seo', hasSub: true },
  { icon: PieChart, label: 'Báo cáo thống kê', href: '/admin/reports', hasSub: true },
  { icon: Settings, label: 'Cài đặt hệ thống', href: '/admin/settings', hasSub: true },
]

/**
 * Component AdminLayout
 * Bố cục chính cho trang admin với sidebar và header
 * 
 * @param {React.ReactNode} children - Nội dung trang con được render trong khu vực chính
 */
export default function AdminLayout({ children }) {
  // Lấy pathname hiện tại để highlight menu item đang active
  const pathname = usePathname()
  const router = useRouter()
  // Lấy thông tin profile và trạng thái loading từ AuthContext
  const { profile, loading, signOut } = useAuth()
  // State quản lý trạng thái mở/đóng của sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  // State lưu thời gian hiện tại (hiển thị trong header)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Effect: Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    // Cleanup: Hủy interval khi component unmount
    return () => clearInterval(timer)
  }, [])

  // Effect: Kiểm tra quyền truy cập - chuyển hướng nếu không phải admin
  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      router.push('/dang-nhap')
    }
  }, [profile, loading, router])

  // Hiển thị loading khi đang kiểm tra quyền
  if (loading || !profile || profile.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  }

  // Format thời gian để hiển thị: HH:MM:SS DD/MM/YYYY
  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' ' + currentTime.toLocaleDateString('vi-VN')

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex">
      {/* ==================== SIDEBAR ==================== */}
      <aside 
        className={`bg-[#1e293b] text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-50 flex flex-col`}
      >
        {/* Logo và tên thương hiệu */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-700 h-16">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white">J</span>
            </div>
            {/* Chỉ hiển thị tên khi sidebar mở */}
            {isSidebarOpen && <span className="font-bold text-lg tracking-wider">JOGGING</span>}
          </div>

        {/* Menu điều hướng */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href 
                      ? 'bg-blue-600 text-white'  // Style khi đang active
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'  // Style mặc định
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {/* Chỉ hiển thị label và chevron khi sidebar mở */}
                  {isSidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.hasSub && <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Nút thu gọn/mở rộng sidebar */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm">Thu gọn menu</span>}
          </button>
        </div>
      </aside>

      {/* ==================== NỘI DUNG CHÍNH ==================== */}
      {/* Margin-left thay đổi theo trạng thái sidebar */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Header */}
        <header className="bg-[#1e293b] text-white h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Phần bên trái: Các nút thao tác */}
          <div className="flex items-center gap-6">
            {/* Link về trang chủ public */}
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <LayoutDashboard className="w-4 h-4" />
              <span>Xem trang</span>
            </Link>
            {/* Nút refresh */}
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
            {/* Nút thêm mới */}
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <Plus className="w-4 h-4" />
              <span>Mới</span>
            </button>
          </div>

          {/* Phần giữa: Thanh tìm kiếm */}
          <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full bg-slate-800 border-none rounded-md py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phần bên phải: Thông báo và thông tin admin */}
          <div className="flex items-center gap-4">
            {/* Nút thông báo */}
            <button className="text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            {/* Nút trợ giúp */}
            <button className="text-slate-400 hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            {/* Thông tin admin */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
              <span className="text-sm text-slate-300">Chào, Administrator</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Khu vực nội dung trang */}
        <div className="p-6">
          {/* Header của khu vực nội dung: Tiêu đề và thời gian */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Bảng tin</h1>
            <div className="text-sm text-slate-500">
              Cập nhật lúc: {formattedTime}
            </div>
          </div>
          {/* Render nội dung trang con */}
          {children}
        </div>
      </main>
    </div>
  )
}
