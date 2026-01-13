-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default categories for each user (via trigger)
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Default expense categories
  INSERT INTO public.categories (user_id, name, type) VALUES
    (NEW.id, 'Alimentação', 'expense'),
    (NEW.id, 'Transporte', 'expense'),
    (NEW.id, 'Moradia', 'expense'),
    (NEW.id, 'Saúde', 'expense'),
    (NEW.id, 'Educação', 'expense'),
    (NEW.id, 'Lazer', 'expense'),
    (NEW.id, 'Outros', 'expense');
  
  -- Default income categories
  INSERT INTO public.categories (user_id, name, type) VALUES
    (NEW.id, 'Salário', 'income'),
    (NEW.id, 'Investimentos', 'income'),
    (NEW.id, 'Freelance', 'income'),
    (NEW.id, 'Outros', 'income');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  date date NOT NULL,
  recurrence text CHECK (recurrence IN ('none', 'monthly', 'yearly')),
  recurrence_group_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX idx_transactions_recurrence_group ON public.transactions(recurrence_group_id);

-- Create scheduled_bills table
CREATE TABLE public.scheduled_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  recurrence text NOT NULL CHECK (recurrence IN ('monthly', 'yearly')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled bills"
  ON public.scheduled_bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled bills"
  ON public.scheduled_bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled bills"
  ON public.scheduled_bills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled bills"
  ON public.scheduled_bills FOR DELETE
  USING (auth.uid() = user_id);

-- Create bill_payments table (tracks payment status per month)
CREATE TABLE public.bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheduled_bill_id uuid NOT NULL REFERENCES public.scheduled_bills(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  is_paid boolean NOT NULL DEFAULT false,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scheduled_bill_id, year, month)
);

ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bill payments"
  ON public.bill_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bill payments"
  ON public.bill_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill payments"
  ON public.bill_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill payments"
  ON public.bill_payments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_bill_payments_user_date ON public.bill_payments(user_id, year, month);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();