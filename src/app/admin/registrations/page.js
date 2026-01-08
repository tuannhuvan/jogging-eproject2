"use client"

import { AdminTable } from '@/components/admin-table'

export default function RegistrationsPage() {
  const columns = [
    { key: 'athlete_name', label: 'Vận động viên' },
    { key: 'event_title', label: 'Giải chạy' },
    { key: 'distance', label: 'Cự ly' },
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {val === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Đăng ký tham gia" table="registrations" columns={columns} searchField="athlete_name" />
}
