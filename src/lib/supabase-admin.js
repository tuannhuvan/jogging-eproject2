const { createClient } = require('@supabase/supabase-js')

let supabaseAdmin = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabaseAdmin
}

module.exports = { getSupabaseAdmin }
