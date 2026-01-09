"use client"

import { AdminTable } from '@/components/admin-table'

export default function SponsorsPage() {
  const columns = [
    { key: 'name', label: 'Tên nhà tài trợ' },
    { key: 'tier', label: 'Hạng', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs uppercase ${
        val === 'gold' ? 'bg-yellow-100 text-yellow-700 font-bold' : 
        val === 'silver' ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {val}
      </span>
    )},
    { key: 'website_url', label: 'Website', render: (val) => val ? <a href={val} target="_blank" className="text-blue-600 hover:underline">{val}</a> : '-' },
  ]

  return <AdminTable title="Quản lý Nhà tài trợ" table="sponsors" columns={columns} searchField="name" />
}
