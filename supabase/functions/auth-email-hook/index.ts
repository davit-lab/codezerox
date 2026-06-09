import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'დაადასტურე მეილი',
  invite: 'მოწვევა',
  magiclink: 'შესვლის ლინკი',
  recovery: 'პაროლის აღდგენა',
  email_change: 'მეილის შეცვლის დადასტურება',
  reauthentication: 'ვერიფიკაციის კოდი',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = "CodeZero"
const SENDER_DOMAIN = "notify.codezero.ge"
const ROOT_DOMAIN = "codezero.ge"
const FROM_DOMAIN = "codezero.ge"

const SAMPLE_PROJECT_URL = "https://codezero.ge"
const SAMPLE_EMAIL = "user@example.test"
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

// Preview endpoint handler - returns rendered HTML without sending email
async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const hookSecret = Deno.env.get('HOOK_SECRET')
  const authHeader = req.headers.get('Authorization')

  if (!hookSecret || authHeader !== `Bearer ${hookSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

async function verifySupabaseHmac(req: Request, rawBody: string): Promise<boolean> {
  const hookSecret = Deno.env.get('HOOK_SECRET')
  if (!hookSecret) return false

  // Accept both raw secret (Bearer <secret>) and HMAC-signed requests
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false

  // Simple Bearer match (for local dev / manual calls)
  if (authHeader === `Bearer ${hookSecret}`) return true

  // Supabase HMAC: Authorization: Bearer <base64_hmac_signature>
  // Hook secret stored as either raw or 'v1,whsec_<base64>'
  try {
    const keyMaterial = hookSecret.startsWith('v1,whsec_')
      ? Uint8Array.from(atob(hookSecret.slice('v1,whsec_'.length)), c => c.charCodeAt(0))
      : new TextEncoder().encode(hookSecret)
    const key = await crypto.subtle.importKey(
      'raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sigB64 = authHeader.replace(/^Bearer\s+/i, '')
    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(rawBody))
  } catch {
    return false
  }
}

// Webhook handler - verifies signature and sends email
async function handleWebhook(req: Request): Promise<Response> {
  // Read body first (needed for HMAC verification)
  const rawBody = await req.text()

  const isValid = await verifySupabaseHmac(req, rawBody)
  if (!isValid) {
    console.error('Invalid hook authorization')
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Parse Supabase native auth hook payload: { user, email_data }
  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const run_id = crypto.randomUUID()
  const emailType = body?.email_data?.email_action_type
  const recipientEmail = body?.user?.email

  if (!emailType || !recipientEmail) {
    console.error('Missing email_action_type or user.email in hook payload')
    return new Response(
      JSON.stringify({ error: 'Invalid hook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Received auth event', { emailType, email: recipientEmail, run_id })

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType, run_id })
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Build confirmation URL from Supabase hook data
  const siteUrl = body.email_data.site_url || `https://${ROOT_DOMAIN}`
  const tokenHash = body.email_data.token_hash || ''
  const redirectTo = body.email_data.redirect_to || siteUrl
  const confirmationUrl = tokenHash
    ? `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=${emailType}&redirect_to=${encodeURIComponent(redirectTo)}`
    : redirectTo

  // Build template props from Supabase hook payload
  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: recipientEmail,
    confirmationUrl,
    token: body.email_data.token || '',
    email: recipientEmail,
    newEmail: body.email_data.new_email || '',
  }

  // Render React Email to HTML and plain text
  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  // Enqueue email for async processing by the dispatcher (process-email-queue).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const messageId = crypto.randomUUID()

  // Log pending BEFORE enqueue so we have a record even if enqueue crashes
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      run_id,
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, run_id, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Auth email enqueued', { emailType, email: recipientEmail, run_id })

  return new Response(
    JSON.stringify({ success: true, queued: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Handle CORS preflight for main endpoint
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route to preview handler for /preview path
  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  // Main webhook handler
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
