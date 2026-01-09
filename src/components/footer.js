"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Clock, Calendar, Facebook, Instagram, Youtube, Mail, Phone } from 'lucide-react'
export function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState(null)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            setLocation({
              lat: latitude,
              lng: longitude,
              city: data.address?.city || data.address?.town || data.address?.state || 'Việt Nam'
            })
          } catch {
            setLocation({ lat: latitude, lng: longitude, city: 'Việt Nam' })
          }
        },
        () => setLocation({ lat: 21.028511, lng: 105.804817, city: 'Hà Nội' })
      )
    }
  }, [])
  const tickerContent = `
    📅 ${currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    ⏰ ${currentTime.toLocaleTimeString('vi-VN')}
    📍 ${location?.city || 'Đang xác định vị trí...'}
    🏃 JOG.com.vn - Cổng thông tin chạy bộ hàng đầu Việt Nam
    💪 Khỏe mạnh mỗi ngày - Chạy bộ mỗi ngày
  `
  return (
    <footer className="bg-foreground text-white">
      <div className="overflow-hidden py-3 bg-primary">
        <div className="animate-ticker whitespace-nowrap flex">
          <span className="mx-8">{tickerContent}</span>
          <span className="mx-8">{tickerContent}</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-2xl font-bold">JOG.com.vn</span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Cổng thông tin chạy bộ hàng đầu Việt Nam. Cung cấp kiến thức, kỹ thuật và trang thiết bị chất lượng cho cộng đồng Runner.
            </p>
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
          <div>
            <h4 className="font-semibold mb-4">Điều hướng</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
                <li><Link href="/kien-thuc" className="hover:text-primary transition-colors">Kiến thức chạy bộ</Link></li>
              <li><Link href="/dinh-duong" className="hover:text-primary transition-colors">Dinh dưỡng</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Cửa hàng</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Danh mục sản phẩm</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/shop?category=giay-chay-bo" className="hover:text-primary transition-colors">Giày chạy bộ</Link></li>
              <li><Link href="/shop?category=quan-ao-the-thao" className="hover:text-primary transition-colors">Quần áo thể thao</Link></li>
              <li><Link href="/shop?category=phu-kien" className="hover:text-primary transition-colors">Phụ kiện</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Nguyễn Trãi, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>0123 456 789</span>
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
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          <p>© 2024 JOG.com.vn. Bản quyền thuộc về cộng đồng Runner Việt Nam.</p>
        </div>
      </div>
    </footer>
  )
}
