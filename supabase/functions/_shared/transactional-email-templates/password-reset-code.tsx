import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "CodeZero Academy"

interface PasswordResetCodeProps {
  code?: string
  email?: string
}

const PasswordResetCodeEmail = ({ code = '0000', email }: PasswordResetCodeProps) => (
  <Html lang="ka" dir="ltr">
    <Head />
    <Preview>თქვენი პაროლის აღდგენის კოდი: {code}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>პაროლის აღდგენა</Heading>
        <Text style={text}>
          თქვენ მოითხოვეთ პაროლის აღდგენა {SITE_NAME}-ზე.
        </Text>
        <Section style={codeSection}>
          <Text style={codeStyle}>{code}</Text>
        </Section>
        <Text style={text}>
          შეიყვანეთ ეს კოდი პაროლის აღდგენის გვერდზე. კოდი მოქმედებს 10 წუთის განმავლობაში.
        </Text>
        <Text style={text}>
          თუ თქვენ არ მოითხოვეთ პაროლის აღდგენა, უგულებელყოთ ეს მეილი.
        </Text>
        <Text style={footer}>{SITE_NAME} გუნდი</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PasswordResetCodeEmail,
  subject: 'პაროლის აღდგენის კოდი - CodeZero Academy',
  displayName: 'Password reset code',
  previewData: { code: '1234', email: 'user@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '480px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 16px' }
const codeSection = { textAlign: 'center' as const, margin: '24px 0' }
const codeStyle = { fontSize: '36px', fontWeight: 'bold' as const, letterSpacing: '8px', color: '#7c3aed', margin: '0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
