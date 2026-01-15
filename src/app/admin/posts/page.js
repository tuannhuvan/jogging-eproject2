"use client"

/**
 * ADMIN POSTS PAGE - Trang quản lý tin tức và blog
 * 
 * Trang này hiển thị danh sách các bài viết về kiến thức chạy bộ
 * Admin có thể xem, tìm kiếm và quản lý trạng thái xuất bản
 * 
 * Dữ liệu được lưu trữ trong bảng 'posts' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý tin tức và blog
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function PostsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tiêu đề bài viết
    { key: 'title', label: 'Tiêu đề bài viết' },
    // Cột tên tác giả
    { key: 'author_name', label: 'Tác giả' },
    // Cột chuyên mục
    { key: 'category', label: 'Chuyên mục' },
    // Cột trạng thái với badge màu sắc
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'published' ? 'bg-green-100 text-green-700' :  // Đã xuất bản - màu xanh
        'bg-yellow-100 text-yellow-700'                         // Bản nháp - màu vàng
      }`}>
        {val === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Tin tức & Blog" table="posts" columns={columns} searchField="title" />
}
