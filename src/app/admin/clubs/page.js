"use client"

import { AdminTable } from '@/components/admin-table'

export default function ClubsPage() {
  const columns = [
    { key: 'name', label: 'Tên câu lạc bộ' },
    { key: 'location', label: 'Khu vực' },
    { key: 'member_count', label: 'Thành viên' },
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
      }`}>
        {val === 'active' ? 'Hoạt động' : 'Tạm dừng'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Câu lạc bộ" table="clubs" columns={columns} searchField="name" />
}
