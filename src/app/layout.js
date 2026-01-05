import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Providers } from "../components/providers";

export const metadata = {
  title: "JOG.com.vn - Cổng thông tin chạy bộ Việt Nam",
  description: "Cổng thông tin chạy bộ hàng đầu Việt Nam. Cung cấp kiến thức kỹ thuật, chế độ dinh dưỡng và trang thiết bị chuyên dụng cho cộng đồng Runner.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
