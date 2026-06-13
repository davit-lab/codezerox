/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>მეილის შეცვლის დადასტურება - {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>მეილის შეცვლის დადასტურება</Heading>
        <Text style={text}>
          თქვენ მოითხოვეთ {siteName}-ზე მეილის შეცვლა{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>-დან{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>-ზე.
        </Text>
        <Text style={text}>
          დააჭირეთ ქვემოთ მოცემულ ღილაკს ცვლილების დასადასტურებლად:
        </Text>
        <Button style={button} href={confirmationUrl}>
          მეილის დადასტურება
        </Button>
        <Text style={footer}>
          თუ თქვენ არ მოგითხოვიათ ეს ცვლილება, გთხოვთ დაიცვათ თქვენი ანგარიში.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans Georgian', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#5F13CA',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: '#5F13CA', textDecoration: 'underline' }
const button = {
  backgroundColor: '#5F13CA',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
