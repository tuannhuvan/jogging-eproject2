"use client"

/**
 * ADMIN TABLE COMPONENT - Bảng quản trị dữ liệu
 * 
 * Component này cung cấp giao diện bảng để quản lý dữ liệu trong trang admin
 * Hỗ trợ: tìm kiếm, thêm mới, xóa và hiển thị dữ liệu từ Supabase
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, MoreHorizontal, Trash2, Edit } from 'lucide-react'

/**
 * Component bảng quản trị có thể tái sử dụng
 * @param {string} title - Tiêu đề của bảng
 * @param {string} table - Tên bảng trong Supabase
 * @param {Array} columns - Mảng định nghĩa các cột hiển thị
 * @param {string} searchField - Trường dùng để tìm kiếm (mặc định: 'name')
 */
export function AdminTable({ 
  title, 
  table, 
  columns, 
  searchField = 'name' 
}) {
  // State lưu trữ dữ liệu từ database
  const [data, setData] = useState([])
  // State theo dõi trạng thái đang tải
  const [loading, setLoading] = useState(true)
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    fetchData()
  }, [])

  /**
   * Hàm lấy dữ liệu từ Supabase
   * Sắp xếp theo thời gian tạo mới nhất
   */
  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setData(data)
    setLoading(false)
  }

  /**
   * Hàm xử lý xóa một mục dữ liệu
   * @param {number|string} id - ID của mục cần xóa
   */
  async function handleDelete(id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Lỗi khi xóa: ' + error.message)
    } else {
      // Cập nhật state để loại bỏ mục đã xóa khỏi danh sách
      setData(data.filter(item => item.id !== id))
    }
  }

  /**
   * Hàm thêm dữ liệu mẫu vào bảng
   * Dùng để test chức năng - mỗi bảng có dữ liệu mẫu khác nhau
   */
  async function handleAddSample() {
    // Định nghĩa dữ liệu mẫu cho từng loại bảng
    const sampleData = {
      events: { title: 'Giải chạy Marathon Mẫu ' + Date.now(), date: new Date().toISOString(), location: 'Hà Nội', status: 'published' },
      registrations: { athlete_name: 'Vận động viên Mẫu', event_title: 'Giải Marathon 2026', distance: '21km', status: 'confirmed' },
      clubs: { name: 'CLB Chạy Bộ Mẫu ' + Date.now(), location: 'Đà Nẵng', member_count: 50, status: 'active' },
      posts: { title: 'Tin tức mẫu mới nhất ' + Date.now(), author_name: 'Admin', category: 'Chạy bộ', status: 'published' },
      sponsors: { name: 'Nhà tài trợ Mẫu ' + Date.now(), tier: 'gold', website_url: 'https://example.com' },
      reviews: { user_name: 'Người dùng Mẫu', rating: 5, comment: 'Dịch vụ tuyệt vời! ' + Date.now() },
    }

    // Lấy dữ liệu mẫu tương ứng với bảng, hoặc tạo dữ liệu mặc định
    const dataToInsert = sampleData[table] || { created_at: new Date().toISOString() }
    
    // Thêm dữ liệu vào database
    const { data: inserted, error } = await supabase
      .from(table)
      .insert([dataToInsert])
      .select()
    
    if (error) {
      alert('Lỗi khi thêm: ' + error.message)
    } else if (inserted) {
      // Thêm mục mới vào đầu danh sách
      setData([inserted[0], ...data])
    }
  }

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter(item => 
    String(item[searchField] || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header: Tiêu đề và nút thêm mới */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddSample}>
          <Plus className="w-4 h-4 mr-2" /> Thêm mới (Mẫu)
        </Button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          {/* Header của bảng */}
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
          {/* Body của bảng */}
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              // Hiển thị khi đang tải dữ liệu
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              // Hiển thị khi không có dữ liệu
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-500">
                  Không tìm thấy dữ liệu
                </td>
              </tr>
            ) : (
              // Hiển thị danh sách dữ liệu
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {/* Render từng cột dữ liệu */}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  {/* Cột thao tác: Sửa và Xóa */}
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
