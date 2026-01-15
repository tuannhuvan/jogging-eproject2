"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Progress - thanh tiến trình: Hiển thị trạng thái hoàn thành của một tác vụ (ví dụ: thanh tải dữ liệu 60%).
// Sử dụng Radix UI ProgressPrimitive làm nền tảng
// Props:
// - value: giá trị tiến trình (0-100)
// Thanh indicator sẽ di chuyển từ trái sang phải theo value
function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {/* Indicator - phần hiển thị tiến trình */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
