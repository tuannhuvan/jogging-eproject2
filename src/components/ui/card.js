import * as React from "react"

import { cn } from "@/lib/utils"

// Card (Thẻ) là một mảnh ghép không thể thiếu trong UI Design, là khung chứa các phần tử, 
// thông tin có liên quan đến nhau. Card có 4 đặc điểm chính đó là: 
// Được sử dụng để nhóm các thông tin lại với nhau - Trình bày nội dung tóm tắt và liên kết đến các chi tiết bổ sung khác
// Card - container chính cho nội dung dạng thẻ
// Có nền, viền, bo góc và shadow nhẹ
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

// CardHeader - phần header của card chứa tiêu đề và mô tả
// Hỗ trợ grid layout để đặt action button bên phải
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

// CardTitle - tiêu đề chính của card
function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

// CardDescription - mô tả phụ dưới tiêu đề
function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

// CardAction - vùng chứa các action button (thường ở góc trên phải)
function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

// CardContent - nội dung chính của card
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

// CardFooter - phần footer của card, thường chứa các nút hành động
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
