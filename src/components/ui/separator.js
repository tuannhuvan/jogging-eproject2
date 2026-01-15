"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

// Separator - đường phân cách giữa các phần nội dung: Đường kẻ ngang hoặc dọc dùng để ngăn cách các nội dung khác nhau.
// Sử dụng Radix UI SeparatorPrimitive làm nền tảng
// Props:
// - orientation: hướng (horizontal/vertical)
// - decorative: nếu true, ẩn khỏi accessibility tree
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
