import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Khởi tạo Stripe và Supabase client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

// Supabase service role key để có quyền ghi dữ liệu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Hàm xử lý thanh toán đơn hàng
export async function POST(request) {
  try {
    const { orderId, items, totalAmount, email, userId } = await request.json()

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price),
      },
      quantity: item.quantity,
    }))

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: email,
      metadata: {
        type: 'order',
        order_id: orderId.toString(),
        user_id: userId,
      },
      success_url: `${origin}/don-hang?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?payment=cancelled`,
    })

    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe cart checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
