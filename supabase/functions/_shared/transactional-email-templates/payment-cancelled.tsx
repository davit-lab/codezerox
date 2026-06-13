import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "CodeZero Academy"
const SITE_URL = "https://codezero.ge"

const PaymentCancelledEmail = () => (
  <Html lang="ka" dir="ltr">
    <Head />
    <Preview>გადახდა გაუქმებულია — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>გადახდა გაუქმებულია</Heading>
        <Text style={text}>
          თქვენი ბოლო გადახდის მცდელობა გაუქმდა ან ვერ მოხერხდა.
        </Text>
        <Text style={text}>
          თქვენი კალათა შენახულია და შეგიძლიათ ნებისმიერ დროს სცადოთ თავიდან.
        </Text>
        <Button style={button} href={`${SITE_URL}/cart`}>
          კალათაში დაბრუნება
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          თუ ეს შეცდომით მოხდა ან დახმარება გჭირდებათ, დაგვიკავშირდით. — {SITE_NAME} გუნდი
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentCancelledEmail,
  subject: 'გადახდა გაუქმებულია — CodeZero Academy',
  displayName: 'Payment cancelled',
  previewData: {},
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
