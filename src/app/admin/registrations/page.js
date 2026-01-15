"use client"

/**
 * ADMIN REGISTRATIONS PAGE - Trang quản lý đăng ký tham gia sự kiện
 * 
 * Trang này hiển thị danh sách các đăng ký tham gia giải chạy
 * Admin có thể xem, tìm kiếm và quản lý trạng thái đăng ký
 * 
 * Dữ liệu được lưu trữ trong bảng 'registrations' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý đăng ký tham gia
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function RegistrationsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên vận động viên
    { key: 'athlete_name', label: 'Vận động viên' },
    // Cột tên giải chạy
    { key: 'event_title', label: 'Giải chạy' },
    // Cột cự ly tham gia
    { key: 'distance', label: 'Cự ly' },
    // Cột trạng thái với badge màu sắc
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'confirmed' ? 'bg-green-100 text-green-700' :  // Đã xác nhận - màu xanh
        'bg-blue-100 text-blue-700'                             // Chờ xử lý - màu xanh dương
      }`}>
        {val === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Đăng ký tham gia" table="registrations" columns={columns} searchField="athlete_name" />
}
