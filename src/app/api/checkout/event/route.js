import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
    try {
      const { registrationId, eventId, eventName, distance, email } = await request.json()
  
      if (!registrationId || !eventId || !distance) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Fetch event to get specific prices
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      let amount = 0;
      switch(distance) {
        case '5km': amount = event.price_5km || 150000; break;
        case '10km': amount = event.price_10km || 200000; break;
        case '21km': amount = event.price_21km || 350000; break;
        case '42km': amount = event.price_42km || 500000; break;
        default: amount = 150000;
      }
  
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `${eventName} - ${distance}`,
              description: `Đăng ký tham gia giải chạy ${eventName}, cự ly ${distance}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        type: 'event_registration',
        registration_id: registrationId.toString(),
        event_id: eventId.toString(),
        distance,
      },
      success_url: `${origin}/events/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${eventId}?payment=cancelled`,
    })

    await supabase
      .from('registrations')
      .update({ stripe_session_id: session.id, amount_paid: amount })
      .eq('id', registrationId)

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
