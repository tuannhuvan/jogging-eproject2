"use client"

/**
 * ADMIN ORDERS PAGE - Trang quản lý đơn hàng
 * 
 * Trang này hiển thị danh sách các đơn hàng từ cửa hàng
 * Admin có thể xem, tìm kiếm và quản lý trạng thái đơn hàng
 * 
 * Dữ liệu được lưu trữ trong bảng 'orders' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý đơn hàng
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function OrdersPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột mã đơn hàng
    { key: 'id', label: 'Mã đơn hàng' },
    // Cột tên khách hàng
    { key: 'full_name', label: 'Khách hàng' },
    // Cột tổng tiền - format theo định dạng tiền tệ Việt Nam
    { key: 'total_amount', label: 'Tổng tiền', render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) },
    // Cột trạng thái với badge màu sắc
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'completed' ? 'bg-green-100 text-green-700' :  // Hoàn tất - màu xanh
        'bg-blue-100 text-blue-700'                            // Đang xử lý - màu xanh dương
      }`}>
        {val === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
      </span>
    )},
    // Cột ngày đặt - format theo định dạng ngày Việt Nam
    { key: 'created_at', label: 'Ngày đặt', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Đơn hàng" table="orders" columns={columns} searchField="full_name" />
}
