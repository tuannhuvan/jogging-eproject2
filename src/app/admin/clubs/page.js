"use client"

/**
 * ADMIN CLUBS PAGE - Trang quản lý câu lạc bộ
 * 
 * Trang này hiển thị danh sách các câu lạc bộ chạy bộ
 * Admin có thể xem, tìm kiếm và quản lý trạng thái câu lạc bộ
 * 
 * Dữ liệu được lưu trữ trong bảng 'clubs' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý câu lạc bộ
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function ClubsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên câu lạc bộ
    { key: 'name', label: 'Tên câu lạc bộ' },
    // Cột khu vực hoạt động
    { key: 'location', label: 'Khu vực' },
    // Cột số lượng thành viên
    { key: 'member_count', label: 'Thành viên' },
    // Cột trạng thái với badge màu sắc
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'active' ? 'bg-green-100 text-green-700' :  // Hoạt động - màu xanh
        'bg-slate-100 text-slate-700'                       // Tạm dừng - màu xám
      }`}>
        {val === 'active' ? 'Hoạt động' : 'Tạm dừng'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Câu lạc bộ" table="clubs" columns={columns} searchField="name" />
}
