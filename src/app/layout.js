import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Providers } from "../components/providers";

// Metadata for the application
export const metadata = {
  title: "JOG Cổng thông tin chạy bộ Việt Nam",
  description: "Cổng thông tin chạy bộ hàng đầu Việt Nam. Cung cấp kiến thức kỹ thuật, chế độ dinh dưỡng và trang thiết bị chuyên dụng cho cộng đồng Runner.",
};

// bố cục gốc của ứng dụng
export default function RootLayout({
  children,
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <Providers>
          {children} {/* nội dung trang sẽ được hiển thị ở đây */}
        </Providers>
        <VisualEditsMessenger /> {/* biểu tượng hỗ trợ chỉnh sửa trực quan */}
      </body>
    </html>
  );
}
