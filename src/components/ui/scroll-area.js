"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

// ScrollArea - vùng nội dung có thanh cuộn tùy chỉnh: Khu vực tùy chỉnh thanh cuộn (scrollbar) 
// để mượt mà và đồng bộ hơn so với thanh cuộn mặc định của trình duyệt
// Sử dụng Radix UI ScrollAreaPrimitive làm nền tảng
// Thay thế scrollbar mặc định của trình duyệt bằng scrollbar đẹp hơn
function ScrollArea({
  className,
  children,
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      {/* Viewport - vùng hiển thị nội dung có thể cuộn */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 h-full w-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {/* Thanh cuộn dọc */}
      <ScrollBar />
      {/* Góc vuông khi có cả 2 thanh cuộn */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

// ScrollBar - thanh cuộn tùy chỉnh
// Props:
// - orientation: hướng cuộn (vertical/horizontal)
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        // Styling cho thanh cuộn dọc
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        // Styling cho thanh cuộn ngang
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      {/* Thumb - phần kéo được của thanh cuộn */}
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
