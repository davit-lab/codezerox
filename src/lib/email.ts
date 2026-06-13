import { supabase } from '@/integrations/supabase/client';

export const sendTransactionalEmail = async ({
  templateName,
  recipientEmail,
  idempotencyKey,
  templateData,
}: {
  templateName: string;
  recipientEmail: string;
  idempotencyKey: string;
  templateData?: Record<string, any>;
}) => {
  const { data, error } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName,
      recipientEmail,
      idempotencyKey,
      templateData,
    },
  });

  if (error) {
    console.error('Failed to send transactional email:', error);
    throw error;
  }

  if (data && typeof data === 'object' && 'success' in data && data.success === false) {
    console.error('Transactional email request was rejected:', data);
    throw new Error(
      'reason' in data && typeof data.reason === 'string'
        ? data.reason
        : 'Transactional email request failed'
    );
  }

  return data;
};
