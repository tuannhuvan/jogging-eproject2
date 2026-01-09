"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { 
  Users, MapPin, Calendar, Trophy, Image as ImageIcon, Video, 
  MessageSquare, Heart, Share2, Plus, CheckCircle2, UserPlus,
  ShieldCheck, Star, User, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

// Trang chi tiết câu lạc bộ chạy bộ
export default function ClubDetailPage() {
  const { id } = useParams()
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState(null)

  // Tải dữ liệu câu lạc bộ khi component được gắn kết
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const clubData = await api.getClubById(id)
        setClub(clubData)
        
        const membersData = await api.getClubMembers(id)
        setMembers(membersData || [])

        const postsData = await api.getClubPosts(id)
        setPosts(postsData || [])

        if (user) {
          const status = await api.getFollowStatus(id, user.id)
          setIsFollowing(status)
        }
      } catch (error) {
        console.error('Error fetching club data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Hàm xử lý theo dõi / hủy theo dõi câu lạc bộ
  const handleFollow = async () => {
    if (!user) return alert('Vui lòng đăng nhập để theo dõi')
    try {
      await api.toggleFollowClub(id, user.id, isFollowing)
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )

  if (!club) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy câu lạc bộ</div>

  // Hàm lấy badge vai trò thành viên
  const getRoleBadge = (role) => {
    const roles = {
      president: { label: 'Chủ tịch', color: 'bg-red-500', icon: <ShieldCheck className="w-3 h-3" /> },
      vice_president: { label: 'Phó chủ tịch', color: 'bg-orange-500', icon: <ShieldCheck className="w-3 h-3" /> },
      board_member: { label: 'Ban quản trị', color: 'bg-blue-500', icon: <Star className="w-3 h-3" /> },
      official_member: { label: 'Thành viên chính thức', color: 'bg-green-500', icon: <UserCheck className="w-3 h-3" /> },
      online_member: { label: 'Thành viên online', color: 'bg-slate-500', icon: <User className="w-3 h-3" /> },
    }
    const r = roles[role] || roles.online_member
    return (
      <Badge className={`${r.color} flex items-center gap-1`}>
        {r.icon} {r.label}
      </Badge>
    )
  }

  // Hiển thị nội dung trang chi tiết câu lạc bộ
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Central Photo / Hero */}
      <div className="relative h-[400px] w-full">
        <Image
          src={club.image_url || 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200'}
          alt={club.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">
                {club.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium opacity-90">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-primary" />
                  {club.location || 'Chưa xác định'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-primary" />
                  Thành lập: {club.founding_date ? new Date(club.founding_date).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-primary" />
                  {members.length} Thành viên
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleFollow}
                size="lg" 
                variant={isFollowing ? "outline" : "default"}
                className={`h-14 px-8 text-lg font-bold transition-all ${isFollowing ? 'bg-white/10 backdrop-blur-md text-white border-white/20' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isFollowing ? (
                  <><CheckCircle2 className="mr-2 w-6 h-6" /> Đã theo dõi</>
                ) : (
                  <><UserPlus className="mr-2 w-6 h-6" /> Theo dõi CLB</>
                )}
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14 p-0 bg-white/10 backdrop-blur-md text-white border-white/20">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="intro" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border h-auto flex flex-wrap justify-start">
            <TabsTrigger value="intro" className="px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
              Giới thiệu
            </TabsTrigger>
            <TabsTrigger value="members" className="px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
              Thành viên
            </TabsTrigger>
            <TabsTrigger value="activities" className="px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
              Hoạt động tập luyện
            </TabsTrigger>
            <TabsTrigger value="community" className="px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
              Ảnh & Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Về chúng tôi</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none text-muted-foreground">
                    <p>{club.description || 'Chưa có mô tả chi tiết cho câu lạc bộ này.'}</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <MapPin className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold">Địa điểm chính</div>
                            <div className="font-bold">{club.location || 'N/A'}</div>
                         </div>
                      </div>
                      <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                         <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                            <Calendar className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold">Ngày thành lập</div>
                            <div className="font-bold">{club.founding_date ? new Date(club.founding_date).toLocaleDateString('vi-VN') : 'N/A'}</div>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="border-none shadow-lg bg-accent text-white overflow-hidden">
                   <div className="p-6 relative">
                      <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                      <h3 className="text-xl font-bold mb-4">Thành tích CLB</h3>
                      <div className="space-y-4 relative z-10">
                         <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span className="opacity-80">Tổng quãng đường</span>
                            <span className="font-bold text-lg">12,450 km</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span className="opacity-80">Số giải đã tham gia</span>
                            <span className="font-bold text-lg">24</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="opacity-80">Thành viên tích cực</span>
                            <span className="font-bold text-lg">85%</span>
                         </div>
                      </div>
                   </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="border-none shadow-md hover:shadow-xl transition-all overflow-hidden text-center group">
                  <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20" />
                  <CardContent className="p-6 -mt-12">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback className="bg-muted text-2xl font-bold">
                        {member.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="text-lg font-bold mb-1">{member.profiles?.full_name || 'Runner'}</h4>
                    <div className="flex justify-center mb-4">
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                       <div>
                          <div className="font-bold text-foreground">150km</div>
                          <div>Tháng này</div>
                       </div>
                       <div>
                          <div className="font-bold text-foreground">12</div>
                          <div>Giải chạy</div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities">
             <Card className="border-none shadow-lg">
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead className="bg-muted/50 border-b">
                            <tr>
                               <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Vận động viên</th>
                               <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Quãng đường</th>
                               <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Thời gian</th>
                               <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Pace trung bình</th>
                               <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Ngày</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y">
                            {[1,2,3,4,5].map((i) => (
                               <tr key={i} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                           <AvatarFallback>R</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">Runner #{i}</div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono font-bold text-primary">{(Math.random() * 20 + 5).toFixed(1)} km</td>
                                  <td className="px-6 py-4 text-muted-foreground">01:{(Math.random() * 59).toFixed(0).padStart(2, '0')}:{(Math.random() * 59).toFixed(0).padStart(2, '0')}</td>
                                  <td className="px-6 py-4 font-mono">{(Math.random() * 2 + 5).toFixed(2)} /km</td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">Hôm nay, 06:30</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Khoảnh khắc thành viên</h3>
                <Button className="gap-2">
                   <Plus className="w-4 h-4" /> Đăng ảnh/video
                </Button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.length > 0 ? posts.map((post) => (
                   <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md">
                      <Image
                         src={post.media_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500'}
                         alt="Post"
                         fill
                         className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                         <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" /> {post.likes_count || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> 0</span>
                         </div>
                      </div>
                      {post.media_type === 'video' && (
                         <div className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white">
                            <Video className="w-4 h-4" />
                         </div>
                      )}
                   </div>
                )) : (
                   [1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md">
                         <Image
                            src={`https://images.unsplash.com/photo-${1550000000000 + i*1000}?w=500`}
                            alt="Mock"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                            Xem thêm
                         </div>
                      </div>
                   ))
                )}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Community Chat / Interaction */}
      <div className="fixed bottom-8 right-8 z-50">
         <Button className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center bg-accent hover:bg-accent/90 border-4 border-white">
            <MessageSquare className="w-8 h-8 text-white" />
         </Button>
      </div>
    </div>
  )
}
