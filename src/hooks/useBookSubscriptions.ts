import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookSubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_gel: number;
  interval: string;
  interval_count: number;
  description: string | null;
  is_active: boolean;
}

export interface BookSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan?: BookSubscriptionPlan;
}

export const useBookSubscriptions = () => {
  const [plans, setPlans] = useState<BookSubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<BookSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('book_subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_gel', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch user's subscription
  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      const { data, error } = await supabase
        .from('book_subscriptions')
        .select(`
          *,
          plan:book_subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data || null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('has_active_book_subscription', { _user_id: user.id });

      if (error) throw error;
      return data || false;
    } catch {
      return false;
    }
  };

  // Create checkout for subscription
  const createCheckout = async (planId: string, paymentMethod: 'bank' | 'flitt') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: plan, error: planError } = await supabase
        .from('book_subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) throw new Error('Plan not found');

      const checkoutData = {
        user_id: user.id,
        items: [{
          type: 'book_subscription',
          plan_id: planId,
          plan_name: plan.name,
          price: plan.price_gel,
          interval: plan.interval
        }],
        total: plan.price_gel,
        currency: 'GEL',
        payment_method: paymentMethod
      };

      const fnName = paymentMethod === 'flitt' ? 'flitt-payment' : 'bank-payment';
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: paymentMethod === 'flitt' ? { action: 'initiate', ...checkoutData } : checkoutData,
      });
      if (error) throw error;
      return { redirect_url: data.payment_url || data.redirect_url, order_id: data.transaction_id || data.order_id };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
    setLoading(false);
  }, []);

  return {
    plans,
    subscription,
    loading,
    error,
    hasActiveSubscription,
    createCheckout,
    refreshSubscription: fetchSubscription
  };
};
