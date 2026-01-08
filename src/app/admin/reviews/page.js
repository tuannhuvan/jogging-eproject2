"use client"

import { AdminTable } from '@/components/admin-table'

export default function ReviewsPage() {
  const columns = [
    { key: 'user_name', label: 'Người đánh giá' },
    { key: 'rating', label: 'Số sao', render: (val) => '⭐'.repeat(val) },
    { key: 'comment', label: 'Nội dung' },
    { key: 'created_at', label: 'Ngày gửi', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
  ]

  return <AdminTable title="Quản lý Đánh giá" table="reviews" columns={columns} searchField="comment" />
}
