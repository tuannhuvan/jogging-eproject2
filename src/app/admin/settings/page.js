"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Jogging Portal',
    contactEmail: 'admin@jogging.com',
    enableRegistration: true,
    maintenanceMode: false
  })

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Cài đặt hệ thống</h2>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="space-y-2">
          <Label>Tên cổng thông tin</Label>
          <Input 
            value={settings.siteName} 
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>Email liên hệ</Label>
          <Input 
            type="email"
            value={settings.contactEmail} 
            onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
          />
        </div>

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

        <Button className="w-full bg-blue-600 hover:bg-blue-700">Lưu cấu hình</Button>
      </div>
    </div>
  )
}
