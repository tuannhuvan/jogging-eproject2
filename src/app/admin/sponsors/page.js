"use client"

/**
 * ADMIN SPONSORS PAGE - Trang quản lý nhà tài trợ
 * 
 * Trang này hiển thị danh sách các nhà tài trợ của các sự kiện chạy bộ
 * Sử dụng component AdminTable để hiển thị và quản lý dữ liệu
 * 
 * Dữ liệu được lưu trữ trong bảng 'sponsors' của Supabase
 */

import { AdminTable } from '@/components/admin-table'

/**
 * Component trang quản lý nhà tài trợ
 * Sử dụng AdminTable với cấu hình columns phù hợp
 */
export default function SponsorsPage() {
  /**
   * Cấu hình các cột hiển thị trong bảng
   * - key: Tên trường trong database
   * - label: Tiêu đề cột hiển thị
   * - render: Hàm tùy chỉnh cách hiển thị giá trị (optional)
   */
  const columns = [
    // Cột tên nhà tài trợ
    { key: 'name', label: 'Tên nhà tài trợ' },
    // Cột hạng tài trợ với badge màu sắc theo cấp độ
    { key: 'tier', label: 'Hạng', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs uppercase ${
        val === 'gold' ? 'bg-yellow-100 text-yellow-700 font-bold' :   // Hạng vàng
        val === 'silver' ? 'bg-slate-100 text-slate-700' :             // Hạng bạc
        'bg-orange-100 text-orange-700'                                 // Hạng đồng
      }`}>
        {val}
      </span>
    )},
    // Cột website với link có thể click
    { key: 'website_url', label: 'Website', render: (val) => val ? <a href={val} target="_blank" className="text-blue-600 hover:underline">{val}</a> : '-' },
  ]

  return <AdminTable title="Quản lý Nhà tài trợ" table="sponsors" columns={columns} searchField="name" />
}
