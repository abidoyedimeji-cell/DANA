-- Create wallet table for user balances
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  related_date_id UUID REFERENCES date_invites(id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics events table for tracking interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  related_user_id UUID REFERENCES profiles(id),
  related_entity_id UUID,
  entity_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Wallet policies
DROP POLICY IF EXISTS wallets_select_own ON wallets;
CREATE POLICY wallets_select_own ON wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS wallets_insert_own ON wallets;
CREATE POLICY wallets_insert_own ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS wallets_update_own ON wallets;
CREATE POLICY wallets_update_own ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- Wallet transactions policies
DROP POLICY IF EXISTS transactions_select_own ON wallet_transactions;
CREATE POLICY transactions_select_own ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS transactions_insert_own ON wallet_transactions;
CREATE POLICY transactions_insert_own ON wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics events policies
DROP POLICY IF EXISTS analytics_select_own ON analytics_events;
CREATE POLICY analytics_select_own ON analytics_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS analytics_insert_own ON analytics_events;
CREATE POLICY analytics_insert_own ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
