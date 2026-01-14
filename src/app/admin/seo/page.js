"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Globe, Share2 } from 'lucide-react'

// Trang phân tích và cấu hình SEO
export default function SEOPage() {
  const [seo, setSeo] = useState({
    title: 'Cổng thông tin chạy bộ - Giải chạy marathon toàn quốc',
    description: 'Nơi cập nhật thông tin giải chạy, đăng ký tham gia marathon và kết nối cộng đồng chạy bộ Việt Nam.',
    keywords: 'chạy bộ, marathon, giải chạy, jogging, vận động viên'
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Phân tích & Cấu hình SEO</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Cập nhật Metadata</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <Globe className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <div className="text-2xl font-bold">85/100</div>
          <div className="text-xs text-slate-500 uppercase">Điểm SEO</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <Search className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold">1.2k</div>
          <div className="text-xs text-slate-500 uppercase">Từ khóa index</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <Share2 className="w-8 h-8 mx-auto text-orange-500 mb-2" />
          <div className="text-2xl font-bold">450</div>
          <div className="text-xs text-slate-500 uppercase">Backlinks</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="space-y-2">
          <Label>Tiêu đề trang (Meta Title)</Label>
          <Input 
            value={seo.title} 
            onChange={(e) => setSeo({...seo, title: e.target.value})}
          />
          <p className="text-xs text-slate-500">{seo.title.length}/60 ký tự</p>
        </div>

        <div className="space-y-2">
          <Label>Mô tả (Meta Description)</Label>
          <Textarea 
            value={seo.description} 
            onChange={(e) => setSeo({...seo, description: e.target.value})}
            rows={4}
          />
          <p className="text-xs text-slate-500">{seo.description.length}/160 ký tự</p>
        </div>

        <div className="space-y-2">
          <Label>Từ khóa (Keywords)</Label>
          <Input 
            value={seo.keywords} 
            onChange={(e) => setSeo({...seo, keywords: e.target.value})}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold mb-4 text-slate-700">Xem trước trên Google</h3>
        <div className="border border-slate-100 p-4 rounded bg-slate-50">
          <div className="text-blue-800 text-xl hover:underline cursor-pointer mb-1">{seo.title}</div>
          <div className="text-green-700 text-sm mb-1">https://jogging-portal.vn › marathon</div>
          <div className="text-slate-600 text-sm line-clamp-2">{seo.description}</div>
        </div>
      </div>
    </div>
  )
}
