"use client"

/**
 * CART CONTEXT - Quản lý giỏ hàng mua sắm
 * 
 * Context này cung cấp:
 * - Danh sách sản phẩm trong giỏ hàng
 * - Các hàm thao tác: thêm, xóa, cập nhật số lượng
 * - Tính tổng số lượng và tổng tiền
 * - Lưu trữ vào localStorage để duy trì khi refresh trang
 */

import { createContext, useContext, useState, useEffect } from 'react'

// Tạo Context với giá trị mặc định là undefined
const CartContext = createContext(undefined)

/**
 * CartProvider - Component bao bọc ứng dụng để cung cấp context giỏ hàng
 * @param {React.ReactNode} children - Các component con cần được bao bọc
 */
export function CartProvider({ children }) {
  // State lưu danh sách sản phẩm trong giỏ hàng
  const [items, setItems] = useState([])

  // Effect khôi phục giỏ hàng từ localStorage khi app khởi động
  useEffect(() => {
    const stored = localStorage.getItem('jog-cart')
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  // Effect lưu giỏ hàng vào localStorage mỗi khi items thay đổi
  useEffect(() => {
    localStorage.setItem('jog-cart', JSON.stringify(items))
  }, [items])

  /**
   * Thêm sản phẩm vào giỏ hàng
   * Nếu sản phẩm đã có trong giỏ -> tăng số lượng lên 1
   * Nếu chưa có -> thêm mới với số lượng = 1
   * @param {Object} item - Sản phẩm cần thêm
   */
  function addItem(item) {
    setItems(prev => {
      // Kiểm tra sản phẩm đã tồn tại trong giỏ chưa
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        // Nếu đã có -> cập nhật số lượng
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      // Nếu chưa có -> thêm mới
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {number|string} id - ID của sản phẩm cần xóa
   */
  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  /**
   * Cập nhật số lượng sản phẩm
   * Nếu số lượng <= 0 -> xóa sản phẩm khỏi giỏ
   * @param {number|string} id - ID của sản phẩm
   * @param {number} quantity - Số lượng mới
   */
  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  /**
   * Xóa tất cả sản phẩm trong giỏ hàng
   * Thường được gọi sau khi đặt hàng thành công
   */
  function clearCart() {
    setItems([])
  }

  // Tính tổng số lượng sản phẩm trong giỏ
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  // Tính tổng tiền của giỏ hàng
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      items,        // Danh sách sản phẩm
      addItem,      // Hàm thêm sản phẩm
      removeItem,   // Hàm xóa sản phẩm
      updateQuantity, // Hàm cập nhật số lượng
      clearCart,    // Hàm xóa toàn bộ giỏ hàng
      totalItems,   // Tổng số lượng
      totalAmount   // Tổng tiền
    }}>
      {children}
    </CartContext.Provider>
  )
}

/**
 * Hook để sử dụng CartContext trong các component
 * @returns {Object} Object chứa: items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount
 * @throws {Error} Nếu được gọi ngoài CartProvider
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
