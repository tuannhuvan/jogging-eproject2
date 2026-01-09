"use client"

import { AdminTable } from '@/components/admin-table'

// Trang quản lý sự kiện và giải chạy
export default function EventsPage() {
  const columns = [
    { key: 'title', label: 'Tên giải chạy' },
    { key: 'date', label: 'Ngày diễn ra', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
    { key: 'location', label: 'Địa điểm' },
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {val === 'published' ? 'Đang diễn ra' : 'Bản nháp'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Sự kiện & Giải chạy" table="events" columns={columns} searchField="title" />
}
