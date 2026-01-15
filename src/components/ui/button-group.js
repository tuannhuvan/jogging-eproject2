import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// ButtonGroup là một thành phần trong UI (giao diện người dùng) được sử dụng để gắn kết các nút liên quan. 
// Nó cho phép bạn tổ chức các nút thành một khối thống nhất, giúp tạo ra một giao diện người dùng sạch sẽ và có cấu trúc.
// ButtonGroup hỗ trợ nhiều kiểu dáng, kích thước và layout, cho phép bạn tạo ra các thanh công cụ, 
// liên kết hành động hoặc các set nút hành động
// Định nghĩa các biến thể styling cho ButtonGroup
// orientation:
// - horizontal: các nút xếp ngang, bỏ border-radius ở giữa
// - vertical: các nút xếp dọc, bỏ border-radius ở giữa
const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

// ButtonGroup - container nhóm nhiều nút lại với nhau
// Tự động xử lý border-radius để các nút nối liền nhau
// Props:
// - orientation: hướng sắp xếp (horizontal/vertical)
function ButtonGroup({
  className,
  orientation,
  ...props
}) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

// ButtonGroupText - hiển thị text trong nhóm nút (như label hoặc addon)
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

// ButtonGroupSeparator - đường phân cách giữa các nút trong nhóm
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
