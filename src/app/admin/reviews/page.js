"use client"

/**
 * ADMIN REVIEWS PAGE - Trang quản lý đánh giá sản phẩm
 * 
 * Trang này hiển thị danh sách các đánh giá từ khách hàng
 * Admin có thể xem, tìm kiếm và xóa các đánh giá
 * 
 * Dữ liệu được lưu trữ trong bảng 'reviews' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý đánh giá
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function ReviewsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên người đánh giá
    { key: 'user_name', label: 'Người đánh giá' },
    // Cột số sao - hiển thị emoji sao theo số lượng
    { key: 'rating', label: 'Số sao', render: (val) => '⭐'.repeat(val) },
    // Cột nội dung đánh giá
    { key: 'comment', label: 'Nội dung' },
    // Cột ngày gửi - format theo định dạng ngày Việt Nam
    { key: 'created_at', label: 'Ngày gửi', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Đánh giá" table="reviews" columns={columns} searchField="comment" />
}
