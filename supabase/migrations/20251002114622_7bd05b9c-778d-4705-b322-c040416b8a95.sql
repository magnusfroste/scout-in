-- Add credits column to lab_user_profiles with default value of 5
ALTER TABLE lab_user_profiles 
ADD COLUMN credits integer NOT NULL DEFAULT 5;

-- Create lab_credit_transactions table for tracking credit usage history
CREATE TABLE lab_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  description text NOT NULL,
  research_id uuid REFERENCES lab_prospect_research ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on lab_credit_transactions
ALTER TABLE lab_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own credit transactions
CREATE POLICY "Users can view their own credit transactions"
ON lab_credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own credit transactions
CREATE POLICY "Users can insert their own credit transactions"
ON lab_credit_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_lab_credit_transactions_user_id ON lab_credit_transactions(user_id);
CREATE INDEX idx_lab_credit_transactions_created_at ON lab_credit_transactions(created_at DESC);