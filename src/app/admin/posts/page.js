"use client"

import { AdminTable } from '@/components/admin-table'

export default function PostsPage() {
  const columns = [
    { key: 'title', label: 'Tiêu đề bài viết' },
    { key: 'author_name', label: 'Tác giả' },
    { key: 'category', label: 'Chuyên mục' },
    { key: 'status', label: 'Trạng thái', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        val === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {val === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
      </span>
    )},
  ]

  return <AdminTable title="Quản lý Tin tức & Blog" table="posts" columns={columns} searchField="title" />
}
