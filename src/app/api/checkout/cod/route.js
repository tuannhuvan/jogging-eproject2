import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, { ...options, signal: AbortSignal.timeout(30000) })
      }
    }
  }
)

export async function POST(request) {
  try {
    const supabase = getSupabase()
    
    const body = await request.json()
    const { items, userId, fullName, shippingAddress, phone } = body

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

    const productIds = items.map(item => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image_url, stock_quantity')
      .in('id', productIds)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Lỗi khi lấy thông tin sản phẩm' }, { status: 500 })
    }

    const productMap = new Map(products.map(p => [p.id, p]))

    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Sản phẩm không tồn tại: ${item.productId}` }, { status: 400 })
      }

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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: fullName,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        phone: phone,
        payment_status: 'cod_pending',
        payment_method: 'cod',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Lỗi khi tạo đơn hàng' }, { status: 500 })
    }

    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Lỗi khi tạo chi tiết đơn hàng' }, { status: 500 })
    }

    for (const item of items) {
      const product = productMap.get(item.productId)
      await supabase
        .from('products')
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq('id', item.productId)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.',
    })
  } catch (error) {
    console.error('COD checkout error:', error)
    return NextResponse.json({ error: 'Lỗi khi xử lý đặt hàng: ' + error.message }, { status: 500 })
  }
}
