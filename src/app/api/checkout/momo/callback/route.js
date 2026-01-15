/**
 * API Route: MoMo Payment Callback (IPN - Instant Payment Notification)
 * 
 * Endpoint: POST /api/checkout/momo/callback
 * 
 * Chức năng:
 * - Nhận callback từ MoMo sau khi người dùng thanh toán
 * - Xác thực chữ ký để đảm bảo request từ MoMo
 * - Cập nhật trạng thái thanh toán trong database
 * - Xử lý cả đơn hàng sản phẩm và đăng ký sự kiện
 * 
 * Request Body (từ MoMo):
 * - partnerCode, orderId, requestId, amount, orderInfo
 * - orderType, transId, resultCode, message
 * - payType, responseTime, extraData, signature
 * 
 * Luồng xử lý:
 * 1. Xác thực chữ ký MoMo
 * 2. Decode extraData để lấy thông tin đơn hàng/đăng ký
 * 3. Kiểm tra resultCode (0 = thành công)
 * 4. Cập nhật database tương ứng
 * 5. Với đơn hàng: trừ tồn kho sản phẩm
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Cấu hình MoMo
const MOMO_CONFIG = {
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
}

/**
 * Xác thực chữ ký từ MoMo
 * @param {string} rawData - Chuỗi dữ liệu gốc
 * @param {string} signature - Chữ ký từ MoMo
 * @param {string} secretKey - Secret key
 * @returns {boolean} true nếu hợp lệ
 */
function verifySignature(rawData, signature, secretKey) {
  const computedSignature = crypto.createHmac('sha256', secretKey).update(rawData).digest('hex')
  return computedSignature === signature
}

export async function POST(request) {
  try {
    // Parse callback data từ MoMo
    const body = await request.json()
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body

    // === XÁC THỰC CHỮ KÝ ===
    // Tạo rawSignature theo thứ tự alphabet của MoMo
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`

    const isValid = verifySignature(rawSignature, signature, MOMO_CONFIG.secretKey)

    if (!isValid) {
      console.error('Invalid MoMo signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // === DECODE EXTRA DATA ===
    // extraData chứa thông tin về loại giao dịch (đơn hàng hoặc đăng ký sự kiện)
    let extraDataDecoded
    try {
      extraDataDecoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'))
    } catch (e) {
      console.error('Failed to parse extraData:', e)
      return NextResponse.json({ error: 'Invalid extraData' }, { status: 400 })
    }

    // === XỬ LÝ ĐĂNG KÝ SỰ KIỆN ===
    if (extraDataDecoded.type === 'event') {
      const registrationId = extraDataDecoded.registrationId
      
      if (resultCode === 0) {
        // Thanh toán thành công - cập nhật registration
        await supabase
          .from('registrations')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
          })
          .eq('id', registrationId)

        console.log(`Registration ${registrationId} payment confirmed via MoMo. TransId: ${transId}`)
      } else {
        // Thanh toán thất bại
        await supabase
          .from('registrations')
          .update({
            payment_status: 'failed',
          })
          .eq('id', registrationId)

        console.log(`Registration ${registrationId} payment failed. ResultCode: ${resultCode}`)
      }
    } 
    // === XỬ LÝ ĐƠN HÀNG SẢN PHẨM ===
    else {
      const orderDbId = extraDataDecoded.orderId

      if (resultCode === 0) {
        // Thanh toán thành công
        
        // Lấy thông tin đơn hàng
        const { data: order } = await supabase
          .from('orders')
          .select('id, user_id')
          .eq('id', orderDbId)
          .single()

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Lấy các sản phẩm trong đơn hàng
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderDbId)

        // Trừ tồn kho cho từng sản phẩm
        for (const item of orderItems || []) {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single()

          if (product) {
            await supabase
              .from('products')
              .update({ stock_quantity: product.stock_quantity - item.quantity })
              .eq('id', item.product_id)
          }
        }

        // Cập nhật trạng thái đơn hàng
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
          })
          .eq('id', orderDbId)

        console.log(`Order ${orderDbId} payment confirmed via MoMo. TransId: ${transId}`)
      } else {
        // Thanh toán thất bại - hủy đơn hàng
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
          })
          .eq('id', orderDbId)

        console.log(`Order ${orderDbId} payment failed. ResultCode: ${resultCode}, Message: ${message}`)
      }
    }

    // Trả về success cho MoMo
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('MoMo callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
