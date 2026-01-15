"use client"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

// Toaster - component hiển thị toast notifications
// Sử dụng thư viện sonner làm nền tảng: Một thư viện thông báo (toast) hiện đại, nhẹ nhàng thường xuất hiện ở góc màn hình
// Tự động điều chỉnh theme theo next-themes
// Có các icon tùy chỉnh cho các loại toast: success, info, warning, error, loading
function Toaster({ ...props }) {
  const { theme = "system" } = useTheme()
  
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // Các icon tùy chỉnh cho từng loại toast
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      // Sử dụng CSS variables từ theme
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      {...props}
    />
  )
}

export { Toaster }
