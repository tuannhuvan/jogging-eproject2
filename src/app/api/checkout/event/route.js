/**
 * API CHECKOUT EVENT - API xử lý thanh toán đăng ký sự kiện
 * 
 * Endpoint: POST /api/checkout/event
 * 
 * Chức năng:
 * - Nhận thông tin đăng ký giải chạy từ client
 * - Tạo phiên thanh toán Stripe Checkout
 * - Cập nhật session ID vào bảng registrations
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
 * Hàm xử lý POST request - Tạo phiên thanh toán đăng ký sự kiện
 * 
 * @param {Request} request - Request object chứa thông tin đăng ký
 * @returns {NextResponse} - URL thanh toán hoặc lỗi
 */
export async function POST(request) {
    try {
      // Lấy thông tin từ body request
      const { registrationId, eventId, eventName, distance, email } = await request.json()
  
      // Kiểm tra các trường bắt buộc
      if (!registrationId || !eventId || !distance) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Truy vấn thông tin sự kiện để lấy giá theo cự ly
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      // Kiểm tra sự kiện có tồn tại không
      if (eventError || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Xác định số tiền thanh toán dựa trên cự ly đã chọn
      let amount = 0;
      switch(distance) {
        case '5km': amount = event.price_5km || 150000; break;    // Fun Run
        case '10km': amount = event.price_10km || 200000; break;  // Challenge
        case '21km': amount = event.price_21km || 350000; break;  // Half Marathon
        case '42km': amount = event.price_42km || 500000; break;  // Full Marathon
        default: amount = 150000;
      }
  
      // Lấy origin URL để tạo redirect URLs
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Tạo phiên thanh toán Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],           // Chỉ chấp nhận thẻ
      mode: 'payment',                          // Thanh toán một lần
      line_items: [
        {
          price_data: {
            currency: 'vnd',                    // Đơn vị tiền tệ VNĐ
            product_data: {
              name: `${eventName} - ${distance}`,
              description: `Đăng ký tham gia giải chạy ${eventName}, cự ly ${distance}`,
            },
            unit_amount: amount,                // Số tiền (VNĐ không có phần thập phân)
          },
          quantity: 1,
        },
      ],
      customer_email: email,                    // Email khách hàng
      metadata: {
        type: 'event_registration',             // Loại thanh toán
        registration_id: registrationId.toString(),
        event_id: eventId.toString(),
        distance,
      },
      // URL chuyển hướng sau khi thanh toán thành công
      success_url: `${origin}/events/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      // URL chuyển hướng khi hủy thanh toán
      cancel_url: `${origin}/events/${eventId}?payment=cancelled`,
    })

    // Cập nhật session ID và số tiền vào bảng registrations
    await supabase
      .from('registrations')
      .update({ stripe_session_id: session.id, amount_paid: amount })
      .eq('id', registrationId)

    // Trả về URL thanh toán cho client
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    // Ghi log lỗi và trả về response lỗi
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
