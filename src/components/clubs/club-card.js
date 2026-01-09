"use client"

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ClubCard({ club }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={club.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'}
          alt={club.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
          {club.status || 'Đang hoạt động'}
        </Badge>
      </div>
      
      <CardContent className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {club.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="line-clamp-1">{club.location || 'Chưa cập nhật địa điểm'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>Thành lập: {club.founding_date ? new Date(club.founding_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {club.description || 'Chưa có mô tả cho câu lạc bộ này.'}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto border-t flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">250+</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Thành viên</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-primary">12</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Sự kiện/tháng</span>
        </div>
      </CardFooter>
      
      <div className="px-6 pb-6">
        <Link href={`/clubs/${club.id}`} className="w-full">
          <Button className="w-full gap-2 group/btn">
            Xem chi tiết
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
