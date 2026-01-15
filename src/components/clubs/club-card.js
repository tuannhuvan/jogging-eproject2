"use client"

/**
 * CLUB CARD COMPONENT - Thẻ hiển thị thông tin câu lạc bộ
 * 
 * Component này hiển thị thông tin tóm tắt của một câu lạc bộ
 * Bao gồm: hình ảnh, tên, địa điểm, ngày thành lập, mô tả và thống kê
 */

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Component thẻ câu lạc bộ
 * @param {Object} club - Dữ liệu câu lạc bộ từ database
 * @param {number} club.id - ID của câu lạc bộ
 * @param {string} club.name - Tên câu lạc bộ
 * @param {string} club.image_url - URL hình ảnh đại diện
 * @param {string} club.location - Địa điểm hoạt động
 * @param {string} club.founding_date - Ngày thành lập
 * @param {string} club.description - Mô tả ngắn về câu lạc bộ
 * @param {string} club.status - Trạng thái hoạt động
 */
export function ClubCard({ club }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Phần hình ảnh đại diện */}
      <div className="relative h-48 overflow-hidden">
          <Image
            src={club.image_url || 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800'}
            alt={club.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        {/* Lớp phủ gradient xuất hiện khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Badge trạng thái ở góc trên phải */}
        <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
          {club.status || 'Đang hoạt động'}
        </Badge>
      </div>
      
      {/* Phần nội dung chính */}
      <CardContent className="p-6 flex-grow">
        {/* Tên câu lạc bộ */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {club.name}
        </h3>
        
        {/* Thông tin địa điểm và ngày thành lập */}
        <div className="space-y-2 mb-4">
          {/* Địa điểm hoạt động */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="line-clamp-1">{club.location || 'Chưa cập nhật địa điểm'}</span>
          </div>
          {/* Ngày thành lập */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>Thành lập: {club.founding_date ? new Date(club.founding_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
          </div>
        </div>
        
        {/* Mô tả ngắn về câu lạc bộ */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {club.description || 'Chưa có mô tả cho câu lạc bộ này.'}
        </p>
      </CardContent>
      
      {/* Phần thống kê: số thành viên và số sự kiện */}
      <CardFooter className="p-6 pt-0 mt-auto border-t flex items-center justify-between">
        {/* Số lượng thành viên */}
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">250+</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Thành viên</span>
        </div>
        {/* Số sự kiện mỗi tháng */}
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-primary">12</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Sự kiện/tháng</span>
        </div>
      </CardFooter>
      
      {/* Nút xem chi tiết */}
      <div className="px-6 pb-6">
        <Link href={`/clubs/${club.id}`} className="w-full">
          <Button className="w-full gap-2 group/btn">
            Xem chi tiết
            {/* Icon mũi tên có animation khi hover */}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
