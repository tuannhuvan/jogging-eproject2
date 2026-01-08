"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { PieChart, Pie, Cell } from 'recharts'

export default function ReportsPage() {
  const [stats, setStats] = useState({
    registrations: [],
    revenue: [],
    eventDistribution: []
  })

  useEffect(() => {
    // In a real app, you would fetch real stats from DB
    // For now, let's use some dummy data for the report view
    setStats({
      registrations: [
        { name: 'T1', count: 400 },
        { name: 'T2', count: 300 },
        { name: 'T3', count: 600 },
        { name: 'T4', count: 800 },
        { name: 'T5', count: 500 },
        { name: 'T6', count: 900 },
      ],
      revenue: [
        { name: 'T1', amount: 4000 },
        { name: 'T2', amount: 3000 },
        { name: 'T3', amount: 2000 },
        { name: 'T4', amount: 2780 },
        { name: 'T5', amount: 1890 },
        { name: 'T6', amount: 2390 },
      ],
      eventDistribution: [
        { name: 'Marathon', value: 400 },
        { name: 'Half Marathon', value: 300 },
        { name: '10km', value: 300 },
        { name: '5km', value: 200 },
      ]
    })
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Báo cáo thống kê</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Lượt đăng ký theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.registrations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Doanh thu ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Phân bổ cự ly giải chạy</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.eventDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
