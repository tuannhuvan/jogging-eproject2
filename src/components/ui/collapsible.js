"use client"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

// Collapsible - container cho nội dung có thể thu gọn/mở rộng
// Sử dụng Radix UI CollapsiblePrimitive làm nền tảng
function Collapsible({
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

// CollapsibleTrigger - nút kích hoạt thu gọn/mở rộng nội dung
function CollapsibleTrigger({
  ...props
}) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

// CollapsibleContent - nội dung được thu gọn/mở rộng
// Có animation mượt mà khi thay đổi trạng thái
function CollapsibleContent({
  ...props
}) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
