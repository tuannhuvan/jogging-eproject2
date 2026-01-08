"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  ShoppingBag, 
  Trophy, 
  Users, 
  Star, 
  Settings, 
  LogOut,
  Calendar,
  MapPin,
  History,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEvents: 0,
    totalReviews: 0,
    totalComments: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [editProfile, setEditProfile] = useState(false)
  const [formData, setFormData] = useState({})

  // Lists for display
  const [orders, setOrders] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [clubs, setClubs] = useState([])
  const [reviews, setReviews] = useState([])
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dang-nhap')
      return
    }

    if (user && profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        dob: profile.dob || '',
        address: profile.address || '',
        region: profile.region || '',
        phone: profile.phone || '',
        running_experience_years: profile.running_experience_years || '',
        interests: profile.interests || ''
      })
      fetchDashboardData()
    }
  }, [user, profile, authLoading])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Fetch Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(ordersData || [])

      // Fetch Registrations
      const { data: regsData } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
      setRegistrations(regsData || [])

      // Fetch Clubs
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', profile.club_id)
      setClubs(clubsData || [])

      // Fetch Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .eq('user_id', user.id)
      setReviews(reviewsData || [])

      // Fetch Comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, posts(title)')
        .eq('user_id', user.id)
      setComments(commentsData || [])

      setStats({
        totalOrders: ordersData?.length || 0,
        totalEvents: regsData?.length || 0,
        totalReviews: reviewsData?.length || 0,
        totalComments: commentsData?.length || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age) || null,
          dob: formData.dob || null,
          address: formData.address,
          region: formData.region,
          phone: formData.phone,
          running_experience_years: parseInt(formData.running_experience_years) || null,
          interests: formData.interests
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Cập nhật thông tin thành công')
      setEditProfile(false)
    } catch (error) {
      toast.error('Lỗi khi cập nhật: ' + error.message)
    }
  }

  async function handleCancelRegistration(id, status) {
    if (status === 'paid') {
      toast.error('Không thể hủy đăng ký đã thanh toán')
      return
    }
    
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) return

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Đã hủy đăng ký thành công')
      fetchDashboardData()
    } catch (error) {
      toast.error('Lỗi khi hủy đăng ký: ' + error.message)
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg">
              <User size={48} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile?.full_name || 'Vận động viên'}</h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <Badge variant="outline" className="bg-white">ID: {user?.id.slice(0, 8)}</Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </Badge>
                {profile?.club_id && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    <Users size={12} className="mr-1" /> CLB: {clubs[0]?.name || 'Đang tải...'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditProfile(!editProfile)}>
                <Settings size={18} className="mr-2" /> {editProfile ? 'Hủy' : 'Sửa hồ sơ'}
              </Button>
              <Button variant="destructive" onClick={signOut}>
                <LogOut size={18} className="mr-2" /> Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Thống kê cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy size={16} className="text-orange-500" /> Giải chạy
                  </div>
                  <span className="font-bold">{stats.totalEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag size={16} className="text-blue-500" /> Đơn hàng
                  </div>
                  <span className="font-bold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={16} className="text-yellow-500" /> Đánh giá
                  </div>
                  <span className="font-bold">{stats.totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare size={16} className="text-green-500" /> Bình luận
                  </div>
                  <span className="font-bold">{stats.totalComments}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <Button variant="secondary" className="w-full justify-start" asChild>
                <a href="/shop"><ShoppingBag className="mr-2 h-4 w-4" /> Mua sắm</a>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <a href="/events"><Calendar className="mr-2 h-4 w-4" /> Đăng ký giải</a>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <a href="/clubs"><Users className="mr-2 h-4 w-4" /> Tham gia CLB</a>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {editProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
                  <CardDescription>Cung cấp thông tin chính xác để có trải nghiệm tốt nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <Input 
                          value={formData.full_name} 
                          onChange={e => setFormData({...formData, full_name: e.target.value})}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ngày sinh</Label>
                        <Input 
                          type="date"
                          value={formData.dob} 
                          onChange={e => setFormData({...formData, dob: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tuổi</Label>
                        <Input 
                          type="number"
                          value={formData.age} 
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          placeholder="25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Địa chỉ</Label>
                        <Input 
                          value={formData.address} 
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          placeholder="Số 1, Đường X..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Khu vực sinh sống</Label>
                        <Input 
                          value={formData.region} 
                          onChange={e => setFormData({...formData, region: e.target.value})}
                          placeholder="Hà Nội, TP.HCM..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kinh nghiệm chạy bộ (số năm)</Label>
                        <Input 
                          type="number"
                          value={formData.running_experience_years} 
                          onChange={e => setFormData({...formData, running_experience_years: e.target.value})}
                          placeholder="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quan tâm/Sở thích</Label>
                        <Input 
                          value={formData.interests} 
                          onChange={e => setFormData({...formData, interests: e.target.value})}
                          placeholder="Marathon, Trail, Dinh dưỡng..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setEditProfile(false)}>Hủy bỏ</Button>
                      <Button type="submit">Lưu thay đổi</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="events">Giải chạy</TabsTrigger>
                  <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                  <TabsTrigger value="activities">Hoạt động</TabsTrigger>
                  <TabsTrigger value="membership">Thành viên</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User size={20} className="text-primary" /> Thông tin cá nhân
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Họ tên:</span>
                          <span className="font-medium">{profile?.full_name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Ngày sinh:</span>
                          <span className="font-medium">{profile?.dob || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Điện thoại:</span>
                          <span className="font-medium">{profile?.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Khu vực:</span>
                          <span className="font-medium">{profile?.region || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Kinh nghiệm:</span>
                          <span className="font-medium">{profile?.running_experience_years ? `${profile.running_experience_years} năm` : 'Chưa cập nhật'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp size={20} className="text-primary" /> Chỉ số hoạt động
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Trophy size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Giải chạy gần nhất</p>
                            <p className="font-bold">{registrations[0]?.events?.name || 'Chưa tham gia'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                            <p className="font-bold">
                              {orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <Calendar size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                            <p className="font-bold">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <Card>
                    <CardHeader>
                      <CardTitle>Giải chạy của tôi</CardTitle>
                      <CardDescription>Danh sách các giải chạy bạn đã đăng ký</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {registrations.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Bạn chưa đăng ký giải chạy nào.</p>
                          <Button asChild><a href="/events">Tìm giải chạy ngay</a></Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {registrations.map((reg) => (
                            <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                                  <Trophy size={24} />
                                </div>
                                <div>
                                  <h4 className="font-bold">{reg.events?.name}</h4>
                                  <div className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(reg.created_at).toLocaleDateString('vi-VN')}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> Cự ly: {reg.distance}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge>{reg.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}</Badge>
                                {reg.payment_status !== 'paid' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                      onClick={() => handleCancelRegistration(reg.id, reg.payment_status)}
                                    >
                                      Hủy
                                    </Button>
                                    <Button 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => router.push(`/events/${reg.event_id}`)}
                                    >
                                      Thanh toán
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch sử mua hàng</CardTitle>
                      <CardDescription>Quản lý các đơn hàng đã đặt</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào.</p>
                          <Button asChild><a href="/shop">Đến cửa hàng</a></Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="flex flex-col p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-primary">Đơn hàng #{order.id}</span>
                                <Badge variant="secondary">{order.status}</Badge>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                <span className="font-bold text-foreground">{(order.total_amount || 0).toLocaleString('vi-VN')} đ</span>
                              </div>
                              <div className="mt-2 text-sm">
                                <p className="truncate text-muted-foreground">Địa chỉ: {order.shipping_address}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activities">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Đánh giá sản phẩm</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {reviews.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Bạn chưa có đánh giá nào.</p>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                                <div className="flex justify-between font-medium mb-1">
                                  <span>{review.products?.name}</span>
                                  <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-muted-foreground italic">"{review.comment}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bình luận bài viết</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Bạn chưa có bình luận nào.</p>
                        ) : (
                          <div className="space-y-4">
                            {comments.map((comment) => (
                              <div key={comment.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                                <p className="font-medium text-xs text-primary mb-1">{comment.posts?.title}</p>
                                <p className="text-muted-foreground">"{comment.content}"</p>
                                <p className="text-[10px] mt-1 text-right">{new Date(comment.created_at).toLocaleDateString('vi-VN')}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="membership">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chương trình Thành viên</CardTitle>
                      <CardDescription>Tham gia để nhận nhiều ưu đãi đặc biệt</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                        <Star size={40} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Hạng Thành viên: Standard</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Bạn đang là thành viên cơ bản của JOG. Hãy tham gia nhiều giải chạy và mua sắm hơn để nâng cấp lên hạng Gold với nhiều đặc quyền hấp dẫn.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 border rounded-lg bg-yellow-50/50">
                          <p className="text-xs uppercase text-muted-foreground font-bold">Tích lũy</p>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-xs text-muted-foreground">điểm thưởng</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-xs uppercase text-muted-foreground font-bold">Giảm giá</p>
                          <p className="text-2xl font-bold">0%</p>
                          <p className="text-xs text-muted-foreground">cho đơn hàng</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-xs uppercase text-muted-foreground font-bold">Quà tặng</p>
                          <p className="text-2xl font-bold">1</p>
                          <p className="text-xs text-muted-foreground">đang chờ</p>
                        </div>
                      </div>
                      <Button className="px-12">Nâng cấp ngay</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
