-- Add is_setup_completed to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS is_setup_completed boolean DEFAULT false;

-- Add pin_code to profiles for quick login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_code text;

-- Create payments table for debt repayment tracking
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_date timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  payment_method text DEFAULT 'cash',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments RLS policies
CREATE POLICY "Authenticated users can view payments" 
ON public.payments 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Admins and sales can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales'));

CREATE POLICY "Admins can update payments" 
ON public.payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Create audit_logs table for tracking all actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  details text,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Add is_synced column to invoices for offline support
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS is_synced boolean DEFAULT true;

-- Create index for faster sync queries
CREATE INDEX IF NOT EXISTS idx_invoices_is_synced ON public.invoices(is_synced) WHERE is_synced = false;