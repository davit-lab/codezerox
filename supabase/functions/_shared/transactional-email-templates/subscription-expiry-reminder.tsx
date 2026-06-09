/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "CodeZero Academy"
const SITE_URL = "https://codezero.ge"

interface SubscriptionExpiryReminderProps {
  expiryDate?: string
  userName?: string
}

const SubscriptionExpiryReminderEmail = ({ expiryDate, userName }: SubscriptionExpiryReminderProps) => (
  <Html lang="ka" dir="ltr">
    <Head />
    <Preview>თქვენი ფრილანსერის სააბონემენტო 7 დღეში განახლდება</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⏰ სააბონემენტოს განახლების შეხსენება</Heading>

        {userName && (
          <Text style={text}>გამარჯობა, <strong>{userName}</strong>!</Text>
        )}

        <Text style={text}>
          თქვენი ფრილანსერის სააბონემენტო{' '}
          <strong>{expiryDate || '7 დღეში'}</strong> ამოიწურება.
        </Text>

        <Text style={text}>
          სააბონემენტო <strong>ავტომატურად განახლდება</strong> და ანგარიშიდან ჩამოიჭრება <strong>10₾</strong>.
          თუ არ გსურთ განახლება, შეგიძლიათ გააუქმოთ გამოწერა ნებისმიერ დროს.
        </Text>

        <Button style={cancelButton} href={`${SITE_URL}/freelancer/edit`}>
          სააბონემენტოს მართვა
        </Button>

        <Hr style={hr} />
        <Text style={footer}>
          ეს შეტყობინება გაიგზავნა ავტომატურად. — {SITE_NAME} გუნდი
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionExpiryReminderEmail,
  subject: 'ფრილანსერის სააბონემენტო 7 დღეში განახლდება — CodeZero Academy',
  displayName: 'Freelancer subscription expiry reminder',
  previewData: { expiryDate: '10 მაისი, 2026', userName: 'გიორგი' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans Georgian', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '480px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 16px' }
const cancelButton = {
  backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px',
  borderRadius: '10px', fontWeight: 'bold' as const, fontSize: '14px',
  textDecoration: 'none', display: 'inline-block' as const, margin: '8px 0 24px',
}
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
