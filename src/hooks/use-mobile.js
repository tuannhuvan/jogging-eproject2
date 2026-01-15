import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Xác định nếu thiết bị hiện tại là di động dựa trên kích thước màn hình
// Trả về true nếu là di động, false nếu không phải
// Sử dụng hook này để điều chỉnh giao diện người dùng cho phù hợp với thiết bị di động
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
