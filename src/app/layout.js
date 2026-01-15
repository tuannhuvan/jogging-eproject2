/**
 * ROOT LAYOUT - Bố cục gốc của ứng dụng Next.js
 * 
 * File này định nghĩa cấu trúc HTML cơ bản và bao bọc toàn bộ ứng dụng
 * với các Provider cần thiết (Auth, Cart, Header, Footer)
 */

import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Providers } from "../components/providers";

/**
 * Metadata cho ứng dụng - được sử dụng cho SEO
 * - title: Tiêu đề hiển thị trên tab trình duyệt
 * - description: Mô tả trang web cho công cụ tìm kiếm
 */
export const metadata = {
  title: "JOG Cổng thông tin chạy bộ Việt Nam",
  description: "Cổng thông tin chạy bộ hàng đầu Việt Nam. Cung cấp kiến thức kỹ thuật, chế độ dinh dưỡng và trang thiết bị chuyên dụng cho cộng đồng Runner.",
};

/**
 * Component RootLayout - Bố cục gốc
 * Bao bọc toàn bộ ứng dụng với:
 * - HTML lang="vi" cho tiếng Việt
 * - Body với font antialiased để chữ mượt hơn
 * - Providers: chứa AuthProvider, CartProvider, Header, Footer
 * - VisualEditsMessenger: công cụ hỗ trợ chỉnh sửa trực quan từ Orchids
 * 
 * @param {React.ReactNode} children - Nội dung trang con sẽ được render
 */
export default function RootLayout({
  children,
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {/* Providers bao bọc ứng dụng với các context cần thiết */}
        <Providers>
          {children}
        </Providers>
        {/* Component hỗ trợ chỉnh sửa trực quan từ Orchids */}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
