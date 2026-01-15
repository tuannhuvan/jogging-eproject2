"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

// ResizablePanelGroup - container cho các panel có thể resize: Các thành phần giao diện mà người dùng 
// có thể kéo để thay đổi kích thước (ví dụ: chia đôi màn hình code)
// Sử dụng thư viện react-resizable-panels làm nền tảng
// Props:
// - direction: hướng chia (horizontal/vertical)
function ResizablePanelGroup({
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

// ResizablePanel - mỗi panel có thể resize
// Props:
// - defaultSize: kích thước mặc định (%)
// - minSize: kích thước tối thiểu (%)
// - maxSize: kích thước tối đa (%)
const ResizablePanel = ResizablePrimitive.Panel

// ResizableHandle - thanh kéo để resize giữa các panel
// Props:
// - withHandle: hiển thị icon grip để dễ thấy vị trí kéo
function ResizableHandle({
  withHandle,
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {/* Icon grip hiển thị khi withHandle=true */}
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
