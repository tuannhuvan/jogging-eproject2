"use client"

/**
 * CLUBS PAGE - Trang danh sách câu lạc bộ chạy bộ
 * 
 * Trang này hiển thị:
 * - Banner hero với tiêu đề và mô tả
 * - Thanh tìm kiếm và nút tạo câu lạc bộ mới
 * - Danh sách câu lạc bộ dạng grid
 * - Phần giải thích lợi ích khi tham gia câu lạc bộ
 * 
 * Route: /clubs
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, MapPin, Trophy, ArrowRight, Search, Plus, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

/**
 * Component trang danh sách câu lạc bộ
 * Hiển thị và cho phép tìm kiếm, tạo mới câu lạc bộ
 */
export default function ClubsPage() {
  // State lưu danh sách câu lạc bộ
  const [clubs, setClubs] = useState([])
  // State theo dõi trạng thái đang tải
  const [loading, setLoading] = useState(true)
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  // State quản lý trạng thái mở/đóng dialog tạo CLB
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // State theo dõi trạng thái đang tạo CLB
  const [creating, setCreating] = useState(false)
  
  // State lưu thông tin câu lạc bộ mới
  const [newClub, setNewClub] = useState({
    name: '',           // Tên CLB
    description: '',    // Mô tả
    location: '',       // Địa điểm
    founding_date: '',  // Ngày thành lập
    image_url: ''       // URL ảnh đại diện
  })

  // Effect: Tải danh sách câu lạc bộ khi component mount
  useEffect(() => {
    fetchClubs()
  }, [])

  /**
   * Hàm tải danh sách câu lạc bộ từ API
   */
  async function fetchClubs() {
    setLoading(true)
    try {
      const data = await api.getClubs()
      setClubs(data || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Hàm xử lý tạo câu lạc bộ mới
   * @param {Event} e - Sự kiện submit form
   */
  const handleCreateClub = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      // Chuẩn bị dữ liệu với ảnh mặc định nếu không có URL
      const clubData = {
        ...newClub,
        image_url: newClub.image_url || `https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800`
      }
      
      // Gọi API tạo câu lạc bộ
      const data = await api.createClub(clubData)
      
      // Thêm người tạo làm chủ tịch CLB
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('club_members').insert({
          club_id: data.id,
          profile_id: user.id,
          role: 'president'
        })
      }

      // Đóng dialog và reset form
      setIsDialogOpen(false)
      setNewClub({ name: '', description: '', location: '', founding_date: '', image_url: '' })
      fetchClubs()
      alert('Tạo câu lạc bộ thành công!')
    } catch (error) {
      console.error('Error creating club:', error)
      alert('Có lỗi xảy ra khi tạo câu lạc bộ')
    } finally {
      setCreating(false)
    }
  }

  // Lọc câu lạc bộ dựa trên từ khóa tìm kiếm
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Hero Section - Banner header */}
      <div className="bg-accent py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Cộng đồng Runner</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Tìm kiếm và gia nhập các câu lạc bộ chạy bộ để cùng nhau tập luyện và chia sẻ đam mê
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Thanh tìm kiếm và nút tạo CLB */}
        <Card className="mb-12 shadow-xl border-none">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Input tìm kiếm */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Tìm kiếm câu lạc bộ, khu vực..." 
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Dialog tạo câu lạc bộ mới */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="h-12 w-full md:w-auto gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Tạo câu lạc bộ mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Thành lập Câu lạc bộ</DialogTitle>
                    <DialogDescription>
                      Nhập thông tin để tạo cộng đồng chạy bộ của riêng bạn.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Form tạo câu lạc bộ */}
                  <form onSubmit={handleCreateClub} className="space-y-6 py-4">
                    {/* Tên CLB */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase text-muted-foreground">Tên Câu lạc bộ</label>
                      <Input 
                        required 
                        placeholder="Ví dụ: Hanoi Runners Club" 
                        value={newClub.name}
                        onChange={e => setNewClub({...newClub, name: e.target.value})}
                      />
                    </div>
                    {/* Ngày thành lập và Địa điểm */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Ngày thành lập</label>
                        <Input 
                          type="date" 
                          required 
                          value={newClub.founding_date}
                          onChange={e => setNewClub({...newClub, founding_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Địa điểm</label>
                        <Input 
                          required 
                          placeholder="Ví dụ: Hà Nội, Việt Nam" 
                          value={newClub.location}
                          onChange={e => setNewClub({...newClub, location: e.target.value})}
                        />
                      </div>
                    </div>
                    {/* Mô tả */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase text-muted-foreground">Mô tả câu lạc bộ</label>
                      <Textarea 
                        placeholder="Giới thiệu về mục tiêu, hoạt động của CLB..." 
                        className="min-h-[100px]"
                        value={newClub.description}
                        onChange={e => setNewClub({...newClub, description: e.target.value})}
                      />
                    </div>
                    {/* URL ảnh đại diện */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase text-muted-foreground">Ảnh đại diện (URL)</label>
                      <div className="flex gap-2">
                         <div className="flex-1">
                            <Input 
                              placeholder="Dán URL ảnh tại đây" 
                              value={newClub.image_url}
                              onChange={e => setNewClub({...newClub, image_url: e.target.value})}
                            />
                         </div>
                         <div className="w-12 h-10 border rounded flex items-center justify-center bg-muted">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                         </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">* Vị trí ảnh trung tâm cho CLB khi hiển thị trên danh sách.</p>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full h-12 font-bold" disabled={creating}>
                        {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...</> : 'Xác nhận tạo CLB'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách câu lạc bộ */}
        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-[350px] rounded-xl bg-white animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClubs.length > 0 ? (
                // Render danh sách câu lạc bộ
                filteredClubs.map((club) => (
                  <Card key={club.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-muted bg-white flex flex-col h-full text-center">
                    <CardContent className="p-8 flex flex-col flex-1">
                      {/* Tên CLB */}
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {club.name}
                      </h3>
                      
                      {/* Địa điểm */}
                      <div className="flex items-center justify-center gap-1 text-[#22c55e] font-medium text-sm mb-4">
                         <MapPin className="w-4 h-4" />
                         {club.location || 'Hà Nội, Việt Nam'}
                      </div>
  
                      {/* Mô tả */}
                      <p className="text-sm text-muted-foreground mb-8">
                        {club.description || 'CLB chạy bộ cộng đồng'}
                      </p>
                      
                      <div className="w-full h-[1px] bg-muted mb-8" />

                      {/* Thống kê */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="text-center">
                            <div className="text-2xl font-bold">{club.club_members?.[0]?.count || 250}+</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Thành viên</div>
                         </div>
                         <div className="text-center">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Sự kiện/tháng</div>
                         </div>
                      </div>
  
                      {/* Nút xem chi tiết */}
                      <Link href={`/clubs/${club.id}`} className="mt-auto">
                        <Button variant="outline" className="w-full h-14 font-bold text-base rounded-xl border-muted hover:bg-muted/50 flex items-center justify-center gap-2">
                          Xem chi tiết
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
            ) : (
              // Thông báo không tìm thấy
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Không tìm thấy câu lạc bộ nào</h3>
                <p className="text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phần lợi ích khi tham gia CLB */}
      <div className="container mx-auto px-4 mt-24">
        <h2 className="text-3xl font-bold text-center mb-16">Tại sao nên tham gia câu lạc bộ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {/* Lợi ích 1: Động lực */}
           <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:rotate-12 transition-all duration-300">
                 <Users className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Động lực tập luyện</h3>
              <p className="text-muted-foreground">Chạy cùng đồng đội giúp bạn duy trì kỷ luật và vượt qua những ngày lười biếng.</p>
           </div>
           {/* Lợi ích 2: Học hỏi */}
           <div className="text-center group">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:-rotate-12 transition-all duration-300">
                 <Trophy className="w-10 h-10 text-accent group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Học hỏi kinh nghiệm</h3>
              <p className="text-muted-foreground">Chia sẻ kiến thức về kỹ thuật, dinh dưỡng và trang thiết bị từ những runner đi trước.</p>
           </div>
           {/* Lợi ích 3: Kết nối */}
           <div className="text-center group">
              <div className="w-20 h-20 bg-chart-2/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-chart-2 group-hover:rotate-12 transition-all duration-300">
                 <ArrowRight className="w-10 h-10 text-chart-2 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kết nối xã hội</h3>
              <p className="text-muted-foreground">Mở rộng mối quan hệ và tìm thấy những người bạn có cùng sở thích chạy bộ.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
