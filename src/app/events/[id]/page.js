"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Clock, Trophy, ShieldCheck, User, Mail, Send, Check, CreditCard, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

// Trang chi tiết sự kiện và giải chạy
export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  // Dữ liệu biểu mẫu đăng ký
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    distance: '5km'
  })

  // Hàm lấy giá dựa trên cự ly đã chọn
  const getPrice = (distance) => {
    if (!event) return 0;
    switch(distance) {
      case '5km': return event.price_5km || 150000;
      case '10km': return event.price_10km || 200000;
      case '21km': return event.price_21km || 350000;
      case '42km': return event.price_42km || 500000;
      default: return 0;
    }
  }

  // Xử lý trạng thái thanh toán từ tham số URL
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      toast.success('Thanh toán thành công! Đăng ký của bạn đã được xác nhận.')
      setPaymentStatus('success')
    } else if (payment === 'cancelled') {
      toast.error('Thanh toán đã bị hủy. Vui lòng thử lại.')
      setPaymentStatus('cancelled')
    }
  }, [searchParams])

  // Tải dữ liệu chi tiết sự kiện và trạng thái đăng ký khi component được gắn kết
  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await api.getEventById(params.id)
        setEvent(eventData)
        
        if (user) {
          const reg = await api.getUserRegistration(params.id, user.id)
          if (reg) {
            setIsRegistered(true)
            setRegistration(reg)
            setFormData({
              full_name: reg.full_name,
              email: reg.email,
              distance: reg.distance
            })
          } else if (profile) {
            setFormData(prev => ({
              ...prev,
              full_name: profile.full_name || '',
              email: user.email || ''
            }))
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching event detail:', error)
        setLoading(false)
      }
    }
    
    if (!authLoading) {
      fetchData()
    }
  }, [params.id, user, profile, authLoading])

  // Hàm xử lý hủy đăng ký
  async function handleCancelRegistration() {
    if (!registration || registration.payment_status === 'paid') return
    
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) return

    setCancelling(true)
    try {
      await api.deleteRegistration(registration.id)
      toast.success('Đã hủy đăng ký thành công')
      setIsRegistered(false)
      setRegistration(null)
    } catch (error) {
      toast.error('Không thể hủy đăng ký. Vui lòng thử lại sau.')
    }
    setCancelling(false)
  }

  // Hàm xử lý đăng ký sự kiện
  async function handleRegister(e) {
    e.preventDefault()
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký giải chạy')
      router.push('/dang-nhap')
      return
    }

    // Kiểm tra thông tin biểu mẫu
    setRegistering(true)
    try {
      const result = await api.postData('create_registration.php', {
        event_id: event.id,
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        distance: formData.distance
      })

      if (result && !result.error) {
        const checkoutResponse = await fetch('/api/checkout/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: result.id,
            eventId: event.id,
            eventName: event.name,
            distance: formData.distance,
            email: formData.email,
          }),
        })

        const checkoutData = await checkoutResponse.json()

        if (checkoutData.url) {
          window.location.href = checkoutData.url
        } else {
          toast.error('Không thể tạo phiên thanh toán')
          setRegistering(false)
        }
      } else {
        toast.error(result?.error || 'Đăng ký thất bại, vui lòng thử lại sau')
        setRegistering(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi trong quá trình đăng ký')
      setRegistering(false)
    }
  }

  // Hàm xử lý thanh toán
  async function handlePayment() {
    if (!registration) return
    
    setRegistering(true)
    try {
      const checkoutResponse = await fetch('/api/checkout/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          eventId: event.id,
          eventName: event.name,
          distance: registration.distance,
          email: registration.email,
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        toast.error('Không thể tạo phiên thanh toán')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi')
    }
    setRegistering(false)
  }

  // Hiển thị trạng thái tải dữ liệu
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full max-w-4xl animate-pulse space-y-8">
          <div className="h-64 bg-muted rounded-2xl w-full" />
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-20 bg-muted rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Hiển thị nếu không tìm thấy sự kiện
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Không tìm thấy sự kiện</h1>
        <p className="text-muted-foreground mb-8">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/events">
          <Button>Quay lại danh sách giải chạy</Button>
        </Link>
      </div>
    )
  }

  // Hiển thị nội dung chi tiết sự kiện
  return (
    <div className="min-h-screen bg-secondary/5 pb-20">
      {/* Hero Header */}
      <div className="relative h-[300px] md:h-[450px] w-full">
        <Image
          src={event.image_url || 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600'}
          alt={event.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <Link href="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Tất cả giải chạy
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 md:gap-8 text-white/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-medium">Chính thức</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl overflow-hidden rounded-2xl">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Thông tin chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 prose prose-slate max-w-none prose-headings:text-primary prose-a:text-primary">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
                
                {(!event.description || event.description === 'Chạy đêm Hà Nội') && (
                   <div className="space-y-4 text-muted-foreground italic">
                      <p>Chào mừng bạn đến với {event.name}. Đây là giải chạy thường niên quy mô lớn dành cho cộng đồng yêu thể thao.</p>
                      <p>Hãy chuẩn bị thể lực tốt nhất để cùng hàng ngàn vận động viên khác chinh phục những cung đường đẹp nhất tại {event.location}.</p>
                   </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-2xl">
               <CardHeader className="bg-white border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  Lộ trình & Cự ly
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['5km', '10km', '21km', '42km'].map((dist) => (
                    <div key={dist} className="bg-secondary/20 p-6 rounded-xl text-center hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20 cursor-default">
                      <div className="text-2xl font-black text-primary mb-1">{dist}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Chinh phục</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-primary p-6 text-white text-center">
                  <h3 className="text-xl font-bold">Đăng ký tham gia</h3>
                  <p className="text-white/80 text-sm mt-1">Cơ hội nhận BIB và áo đấu chính thức</p>
                </div>
                
                <CardContent className="p-6 md:p-8">
                    {isRegistered ? (
                      <div className="text-center py-8 space-y-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${registration?.payment_status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                          {registration?.payment_status === 'paid' ? (
                            <Check className="w-10 h-10 text-green-600" />
                          ) : (
                            <CreditCard className="w-10 h-10 text-orange-600" />
                          )}
                        </div>
                        <h4 className={`text-xl font-bold ${registration?.payment_status === 'paid' ? 'text-green-700' : 'text-orange-700'}`}>
                          {registration?.payment_status === 'paid' ? 'Đăng ký hoàn tất!' : 'Chờ thanh toán'}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {registration?.payment_status === 'paid' 
                            ? `Bạn đã hoàn tất đăng ký tham gia ${event.name}.`
                            : `Vui lòng thanh toán để hoàn tất đăng ký tham gia ${event.name}.`
                          }
                        </p>
                        <div className="bg-secondary/30 p-4 rounded-xl text-left text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vận động viên:</span>
                            <span className="font-bold">{formData.full_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cự ly:</span>
                            <span className="font-bold text-primary">{formData.distance}</span>
                          </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phí đăng ký:</span>
                              <span className="font-bold">{getPrice(formData.distance)?.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trạng thái:</span>
                              <span className={`font-bold ${registration?.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                {registration?.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                              </span>
                            </div>
                          </div>
                          {registration?.payment_status !== 'paid' && (
                            <div className="flex flex-col gap-2">
                              <Button 
                                onClick={handlePayment}
                                className="w-full gap-2"
                                disabled={registering || cancelling}
                              >
                                {registering ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4" />
                                    Thanh toán ngay
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={handleCancelRegistration}
                                className="w-full gap-2 text-destructive hover:bg-destructive/10"
                                disabled={registering || cancelling}
                              >
                                {cancelling ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    Hủy đăng ký
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                          <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
                             Quản lý cá nhân
                          </Button>
                        </div>

                    ) : (
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> Họ và tên
                        </label>
                        <Input
                          placeholder="Họ và tên của bạn"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          required
                          className="bg-muted/50 focus:bg-white transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" /> Email
                        </label>
                        <Input
                          type="email"
                          placeholder="Địa chỉ email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-muted/50 focus:bg-white transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary" /> Cự ly đăng ký
                        </label>
                        <Select
                          value={formData.distance}
                          onValueChange={(val) => setFormData({ ...formData, distance: val })}
                        >
                          <SelectTrigger className="bg-muted/50 focus:bg-white">
                            <SelectValue placeholder="Chọn cự ly" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5km">5km - Fun Run</SelectItem>
                            <SelectItem value="10km">10km - Challenge</SelectItem>
                            <SelectItem value="21km">21km - Half Marathon</SelectItem>
                            <SelectItem value="42km">42km - Full Marathon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                        <div className="pt-4">
                            <div className="text-center mb-3 p-3 bg-primary/10 rounded-lg">
                              <span className="text-sm text-muted-foreground">Phí đăng ký:</span>
                              <span className="text-xl font-bold text-primary ml-2">
                                {getPrice(formData.distance)?.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                              disabled={registering}
                            >

                            {registering ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="w-5 h-5" />
                                Đăng ký & Thanh toán
                              </>
                            )}
                          </Button>
                          <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest">
                             Thanh toán qua Stripe - Bảo mật 100%
                          </p>
                        </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6 border-none shadow-lg rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-white">
                <CardContent className="p-6">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    Cam kết từ BTC
                  </h4>
                  <ul className="text-xs space-y-2 opacity-90">
                    <li>• Bảo mật thông tin vận động viên 100%</li>
                    <li>• Hỗ trợ y tế và nước uống dọc đường</li>
                    <li>• Bảo hiểm sự kiện cho mọi người tham gia</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
