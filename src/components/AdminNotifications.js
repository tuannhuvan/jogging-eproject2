/**
 * ADMIN NOTIFICATIONS COMPONENT - Component thông báo cho admin
 * 
 * Chức năng:
 * - Hiển thị số lượng thông báo chưa đọc trên biểu tượng chuông
 * - Dropdown hiển thị danh sách thông báo mới nhất
 * - Tự động lấy thông báo từ bảng notifications + đơn hàng mới + đăng ký sự kiện
 * - Click vào thông báo sẽ chuyển đến trang tương ứng
 * - Đánh dấu đã đọc khi click
 */
"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bell, Package, Calendar, Star, X, CheckCheck } from 'lucide-react'

export default function AdminNotifications() {
  // === STATE ===
  // Danh sách thông báo
  const [notifications, setNotifications] = useState([])
  // Số lượng chưa đọc
  const [unreadCount, setUnreadCount] = useState(0)
  // Trạng thái mở/đóng dropdown
  const [isOpen, setIsOpen] = useState(false)
  // Loading
  const [loading, setLoading] = useState(true)
  // Ref để xử lý click outside
  const dropdownRef = useRef(null)
  const router = useRouter()

  // === LOAD NOTIFICATIONS ===
  useEffect(() => {
    fetchNotifications()
    // Tự động refresh mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // === CLICK OUTSIDE HANDLER ===
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Lấy danh sách thông báo từ nhiều nguồn:
   * 1. Bảng notifications (thông báo thủ công)
   * 2. Đơn hàng mới (pending, trong 24h)
   * 3. Đăng ký sự kiện mới (trong 24h) - nếu bảng tồn tại
   */
  async function fetchNotifications() {
    setLoading(true)
    const allNotifications = []
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // 1. Lấy thông báo từ bảng notifications
    const { data: dbNotifications } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (dbNotifications) {
      dbNotifications.forEach(n => {
        allNotifications.push({
          id: `notif-${n.id}`,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.is_read,
          createdAt: n.created_at,
          icon: getIconForType(n.type)
        })
      })
    }

    // 2. Lấy đơn hàng mới (pending hoặc chưa xác nhận trong 24h)
    const { data: newOrders } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount, status, created_at')
      .eq('status', 'pending')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
      .limit(5)

    if (newOrders) {
      newOrders.forEach(order => {
        allNotifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'Đơn hàng mới',
          message: `${order.customer_name || 'Khách hàng'} - ${formatCurrency(order.total_amount)}`,
          link: '/admin/orders',
          isRead: false,
          createdAt: order.created_at,
          icon: Package
        })
      })
    }

    // 3. Lấy đăng ký sự kiện mới (nếu bảng tồn tại)
    try {
      const { data: newRegistrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          id, created_at, status,
          events:event_id (name),
          profiles:user_id (full_name)
        `)
        .eq('status', 'pending')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(5)

      if (newRegistrations && !regError) {
        newRegistrations.forEach(reg => {
          allNotifications.push({
            id: `reg-${reg.id}`,
            type: 'registration',
            title: 'Đăng ký sự kiện mới',
            message: `${reg.profiles?.full_name || 'Người dùng'} đăng ký ${reg.events?.name || 'sự kiện'}`,
            link: '/admin/registrations',
            isRead: false,
            createdAt: reg.created_at,
            icon: Calendar
          })
        })
      }
    } catch (e) {
      // Bỏ qua nếu bảng không tồn tại
    }

    // 4. Lấy đánh giá mới (nếu bảng tồn tại)
    try {
      const { data: newReviews, error: reviewError } = await supabase
        .from('product_reviews')
        .select(`
          id, rating, comment, created_at,
          products:product_id (name),
          profiles:user_id (full_name)
        `)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(5)

      if (newReviews && !reviewError) {
        newReviews.forEach(review => {
          allNotifications.push({
            id: `review-${review.id}`,
            type: 'review',
            title: `Đánh giá mới (${review.rating} sao)`,
            message: `${review.profiles?.full_name || 'Người dùng'} đánh giá ${review.products?.name || 'sản phẩm'}`,
            link: '/admin/reviews',
            isRead: false,
            createdAt: review.created_at,
            icon: Star
          })
        })
      }
    } catch (e) {
      // Bỏ qua nếu bảng không tồn tại
    }

    // Sắp xếp theo thời gian mới nhất
    allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Giữ tối đa 15 thông báo
    setNotifications(allNotifications.slice(0, 15))
    setUnreadCount(allNotifications.filter(n => !n.isRead).length)
    setLoading(false)
  }

  /**
   * Lấy icon tương ứng với loại thông báo
   */
  function getIconForType(type) {
    switch (type) {
      case 'order': return Package
      case 'registration': return Calendar
      case 'review': return Star
      default: return Bell
    }
  }

  /**
   * Format số tiền theo VND
   */
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  /**
   * Format thời gian tương đối (vd: "5 phút trước")
   */
  function formatTimeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // Tính bằng giây

    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  /**
   * Xử lý khi click vào thông báo
   */
  function handleNotificationClick(notification) {
    // Đánh dấu đã đọc nếu là notification từ DB
    if (notification.id.startsWith('notif-')) {
      const notifId = notification.id.replace('notif-', '')
      supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
        .then(() => {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        })
    }

    // Chuyển đến trang tương ứng
    if (notification.link) {
      router.push(notification.link)
    }
    setIsOpen(false)
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  async function markAllAsRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  // === RENDER ===
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút chuông thông báo */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-white transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {/* Badge hiển thị số thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
          {/* Header dropdown */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Đánh dấu đã đọc
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0 ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Icon thông báo */}
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      notification.type === 'order' ? 'bg-orange-100 text-orange-600' :
                      notification.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {/* Nội dung thông báo */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {/* Chấm xanh cho thông báo chưa đọc */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer - Link xem tất cả */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <button 
                onClick={() => {
                  router.push('/admin/orders')
                  setIsOpen(false)
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả đơn hàng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
