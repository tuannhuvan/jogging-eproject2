"use client"
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

// Tạo Context để chia sẻ các thuộc tính variant, size và spacing giữa ToggleGroup và các ToggleGroupItem con
const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
  spacing: 0,
})

// Component ToggleGroup - container chứa các toggle items
// Sử dụng Radix UI ToggleGroupPrimitive.Root làm nền tảng
// Props:
// - variant: kiểu hiển thị (default/outline)
// - size: kích thước (sm/default/lg)
// - spacing: khoảng cách giữa các items
// - children: các ToggleGroupItem con
// props khác được truyền thẳng vào ToggleGroupPrimitive.Root
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing }}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      {/* Provider cung cấp giá trị context cho các ToggleGroupItem con */}
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

// Component ToggleGroupItem - từng item trong toggle group
// Kế thừa variant và size từ context của ToggleGroup cha hoặc có thể override bằng props riêng
// Sử dụng toggleVariants để áp dụng styling nhất quán với Toggle component
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}) {
  // Lấy giá trị từ context để sử dụng các thuộc tính được chia sẻ từ ToggleGroup
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        // Áp dụng styling từ toggleVariants, ưu tiên giá trị context nếu có
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        // Styling đặc biệt khi spacing=0: các items nối liền nhau, chỉ có border-radius ở item đầu và cuối
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
