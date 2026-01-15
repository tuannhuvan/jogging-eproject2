/**
 * SUPABASE CLIENT - Kết nối với Supabase
 * 
 * File này khởi tạo và export client Supabase để sử dụng trong toàn bộ ứng dụng
 * 
 * Cấu hình cần thiết trong file .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL: URL của project Supabase
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Anon/Public key của Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Lấy URL và Key từ biến môi trường
// NEXT_PUBLIC_ prefix cho phép sử dụng ở cả client và server side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Supabase Client instance
 * Sử dụng để thực hiện các thao tác với database, auth, storage
 * 
 * Ví dụ sử dụng:
 * - supabase.from('table').select('*') - Truy vấn dữ liệu
 * - supabase.auth.signIn() - Đăng nhập
 * - supabase.storage.from('bucket').upload() - Upload file
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
