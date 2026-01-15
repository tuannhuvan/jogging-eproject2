"use client"

/**
 * FOOTER COMPONENT - Chân trang của ứng dụng
 * 
 * Hiển thị thông tin liên hệ, liên kết điều hướng, mạng xã hội
 * và thanh ticker chạy với thông tin thời gian thực
 */

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Clock, Calendar, Facebook, Instagram, Youtube, Mail, Phone } from 'lucide-react'

/**
 * Component Footer chính
 * Bao gồm: ticker động, logo, điều hướng, danh mục sản phẩm và thông tin liên hệ
 */
export function Footer() {
  // State lưu thời gian hiện tại
  const [currentTime, setCurrentTime] = useState(null)
  // State lưu vị trí địa lý của người dùng
  const [location, setLocation] = useState(null)
  // State kiểm tra component đã mounted chưa để tránh lỗi hydration
  const [mounted, setMounted] = useState(false)
  
  // Effect cập nhật thời gian mỗi giây
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    // Cleanup: hủy interval khi component unmount
    return () => clearInterval(timer)
  }, [])
  
  // Effect lấy vị trí địa lý của người dùng khi component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
            try {
              // Gọi API OpenStreetMap để chuyển đổi tọa độ thành tên địa điểm
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              )
              
                if (!response.ok) {
                  throw new Error('Network response was not ok')
                }
                
                const text = await response.text()
                let data = {}
                try {
                  data = JSON.parse(text)
                } catch (e) {
                  console.error('Failed to parse location JSON:', text)
                }

                // Lưu thông tin vị trí vào state
                setLocation({
                  lat: latitude,
                  lng: longitude,
                  city: data.address?.city || data.address?.town || data.address?.state || 'Việt Nam'
                })
            } catch (error) {
              // Xử lý lỗi khi không thể lấy tên thành phố
              console.error('Error fetching location:', error)
              setLocation({ lat: latitude, lng: longitude, city: 'Việt Nam' })
            }
        },
        // Callback khi người dùng từ chối quyền truy cập vị trí - dùng vị trí mặc định Hà Nội
        () => setLocation({ lat: 21.028511, lng: 105.804817, city: 'Hà Nội' })
      )
    }
  }, [])
  
  // Nội dung thanh ticker chạy - hiển thị thông tin động
  const tickerContent = (mounted && currentTime) ? `
    📅 ${currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    ⏰ ${currentTime.toLocaleTimeString('vi-VN')}
    📍 ${location?.city || 'Đang xác định vị trí...'}
    🏃 JOG.com.vn - Cổng thông tin chạy bộ hàng đầu Việt Nam
    💪 Khỏe mạnh mỗi ngày - Chạy bộ mỗi ngày
  ` : 'Đang tải thông tin thời gian...'
  return (
    <footer className="bg-foreground text-white">
      {/* Thanh ticker chạy với animation */}
      <div className="overflow-hidden py-3 bg-primary">
        <div className="animate-ticker whitespace-nowrap flex">
          <span className="mx-8">{tickerContent}</span>
          <span className="mx-8">{tickerContent}</span>
        </div>
      </div>

      {/* Phần nội dung chính của footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Cột 1: Logo và giới thiệu */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full 
              flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-2xl font-bold">JOG</span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Cổng thông tin chạy bộ hàng đầu Việt Nam. Cung cấp kiến thức, kỹ thuật và trang thiết bị chất lượng cho cộng đồng Runner.
            </p>
            {/* Liên kết mạng xã hội */}
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Điều hướng */}
          <div>
            <h4 className="font-semibold mb-4">Điều hướng</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
                <li><Link href="/kien-thuc" className="hover:text-primary transition-colors">Kiến thức chạy bộ</Link></li>
              <li><Link href="/dinh-duong" className="hover:text-primary transition-colors">Dinh dưỡng</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Cửa hàng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Danh mục sản phẩm */}
          <div>
            <h4 className="font-semibold mb-4">Danh mục sản phẩm</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/shop?category=giay-chay-bo" className="hover:text-primary transition-colors">Giày chạy bộ</Link></li>
              <li><Link href="/shop?category=quan-ao-the-thao" className="hover:text-primary transition-colors">Quần áo thể thao</Link></li>
              <li><Link href="/shop?category=phu-kien" className="hover:text-primary transition-colors">Phụ kiện</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>13 Trịnh Văn Bô, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>0976 493 683</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@jog.com.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>8:00 - 22:00 (T2 - CN)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          <p>© 2026 jog.com.vn Bản quyền thuộc về cộng đồng Runner Việt Nam.</p>
        </div>
      </div>
    </footer>
  )
}
