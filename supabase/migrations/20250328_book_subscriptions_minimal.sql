-- Book Subscription System - MINIMAL VERSION
-- Run this in Supabase SQL Editor (app_role already exists)

-- 1. Subscription plans table
CREATE TABLE IF NOT EXISTS book_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    price_gel NUMERIC NOT NULL,
    interval TEXT NOT NULL,
    interval_count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert plans (skip if exists)
INSERT INTO book_subscription_plans (name, display_name, price_gel, interval, interval_count, description)
SELECT 'monthly', 'თვიური', 20, 'month', 1, 'ყველა წიგნზე წვდომა თვეში'
WHERE NOT EXISTS (SELECT 1 FROM book_subscription_plans WHERE name = 'monthly');

INSERT INTO book_subscription_plans (name, display_name, price_gel, interval, interval_count, description)
SELECT 'yearly', 'წლიური', 120, 'year', 1, 'ყველა წიგნზე წვდომა წელიწადში (40% ფასდაკლება)'
WHERE NOT EXISTS (SELECT 1 FROM book_subscription_plans WHERE name = 'yearly');

-- 3. User subscriptions table
CREATE TABLE IF NOT EXISTS book_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES book_subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_provider TEXT,
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Enable RLS
ALTER TABLE book_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Simple SELECT policy for everyone
CREATE POLICY "allow_select_plans" ON book_subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "allow_select_own_sub" ON book_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_book_sub_user_id ON book_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_sub_status ON book_subscriptions(status);

-- 7. Function to check active subscription
CREATE OR REPLACE FUNCTION has_active_book_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM book_subscriptions
        WHERE user_id = user_uuid
        AND status = 'active'
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant access
GRANT EXECUTE ON FUNCTION has_active_book_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_book_subscription(UUID) TO anon;

-- Done! Test with:
-- SELECT * FROM book_subscription_plans;
