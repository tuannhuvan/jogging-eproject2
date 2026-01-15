"use client"

/**
 * ADMIN REPORTS PAGE - Trang báo cáo thống kê
 * 
 * Trang này hiển thị các biểu đồ thống kê:
 * - Biểu đồ cột: Lượt đăng ký theo tháng
 * - Biểu đồ đường: Doanh thu theo tháng
 * - Biểu đồ tròn: Phân bổ cự ly giải chạy
 * 
 * Sử dụng thư viện Recharts để vẽ biểu đồ
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { PieChart, Pie, Cell } from 'recharts'

/**
 * Component trang báo cáo thống kê
 * Hiển thị các biểu đồ với dữ liệu demo
 */
export default function ReportsPage() {
  // State lưu dữ liệu thống kê cho các biểu đồ
  const [stats, setStats] = useState({
    registrations: [], // Dữ liệu lượt đăng ký theo tháng
    revenue: [],       // Dữ liệu doanh thu theo tháng
    eventDistribution: [] // Dữ liệu phân bổ cự ly
  })

  // Effect: Tải dữ liệu khi component mount
  useEffect(() => {
    // Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu từ database
    // Hiện tại sử dụng dữ liệu demo để hiển thị biểu đồ
    setStats({
      // Dữ liệu lượt đăng ký theo tháng (T1-T6)
      registrations: [
        { name: 'T1', count: 400 },
        { name: 'T2', count: 300 },
        { name: 'T3', count: 600 },
        { name: 'T4', count: 800 },
        { name: 'T5', count: 500 },
        { name: 'T6', count: 900 },
      ],
      // Dữ liệu doanh thu theo tháng ($)
      revenue: [
        { name: 'T1', amount: 4000 },
        { name: 'T2', amount: 3000 },
        { name: 'T3', amount: 2000 },
        { name: 'T4', amount: 2780 },
        { name: 'T5', amount: 1890 },
        { name: 'T6', amount: 2390 },
      ],
      // Dữ liệu phân bổ theo cự ly
      eventDistribution: [
        { name: 'Marathon', value: 400 },      // 42km
        { name: 'Half Marathon', value: 300 }, // 21km
        { name: '10km', value: 300 },
        { name: '5km', value: 200 },
      ]
    })
  }, [])

  // Mảng màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <h2 className="text-xl font-semibold">Báo cáo thống kê</h2>
      
      {/* Grid chứa các biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biểu đồ 1: Lượt đăng ký theo tháng (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Lượt đăng ký theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.registrations}>
                {/* Lưới ngang */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {/* Trục X: Tháng */}
                <XAxis dataKey="name" />
                {/* Trục Y: Số lượng */}
                <YAxis />
                {/* Tooltip khi hover */}
                <Tooltip />
                {/* Cột biểu đồ màu tím */}
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 2: Doanh thu theo tháng (Line Chart) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Doanh thu ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenue}>
                {/* Lưới ngang */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {/* Trục X: Tháng */}
                <XAxis dataKey="name" />
                {/* Trục Y: Số tiền */}
                <YAxis />
                {/* Tooltip khi hover */}
                <Tooltip />
                {/* Đường biểu đồ màu xanh lá */}
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 3: Phân bổ cự ly (Pie Chart - Donut) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase">Phân bổ cự ly giải chạy</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.eventDistribution}
                  cx="50%"        // Vị trí tâm theo chiều ngang
                  cy="50%"        // Vị trí tâm theo chiều dọc
                  innerRadius={60} // Bán kính trong (tạo hình donut)
                  outerRadius={80} // Bán kính ngoài
                  paddingAngle={5} // Khoảng cách giữa các phần
                  dataKey="value"
                >
                  {/* Gán màu sắc cho từng phần */}
                  {stats.eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* Tooltip khi hover */}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
