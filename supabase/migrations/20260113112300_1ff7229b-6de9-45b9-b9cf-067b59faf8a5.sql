-- Fix search_path for security definer functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;