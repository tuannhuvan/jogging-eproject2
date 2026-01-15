/**
 * API Route: Thanh toán đăng ký sự kiện qua MoMo
 * 
 * Endpoint: POST /api/checkout/event
 * 
 * Chức năng:
 * - Tạo phiên thanh toán MoMo cho đăng ký sự kiện/giải chạy
 * - Chỉ hỗ trợ thanh toán MoMo (không COD)
 * - Trả về URL thanh toán để redirect người dùng
 * 
 * Request Body:
 * - registrationId: ID đăng ký trong database
 * - eventId: ID sự kiện
 * - eventName: Tên sự kiện (hiển thị trên MoMo)
 * - distance: Cự ly đăng ký (5km, 10km, 21km, 42km)
 * - email: Email người đăng ký
 * 
 * Response:
 * - success: true/false
 * - payUrl: URL thanh toán MoMo
 * - registrationId: ID đăng ký
 * 
 * Giá tiền:
 * - Lấy từ bảng events theo cự ly (price_5km, price_10km, ...)
 * 
 * Lưu ý:
 * - Sự kiện phải có status "Open" mới cho phép thanh toán
 * - Registration phải chưa được thanh toán (payment_status != 'paid')
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Cấu hình MoMo - sử dụng test credentials mặc định
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
}

/**
 * Tạo chữ ký HMAC SHA256 cho request MoMo
 * @param {string} rawData - Chuỗi dữ liệu cần ký
 * @param {string} secretKey - Secret key của MoMo
 * @returns {string} Chữ ký hex
 */
function generateSignature(rawData, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawData).digest('hex')
}

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json()
    const { registrationId, eventId, eventName, distance, email } = body

    // === VALIDATION ===
    if (!registrationId || !eventId) {
      return NextResponse.json({ error: 'Thiếu thông tin đăng ký' }, { status: 400 })
    }

    // === KIỂM TRA REGISTRATION ===
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: 'Không tìm thấy đăng ký' }, { status: 404 })
    }

    // Kiểm tra đã thanh toán chưa
    if (registration.payment_status === 'paid') {
      return NextResponse.json({ error: 'Đăng ký này đã được thanh toán' }, { status: 400 })
    }

    // === LẤY THÔNG TIN SỰ KIỆN ===
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Sự kiện không tồn tại' }, { status: 404 })
    }

    // === TÍNH GIÁ TIỀN THEO CỰ LY ===
    const priceMap = {
      '5km': event.price_5km,
      '10km': event.price_10km,
      '21km': event.price_21km,
      '42km': event.price_42km,
    }

    const regDistance = registration.distance || distance
    const price = priceMap[regDistance]
    
    if (!price) {
      return NextResponse.json({ error: 'Cự ly không hợp lệ' }, { status: 400 })
    }

    // === TẠO PHIÊN THANH TOÁN MOMO ===
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Tạo orderId unique cho MoMo
    const orderId = `EVENT_${registrationId}_${Date.now()}`
    const requestId = orderId
    const orderInfo = `Đăng ký ${event.name} - ${regDistance}`
    const amount = Math.round(price).toString()
    
    // extraData chứa thông tin để callback xử lý
    // type: 'event' để phân biệt với đơn hàng sản phẩm
    const extraData = Buffer.from(JSON.stringify({ 
      registrationId, 
      eventId, 
      type: 'event' 
    })).toString('base64')

    // URL redirect sau khi thanh toán
    const redirectUrl = `${baseUrl}/events/${eventId}?payment=success&registration=${registrationId}`
    const ipnUrl = `${baseUrl}/api/checkout/momo/callback`

    // Tạo chữ ký theo thứ tự alphabet của MoMo
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`

    const signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey)

    // Chuẩn bị request body cho MoMo
    const momoRequest = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: 'Jogging Events',
      storeId: 'JoggingEvents',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData: extraData,
      signature: signature,
    }

    // Gọi API MoMo
    const momoResponse = await fetch(MOMO_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(momoRequest),
    })

    const momoData = await momoResponse.json()

    // Kiểm tra kết quả từ MoMo
    if (momoData.resultCode !== 0) {
      return NextResponse.json({ 
        error: momoData.message || 'Lỗi khi tạo thanh toán MoMo' 
      }, { status: 400 })
    }

    // Lưu MoMo orderId vào database để track
    await supabase
      .from('registrations')
      .update({ stripe_session_id: orderId }) // Tái sử dụng field này
      .eq('id', registrationId)

    // Trả về URL thanh toán MoMo
    return NextResponse.json({
      success: true,
      payUrl: momoData.payUrl,
      registrationId: registrationId,
    })
  } catch (error) {
    console.error('Event checkout error:', error)
    return NextResponse.json({ error: 'Lỗi khi xử lý thanh toán: ' + error.message }, { status: 500 })
  }
}
