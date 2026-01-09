"use client"

import { AdminTable } from '@/components/admin-table'

export default function AthletesPage() {
  const columns = [
    { key: 'full_name', label: 'Tên vận động viên' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Vai trò', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'admin' ? 'bg-purple-100 text-purple-700 font-bold' : 'bg-blue-100 text-blue-700'
      }`}>
        {val === 'admin' ? 'Quản trị' : 'Vận động viên'}
      </span>
    )},
    { key: 'created_at', label: 'Ngày tham gia', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Vận động viên" table="profiles" columns={columns} searchField="full_name" />
}
