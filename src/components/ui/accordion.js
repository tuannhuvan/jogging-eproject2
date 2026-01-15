"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Tab accordion là một kỹ thuật thiết kế web, cho phép trình bày thông tin theo dạng 
// các tab hoặc mục có thể mở rộng và thu gọn. Khi người dùng click vào một tab hoặc mục,
//  nội dung chi tiết sẽ hiển thị, giúp tiết kiệm không gian và giữ giao diện gọn gàng
// Component Accordion - container chính cho các mục accordion có thể thu gọn/mở rộng
// Sử dụng Radix UI AccordionPrimitive.Root làm nền tảng
function Accordion({
  ...props
}) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

// AccordionItem - mỗi mục trong accordion, có border dưới để phân tách các mục
function AccordionItem({
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b", className)}
      {...props}
    />
  );
}

// AccordionTrigger - nút bấm để thu gọn/mở rộng nội dung accordion
// Bao gồm icon mũi tên xoay 180 độ khi mở
function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {/* Icon mũi tên - xoay khi accordion mở */}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// AccordionContent - nội dung được hiển thị khi accordion mở
// Có animation thu gọn/mở rộng mượt mà
function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
