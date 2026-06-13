import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const authHeader = req.headers.get('Authorization') || ''
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  // Validate the actual token value, not just the "Bearer" prefix
  if (!provided || provided !== serviceKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase    = createClient(supabaseUrl, serviceKey)

  const now     = new Date()
  const in6days = new Date(now); in6days.setDate(in6days.getDate() + 6)
  const in7days = new Date(now); in7days.setDate(in7days.getDate() + 7)

  // Find active subscriptions expiring in 6-7 days that haven't had a reminder sent
  const { data: subs, error } = await supabase
    .from('freelancer_subscriptions')
    .select('id, user_id, expires_at')
    .eq('status', 'active')
    .is('reminder_sent_at', null)
    .gte('expires_at', in6days.toISOString())
    .lte('expires_at', in7days.toISOString())

  if (error) {
    console.error('Failed to fetch subscriptions', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
  }

  let processed = 0

  for (const sub of subs) {
    // 1. Create in-app notification
    await supabase.from('user_notifications').insert({
      user_id: sub.user_id,
      type: 'subscription_expiry',
      title: 'სააბონემენტო განახლდება 7 დღეში',
      body: `თქვენი ფრილანსერის სააბონემენტო 7 დღეში ავტომატურად განახლდება (10₾). თუ არ გსურთ გაგრძელება, გააუქმეთ გამოწერა.`,
    })

    // 2. Look up user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', sub.user_id)
      .maybeSingle()

    if (profile?.email) {
      const expiryDate = sub.expires_at
        ? new Date(sub.expires_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })
        : '7 დღეში'

      // 3. Send email via existing send-transactional-email function
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'subscription-expiry-reminder',
          recipientEmail: profile.email,
          templateData: {
            userName: profile.full_name || '',
            expiryDate,
          },
        },
      })
    }

    // 4. Mark reminder as sent
    await supabase
      .from('freelancer_subscriptions')
      .update({ reminder_sent_at: now.toISOString() })
      .eq('id', sub.id)

    processed++
  }

  return new Response(JSON.stringify({ processed }), { status: 200 })
})
