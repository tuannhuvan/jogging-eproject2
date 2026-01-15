"use client"

/**
 * ADMIN SETTINGS PAGE - Trang cài đặt hệ thống
 * 
 * Trang này cho phép admin cấu hình các thiết lập chung của hệ thống:
 * - Tên cổng thông tin
 * - Email liên hệ
 * - Bật/tắt chức năng đăng ký mới
 * - Bật/tắt chế độ bảo trì
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

/**
 * Component trang cài đặt hệ thống
 * Hiển thị form cấu hình các thiết lập chung
 */
export default function SettingsPage() {
  // State lưu các thiết lập hệ thống
  const [settings, setSettings] = useState({
    siteName: 'Jogging Portal',       // Tên cổng thông tin
    contactEmail: 'admin@jogging.com', // Email liên hệ
    enableRegistration: true,          // Cho phép đăng ký mới
    maintenanceMode: false             // Chế độ bảo trì
  })

  return (
    <div className="max-w-2xl space-y-8">
      {/* Tiêu đề trang */}
      <h2 className="text-xl font-semibold">Cài đặt hệ thống</h2>
      
      {/* Form cài đặt */}
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Trường: Tên cổng thông tin */}
        <div className="space-y-2">
          <Label>Tên cổng thông tin</Label>
          <Input 
            value={settings.siteName} 
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
          />
        </div>

        {/* Trường: Email liên hệ */}
        <div className="space-y-2">
          <Label>Email liên hệ</Label>
          <Input 
            type="email"
            value={settings.contactEmail} 
            onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
          />
        </div>

        {/* Toggle: Cho phép đăng ký mới */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cho phép đăng ký mới</Label>
            <p className="text-sm text-slate-500">Mở cổng đăng ký cho vận động viên</p>
          </div>
          <Switch 
            checked={settings.enableRegistration}
            onCheckedChange={(val) => setSettings({...settings, enableRegistration: val})}
          />
        </div>

        {/* Toggle: Chế độ bảo trì */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Chế độ bảo trì</Label>
            <p className="text-sm text-slate-500">Tạm dừng truy cập phía người dùng</p>
          </div>
          <Switch 
            checked={settings.maintenanceMode}
            onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})}
          />
        </div>

        {/* Nút lưu cấu hình */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Lưu cấu hình</Button>
      </div>
    </div>
  )
}
