"use client"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

// AspectRatio - component duy trì tỷ lệ khung hình cố định cho nội dung bên trong
// Hữu ích cho hình ảnh, video để đảm bảo tỷ lệ không bị méo
// Ví dụ: ratio={16/9} sẽ tạo tỷ lệ 16:9
function AspectRatio({
  ...props
}) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
