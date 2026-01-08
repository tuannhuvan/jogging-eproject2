"use client"

import { AdminTable } from '@/components/admin-table'

export default function OrdersPage() {
  const columns = [
    { key: 'id', label: 'Mã đơn hàng' },
    { key: 'full_name', label: 'Khách hàng' },
    { key: 'total_amount', label: 'Tổng tiền', render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) },
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {val === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
      </span>
    )},
    { key: 'created_at', label: 'Ngày đặt', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Đơn hàng" table="orders" columns={columns} searchField="full_name" />
}
