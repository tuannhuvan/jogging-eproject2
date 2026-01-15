"use client"

/**
 * ADMIN EVENTS PAGE - Trang quản lý sự kiện và giải chạy
 * 
 * Trang này hiển thị danh sách các sự kiện chạy bộ
 * Admin có thể xem, tìm kiếm và quản lý trạng thái sự kiện
 * 
 * Dữ liệu được lưu trữ trong bảng 'events' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý sự kiện
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function EventsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên giải chạy
    { key: 'title', label: 'Tên giải chạy' },
    // Cột ngày diễn ra - format theo định dạng ngày Việt Nam
    { key: 'date', label: 'Ngày diễn ra', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
    // Cột địa điểm tổ chức
    { key: 'location', label: 'Địa điểm' },
    // Cột trạng thái với badge màu sắc
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'published' ? 'bg-green-100 text-green-700' :  // Đang diễn ra - màu xanh
        'bg-yellow-100 text-yellow-700'                         // Bản nháp - màu vàng
      }`}>
        {val === 'published' ? 'Đang diễn ra' : 'Bản nháp'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Sự kiện & Giải chạy" table="events" columns={columns} searchField="title" />
}
