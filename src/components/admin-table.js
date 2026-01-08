"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, MoreHorizontal, Trash2, Edit } from 'lucide-react'

export function AdminTable({ 
  title, 
  table, 
  columns, 
  searchField = 'name' 
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setData(data)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Lỗi khi xóa: ' + error.message)
    } else {
      setData(data.filter(item => item.id !== id))
    }
  }

  async function handleAddSample() {
    const sampleData = {
      events: { title: 'Giải chạy Marathon Mẫu ' + Date.now(), date: new Date().toISOString(), location: 'Hà Nội', status: 'published' },
      registrations: { athlete_name: 'Vận động viên Mẫu', event_title: 'Giải Marathon 2026', distance: '21km', status: 'confirmed' },
      clubs: { name: 'CLB Chạy Bộ Mẫu ' + Date.now(), location: 'Đà Nẵng', member_count: 50, status: 'active' },
      posts: { title: 'Tin tức mẫu mới nhất ' + Date.now(), author_name: 'Admin', category: 'Chạy bộ', status: 'published' },
      sponsors: { name: 'Nhà tài trợ Mẫu ' + Date.now(), tier: 'gold', website_url: 'https://example.com' },
      reviews: { user_name: 'Người dùng Mẫu', rating: 5, comment: 'Dịch vụ tuyệt vời! ' + Date.now() },
    }

    const dataToInsert = sampleData[table] || { created_at: new Date().toISOString() }
    
    const { data: inserted, error } = await supabase
      .from(table)
      .insert([dataToInsert])
      .select()
    
    if (error) {
      alert('Lỗi khi thêm: ' + error.message)
    } else if (inserted) {
      setData([inserted[0], ...data])
    }
  }

  const filteredData = data.filter(item => 
    String(item[searchField] || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddSample}>
          <Plus className="w-4 h-4 mr-2" /> Thêm mới (Mẫu)
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-500">
                  Không tìm thấy dữ liệu
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
