import { cn } from "@/lib/utils"

// Skeleton - placeholder loading hiển thị khi đang tải dữ liệu: Hiệu ứng hình khối màu xám nhấp nháy, 
// mô phỏng bố cục trang web đang chờ tải dữ liệu
// Có animation pulse để thể hiện trạng thái loading
// Thường dùng để tạo layout giống nội dung sẽ hiển thị
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
