/**
 * UTILS - Các hàm tiện ích dùng chung
 * 
 * File này chứa các hàm helper được sử dụng trong toàn bộ ứng dụng
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Hàm kết hợp các class CSS một cách thông minh
 * 
 * Sử dụng:
 * - clsx: Kết hợp các class có điều kiện
 * - twMerge: Loại bỏ các class Tailwind trùng lặp hoặc mâu thuẫn
 * 
 * Ví dụ:
 * cn("px-2 py-1", "px-4") => "py-1 px-4" (px-4 ghi đè px-2)
 * cn("text-red-500", isActive && "text-blue-500") => Điều kiện kết hợp class
 * 
 * @param {...(string|Object|Array)} inputs - Các class cần kết hợp
 * @returns {string} Chuỗi class đã được tối ưu
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
