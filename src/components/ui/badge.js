import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Badge UI là một phần tử UI nhỏ, thường được sử dụng để chỉ ra trạng thái, 
// thông báo hoặc sự kiện liên quan đến đối tượng gốc. 
// Chúng thường có dạng hình tròn hoặc hình vuông và có thể hiển thị số lượng, trạng thái hoặc thông tin bổ sung.
// Định nghĩa các biến thể styling cho Badge
// - default: nền màu primary
// - secondary: nền màu secondary
// - destructive: nền màu đỏ cảnh báo
// - outline: chỉ có viền, không có nền
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Badge - component hiển thị nhãn/tag nhỏ gọn
// Props:
// - variant: kiểu hiển thị (default/secondary/destructive/outline)
// - asChild: nếu true, sử dụng element con làm gốc thay vì span
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
