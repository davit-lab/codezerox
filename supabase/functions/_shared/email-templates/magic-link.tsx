/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>შესვლის ლინკი - {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>შესვლის ლინკი</Heading>
        <Text style={text}>
          დააჭირეთ ქვემოთ მოცემულ ღილაკს {siteName}-ზე შესასვლელად. ლინკს მოქმედების ვადა შეზღუდული აქვს.
        </Text>
        <Button style={button} href={confirmationUrl}>
          შესვლა
        </Button>
        <Text style={footer}>
          თუ თქვენ არ მოგითხოვიათ ეს ლინკი, შეგიძლიათ უგულებელყოთ ეს შეტყობინება.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const button = {
  backgroundColor: '#5F13CA',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
