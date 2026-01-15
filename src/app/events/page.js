"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Trophy, ArrowRight, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

// Dữ liệu mẫu cho hình ảnh nếu không có trong database
const fallbackImages = {
  event: [
    'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?w=800',
    'https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=800',
    'https://images.unsplash.com/photo-1530541930197-ff16ac7a7b2e?w=800',
    'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=800'
  ]
}

// Trang hiển thị danh sách các sự kiện và giải chạy
export default function EventsPage() {
  // Quản lý trạng thái danh sách sự kiện, trạng thái tải và từ khóa tìm kiếm
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Tải dữ liệu sự kiện từ API khi component được gắn kết (mount)
  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.getEvents()
        setEvents(data || [])
      } catch (error) {
        console.error('Lỗi khi tải danh sách sự kiện:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Lọc danh sách sự kiện dựa trên tên sự kiện hoặc địa điểm mà người dùng nhập vào ô tìm kiếm
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Giao diện chính của trang sự kiện
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Phần giới thiệu (Hero Section) */}
      <div className="bg-primary py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Sự kiện & Giải chạy</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Khám phá và đăng ký các giải chạy Marathon, Trail và sự kiện cộng đồng trên khắp Việt Nam
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Thanh công cụ tìm kiếm và lọc */}
        <Card className="mb-12 shadow-xl border-none">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Tìm kiếm giải chạy, địa điểm..." 
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12 w-full md:w-auto gap-2">
                <Filter className="w-4 h-4" /> Lọc kết quả
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách sự kiện - Hiển thị skeleton khi đang tải */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-xl bg-white animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          /* Hiển thị danh sách sự kiện sau khi đã tải xong */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none shadow-lg bg-white flex flex-col h-full">
                  {/* Hình ảnh sự kiện */}
                  <div className="relative h-52 overflow-hidden">
                      <Image
                        src={event.image_url || 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=800'}
                        alt={event.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    {/* Badge trạng thái đăng ký */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xl ${
                        event.status === 'Open' ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                        {event.status === 'Open' ? 'ĐANG MỞ ĐĂNG KÝ' : 'SẮP DIỄN RA'}
                      </span>
                    </div>
                  </div>
                  {/* Nội dung chi tiết sự kiện */}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[56px]">
                      {event.name}
                    </h3>
                    
                    {/* Các thông tin cơ bản: Ngày, Địa điểm, Cự ly */}
                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {new Date(event.date).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">5km, 10km, 21km, 42km</span>
                      </div>
                    </div>

                    {/* Nút đăng ký hoặc xem chi tiết */}
                    <Link href={`/events/${event.id}`} className="mt-auto">
                      <Button className="w-full h-12 font-bold text-lg group-hover:shadow-lg transition-all">
                        {event.status === 'Open' ? 'Đăng ký tham gia' : 'Xem chi tiết'}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              /* Hiển thị khi không có kết quả tìm kiếm */
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Không tìm thấy giải chạy nào</h3>
                <p className="text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phần kêu gọi hành động cho nhà tổ chức (CTA) */}
      <div className="container mx-auto px-4 mt-20">
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Bạn là nhà tổ chức giải chạy?</h2>
            <p className="text-lg text-white/90 mb-6">
              Hợp tác với chúng tôi để đưa giải chạy của bạn đến với cộng đồng runner đông đảo nhất Việt Nam.
            </p>
            <Button size="lg" variant="secondary" className="font-bold px-10 h-14 text-lg">
              Đăng ký hợp tác ngay
            </Button>
          </div>
          <div className="w-full md:w-1/3 aspect-video relative rounded-2xl overflow-hidden shadow-xl">
               <Image 
                 src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800"
                 alt="Organizer"
                 fill
                 className="object-cover"
               />
          </div>
        </div>
      </div>
    </div>
  )
}

