import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

// Spinner - icon loading xoay tròn
// Sử dụng Loader2Icon từ lucide-react với animation spin
// Thường dùng để chỉ trạng thái đang xử lý trong buttons hoặc content
function Spinner({ className, ...props }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
