/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>ვერიფიკაციის კოდი</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>იდენტობის დადასტურება</Heading>
        <Text style={text}>გამოიყენეთ ქვემოთ მოცემული კოდი თქვენი იდენტობის დასადასტურებლად:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          კოდს მოქმედების ვადა შეზღუდული აქვს. თუ თქვენ არ მოგითხოვიათ ეს, შეგიძლიათ უგულებელყოთ.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'JetBrains Mono', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#5F13CA',
  margin: '0 0 30px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
