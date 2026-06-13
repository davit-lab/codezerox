/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as passwordResetCode } from './password-reset-code.tsx'
import { template as purchaseConfirmation } from './purchase-confirmation.tsx'
import { template as paymentCancelled } from './payment-cancelled.tsx'
import { template as accessGranted } from './access-granted.tsx'
import { template as subscriptionExpiryReminder } from './subscription-expiry-reminder.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'password-reset-code': passwordResetCode,
  'purchase-confirmation': purchaseConfirmation,
  'payment-cancelled': paymentCancelled,
  'access-granted': accessGranted,
  'subscription-expiry-reminder': subscriptionExpiryReminder,
}
