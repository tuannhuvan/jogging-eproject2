/**
 * API Route: Thanh toán sản phẩm qua MoMo
 * 
 * Endpoint: POST /api/checkout/momo
 * 
 * Chức năng:
 * - Tạo đơn hàng trong database
 * - Tạo phiên thanh toán MoMo
 * - Trả về URL thanh toán MoMo để redirect người dùng
 * 
 * Request Body:
 * - items: Array sản phẩm [{productId, quantity}]
 * - userId: ID người dùng
 * - shippingAddress: Địa chỉ giao hàng
 * - phone: Số điện thoại
 * 
 * Response:
 * - success: true/false
 * - payUrl: URL thanh toán MoMo
 * - orderId: ID đơn hàng trong database
 * 
 * Luồng xử lý:
 * 1. Validate dữ liệu đầu vào
 * 2. Kiểm tra sản phẩm và số lượng tồn kho
 * 3. Tạo đơn hàng (status: pending)
 * 4. Tạo phiên thanh toán MoMo
 * 5. Trả về URL để redirect
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Khởi tạo Supabase client với service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Cấu hình MoMo - sử dụng test credentials mặc định nếu chưa có env
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
    const { items, userId, fullName, shippingAddress, phone } = body

    // === VALIDATION ===
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để thanh toán' }, { status: 401 })
    }

    if (!fullName) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên người nhận' }, { status: 400 })
    }

    if (!shippingAddress || !phone) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin giao hàng' }, { status: 400 })
    }

    // === LẤY THÔNG TIN SẢN PHẨM ===
    const productIds = items.map(item => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image_url, stock_quantity')
      .in('id', productIds)

    if (productsError) {
      return NextResponse.json({ error: 'Lỗi khi lấy thông tin sản phẩm' }, { status: 500 })
    }

    // Tạo map để tra cứu nhanh
    const productMap = new Map(products.map(p => [p.id, p]))

    // === TÍNH TỔNG TIỀN VÀ KIỂM TRA TỒN KHO ===
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Sản phẩm không tồn tại: ${item.productId}` }, { status: 400 })
      }

      // Kiểm tra số lượng tồn kho
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Sản phẩm "${product.name}" không đủ số lượng trong kho` }, { status: 400 })
      }

      const priceInVND = parseFloat(product.price)
      totalAmount += priceInVND * item.quantity

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: priceInVND,
      })
    }

    // === TẠO ĐƠN HÀNG TRONG DATABASE ===
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: fullName,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        phone: phone,
        payment_status: 'pending',
        payment_method: 'momo',
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: 'Lỗi khi tạo đơn hàng' }, { status: 500 })
    }

    // Thêm order_id vào order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }))

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      // Rollback: xóa order nếu không thể tạo order items
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Lỗi khi tạo chi tiết đơn hàng' }, { status: 500 })
    }

    // === TẠO PHIÊN THANH TOÁN MOMO ===
    // Tạo orderId unique cho MoMo
    const orderId = `ORDER_${order.id}_${Date.now()}`
    const requestId = orderId
    const orderInfo = `Thanh toán đơn hàng #${order.id}`
    const amount = Math.round(totalAmount).toString()
    
    // extraData chứa thông tin để callback xử lý
    const extraData = Buffer.from(JSON.stringify({ orderId: order.id })).toString('base64')

    // URL redirect sau khi thanh toán
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/don-hang/${order.id}?success=true`
    const ipnUrl = `${baseUrl}/api/checkout/momo/callback`

    // Tạo chữ ký theo thứ tự alphabet của MoMo
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`

    const signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey)

    // Chuẩn bị request body cho MoMo
    const momoRequest = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: 'Jogging Shop',
      storeId: 'JoggingStore',
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
      // Rollback nếu MoMo lỗi
      await supabase.from('order_items').delete().eq('order_id', order.id)
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ 
        error: momoData.message || 'Lỗi khi tạo thanh toán MoMo' 
      }, { status: 400 })
    }

    // Lưu MoMo orderId vào database để track
    await supabase
      .from('orders')
      .update({ 
        stripe_session_id: orderId, // Tái sử dụng field này cho MoMo orderId
      })
      .eq('id', order.id)

    // Trả về URL thanh toán MoMo
    return NextResponse.json({
      success: true,
      payUrl: momoData.payUrl,
      orderId: order.id,
    })
  } catch (error) {
    console.error('MoMo checkout error:', error)
    return NextResponse.json({ error: 'Lỗi khi xử lý thanh toán: ' + error.message }, { status: 500 })
  }
}
