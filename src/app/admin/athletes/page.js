"use client"

/**
 * ADMIN ATHLETES PAGE - Trang quản lý vận động viên
 * 
 * Trang này hiển thị danh sách các vận động viên (người dùng) trong hệ thống
 * Admin có thể xem, tìm kiếm và quản lý thông tin người dùng
 * 
 * Dữ liệu được lưu trữ trong bảng 'profiles' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý vận động viên
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function AthletesPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên vận động viên
    { key: 'full_name', label: 'Tên vận động viên' },
    // Cột email
    { key: 'email', label: 'Email' },
    // Cột vai trò với badge màu sắc
    { key: 'role', label: 'Vai trò', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'admin' ? 'bg-purple-100 text-purple-700 font-bold' :  // Quản trị - màu tím, in đậm
        'bg-blue-100 text-blue-700'                                     // Vận động viên - màu xanh dương
      }`}>
        {val === 'admin' ? 'Quản trị' : 'Vận động viên'}
      </span>
    )},
    // Cột ngày tham gia - format theo định dạng ngày Việt Nam
    { key: 'created_at', label: 'Ngày tham gia', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Vận động viên" table="profiles" columns={columns} searchField="full_name" />
}
