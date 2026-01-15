"use client"

/**
 * AUTH CONTEXT - Quản lý xác thực người dùng
 * 
 * Context này cung cấp:
 * - Trạng thái đăng nhập của người dùng
 * - Thông tin profile người dùng
 * - Các hàm đăng nhập, đăng ký, đăng xuất
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

// Tạo Context với giá trị mặc định là undefined
const AuthContext = createContext(undefined)

/**
 * AuthProvider - Component bao bọc ứng dụng để cung cấp context xác thực
 * @param {React.ReactNode} children - Các component con cần được bao bọc
 */
export function AuthProvider({ children }) {
  // State lưu thông tin user từ Supabase Auth
  const [user, setUser] = useState(null)
  // State lưu thông tin profile từ bảng profiles
  const [profile, setProfile] = useState(null)
  // State theo dõi trạng thái đang tải
  const [loading, setLoading] = useState(true)

  // Effect kiểm tra session và lắng nghe thay đổi trạng thái xác thực
  useEffect(() => {
    // Kiểm tra session hiện tại khi app khởi động
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Nếu có user, lấy thông tin profile
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Đăng ký listener để lắng nghe thay đổi trạng thái auth
    // (đăng nhập, đăng xuất, refresh token, ...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // Cleanup: hủy subscription khi component unmount
    return () => subscription.unsubscribe()
  }, [])

  /**
   * Lấy thông tin profile của người dùng từ bảng profiles
   * @param {string} userId - ID của người dùng
   */
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    setProfile(data)
    setLoading(false)
  }

  /**
   * Hàm đăng nhập bằng email và password
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Object} Object chứa error nếu có lỗi
   */
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  /**
   * Hàm đăng ký tài khoản mới
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @param {string} fullName - Họ tên đầy đủ
   * @param {string} role - Vai trò (mặc định: 'user')
   * @returns {Object} Object chứa error nếu có lỗi
   */
  async function signUp(email, password, fullName, role = 'user') {
    // Bước 1: Đăng ký user với Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    
    // Bước 2: Tạo profile trong bảng profiles (nếu đăng ký thành công)
    if (!error && data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role
      })
    }
    
    return { error }
  }

  /**
   * Hàm đăng xuất người dùng
   * Xóa session và reset state về null
   */
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  /**
   * Hàm làm mới thông tin profile
   * Được gọi sau khi cập nhật profile để đồng bộ state
   */
  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook để sử dụng AuthContext trong các component
 * @returns {Object} Object chứa: user, profile, loading, signIn, signUp, signOut
 * @throws {Error} Nếu được gọi ngoài AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
