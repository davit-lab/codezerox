-- Book Subscription System - FIXED VERSION
-- Run this in Supabase SQL Editor

-- Subscription plans table
CREATE TABLE IF NOT EXISTS book_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'monthly', 'yearly'
    display_name TEXT NOT NULL, -- 'თვიური', 'წლიური'
    price_gel NUMERIC NOT NULL,
    interval TEXT NOT NULL, -- 'month', 'year'
    interval_count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans (if not exists)
INSERT INTO book_subscription_plans (name, display_name, price_gel, interval, interval_count, description) 
SELECT * FROM (VALUES
    ('monthly', 'თვიური', 20, 'month', 1, 'ყველა წიგნზე წვდომა თვეში'),
    ('yearly', 'წლიური', 120, 'year', 1, 'ყველა წიგნზე წვდომა წელიწადში (40% ფასდაკლება)')
) AS v(name, display_name, price_gel, interval, interval_count, description)
WHERE NOT EXISTS (
    SELECT 1 FROM book_subscription_plans WHERE name IN ('monthly', 'yearly')
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS book_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES book_subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_provider TEXT, -- 'bank', 'paypal'
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Function to check if user has active book subscription
CREATE OR REPLACE FUNCTION has_active_book_subscription(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM book_subscriptions
        WHERE user_id = _user_id
        AND status = 'active'
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user has book access (subscription OR purchase)
CREATE OR REPLACE FUNCTION user_has_book_access(_user_id UUID, _book_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check subscription
    IF has_active_book_subscription(_user_id) THEN
        RETURN true;
    END IF;
    
    -- Check purchase
    RETURN EXISTS (
        SELECT 1 FROM purchases
        WHERE user_id = _user_id AND book_id = _book_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE IF EXISTS book_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS book_subscriptions ENABLE ROW LEVEL SECURITY;

-- Everyone can see active plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON book_subscription_plans;
CREATE POLICY "Anyone can view active plans"
    ON book_subscription_plans FOR SELECT
    USING (is_active = true);

-- Users can see their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON book_subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON book_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON book_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
    ON book_subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_book_subscriptions_user_id ON book_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_subscriptions_status ON book_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_book_subscriptions_period_end ON book_subscriptions(current_period_end);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_book_subscriptions_updated_at ON book_subscriptions;
CREATE TRIGGER update_book_subscriptions_updated_at
    BEFORE UPDATE ON book_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
