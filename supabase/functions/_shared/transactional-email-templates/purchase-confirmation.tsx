import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "CodeZero Academy"
const SITE_URL = "https://codezero.ge"

interface PurchaseConfirmationProps {
  bookTitle?: string
  creditsAmount?: number
}

const PurchaseConfirmationEmail = ({ bookTitle, creditsAmount }: PurchaseConfirmationProps) => {
  const hasBook = !!bookTitle
  const hasCredits = !!creditsAmount && creditsAmount > 0

  return (
    <Html lang="ka" dir="ltr">
      <Head />
      <Preview>
        {hasBook && hasCredits
          ? `წიგნი "${bookTitle}" და ${creditsAmount} კრედიტი ხელმისაწვდომია`
          : hasBook
          ? `წიგნი "${bookTitle}" ხელმისაწვდომია`
          : `${creditsAmount} კრედიტი დაემატა თქვენს ანგარიშზე`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>შეძენა წარმატებულია! ✅</Heading>

          {hasBook && (
            <Text style={text}>
              წიგნი <strong>„{bookTitle}"</strong> ხელმისაწვდომია თქვენს ბიბლიოთეკაში.
            </Text>
          )}

          {hasCredits && (
            <Text style={text}>
              <strong>{creditsAmount}</strong> კრედიტი დაემატა თქვენს ანგარიშზე.
            </Text>
          )}

          <Button style={button} href={`${SITE_URL}/my-books`}>
            ჩემი წიგნები
          </Button>

          <Hr style={hr} />
          <Text style={footer}>მადლობა შეძენისთვის! — {SITE_NAME} გუნდი</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PurchaseConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data.bookTitle
      ? `შეძენა წარმატებულია: ${data.bookTitle} — CodeZero Academy`
      : 'შეძენა წარმატებულია — CodeZero Academy',
  displayName: 'Purchase confirmation',
  previewData: { bookTitle: 'JavaScript ფუნდამენტები', creditsAmount: 0 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans Georgian', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '480px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 16px' }
const button = {
  backgroundColor: '#5F13CA', color: '#ffffff', padding: '12px 24px',
  borderRadius: '10px', fontWeight: 'bold' as const, fontSize: '14px',
  textDecoration: 'none', display: 'inline-block' as const, margin: '8px 0 24px',
}
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
