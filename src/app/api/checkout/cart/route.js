/**
 * API CHECKOUT CART - API xử lý thanh toán giỏ hàng
 * 
 * Endpoint: POST /api/checkout/cart
 * 
 * Chức năng:
 * - Nhận thông tin đơn hàng từ client
 * - Tạo phiên thanh toán Stripe Checkout cho nhiều sản phẩm
 * - Cập nhật session ID vào bảng orders
 * - Trả về URL thanh toán cho client redirect
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Khởi tạo Stripe client với secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

// Khởi tạo Supabase client với service role key để có quyền ghi dữ liệu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Hàm xử lý POST request - Tạo phiên thanh toán đơn hàng
 * 
 * @param {Request} request - Request object chứa thông tin đơn hàng
 * @returns {NextResponse} - URL thanh toán hoặc lỗi
 */
export async function POST(request) {
  try {
    // Lấy thông tin từ body request
    const { orderId, items, totalAmount, email, userId } = await request.json()

    // Kiểm tra các trường bắt buộc
    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Chuyển đổi danh sách sản phẩm sang định dạng Stripe line_items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'vnd',                        // Đơn vị tiền tệ VNĐ
        product_data: {
          name: item.name,                      // Tên sản phẩm
          images: item.image_url ? [item.image_url] : [],  // Hình ảnh sản phẩm
        },
        unit_amount: Math.round(item.price),    // Giá đơn vị (làm tròn)
      },
      quantity: item.quantity,                  // Số lượng
    }))

    // Lấy origin URL để tạo redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Tạo phiên thanh toán Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],           // Chỉ chấp nhận thẻ
      mode: 'payment',                          // Thanh toán một lần
      line_items: lineItems,                    // Danh sách sản phẩm
      customer_email: email,                    // Email khách hàng
      metadata: {
        type: 'order',                          // Loại thanh toán
        order_id: orderId.toString(),
        user_id: userId,
      },
      // URL chuyển hướng sau khi thanh toán thành công
      success_url: `${origin}/don-hang?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      // URL chuyển hướng khi hủy thanh toán
      cancel_url: `${origin}/cart?payment=cancelled`,
    })

    // Cập nhật session ID vào bảng orders
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)

    // Trả về URL thanh toán cho client
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    // Ghi log lỗi và trả về response lỗi
    console.error('Stripe cart checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
