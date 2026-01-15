"use client"

/**
 * AUTH PAGE - Trang đăng nhập/đăng ký
 * 
 * Trang này hiển thị:
 * - Form đăng nhập với email và mật khẩu
 * - Form đăng ký tài khoản mới
 * - Tabs chuyển đổi giữa đăng nhập và đăng ký
 * 
 * Route: /dang-nhap
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

/**
 * Component trang xác thực người dùng
 * Xử lý đăng nhập và đăng ký tài khoản
 */
export default function AuthPage() {
  const router = useRouter()
  // Lấy các hàm đăng nhập/đăng ký từ AuthContext
  const { signIn, signUp } = useAuth()
  // State theo dõi trạng thái đang xử lý
  const [loading, setLoading] = useState(false)
  // State toggle hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false)

  // State dữ liệu form đăng nhập
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  // State dữ liệu form đăng ký
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  /**
   * Hàm xử lý đăng nhập
   * @param {Event} e - Sự kiện submit form
   */
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(loginData.email, loginData.password)

    if (error) {
      toast.error('Email hoặc mật khẩu không đúng')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      toast.success('Đăng nhập thành công')
      
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  /**
   * Hàm xử lý đăng ký
   * @param {Event} e - Sự kiện submit form
   */
  async function handleRegister(e) {
    e.preventDefault()
    
    // Kiểm tra mật khẩu khớp
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu không khớp')
      return
    }

    // Kiểm tra độ dài mật khẩu
    if (registerData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    // Gọi hàm đăng ký từ AuthContext
    const { error } = await signUp(registerData.email, registerData.password, registerData.fullName)

    if (error) {
      toast.error('Không thể đăng ký. Vui lòng thử lại.')
    } else {
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo và tên ứng dụng */}
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JOG.com.vn
            </span>
          </Link>
          <CardTitle>Chào mừng bạn đến với JOG</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs chuyển đổi đăng nhập/đăng ký */}
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            {/* Tab đăng nhập */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Trường Email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                {/* Trường Mật khẩu với toggle hiển thị */}
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    {/* Nút toggle hiển thị mật khẩu */}
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </form>
            </TabsContent>

            {/* Tab đăng ký */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Trường Họ và tên */}
                <div className="space-y-2">
                  <Label htmlFor="register-name">Họ và tên</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    required
                  />
                </div>
                {/* Trường Email */}
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                {/* Trường Mật khẩu */}
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Trường Xác nhận mật khẩu */}
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Xác nhận mật khẩu</Label>
                  <Input
                    id="register-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
