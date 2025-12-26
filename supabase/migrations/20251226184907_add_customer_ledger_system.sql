/*
  # نظام سجل الحركات المالية للعملاء (Customer Financial Ledger)
  
  ## الغرض:
  تتبع دقيق لجميع الحركات المالية مع العملاء (مبيعات، تسديدات، مرتجعات)
  
  ## الجداول الجديدة:
  
  ### 1. customer_ledger
  - سجل كامل لكل حركة مالية (دائن/مدين)
  - مرتبط بالفواتير ووصولات القبض
  - يوفر audit trail كامل
  
  ### 2. payment_receipts
  - وصولات قبض منفصلة عن فواتير البيع
  - تُستخدم عند تسديد ديون سابقة
  - قابلة للطباعة بتنسيق 80mm
  
  ## الأمان:
  - RLS مفعّل على جميع الجداول
  - صلاحيات محددة حسب الأدوار
  
  ## الملاحظات:
  - استخدام DECIMAL(15,0) للعملة العراقية (بدون كسور عشرية)
  - دعم العمليات المتزامنة (Transactions)
*/

-- ══════════════════════════════════════════════════════════════
-- 📊 الجدول 1: سجل حركات العملاء (Customer Ledger)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.customer_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  
  -- نوع الحركة
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'payment', 'return', 'adjustment')),
  
  -- المبالغ (بالدينار العراقي - بدون كسور)
  debit_amount DECIMAL(15,0) DEFAULT 0,  -- مدين (يزيد الذمة)
  credit_amount DECIMAL(15,0) DEFAULT 0, -- دائن (ينقص الذمة)
  
  -- الرصيد بعد هذه الحركة
  balance_after DECIMAL(15,0) NOT NULL,
  
  -- الربط مع المستندات
  invoice_id UUID REFERENCES public.invoices(id),
  payment_receipt_id UUID,
  
  -- التفاصيل
  description TEXT,
  notes TEXT,
  
  -- التدقيق
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index للأداء
CREATE INDEX idx_customer_ledger_customer_id ON public.customer_ledger(customer_id);
CREATE INDEX idx_customer_ledger_created_at ON public.customer_ledger(created_at DESC);
CREATE INDEX idx_customer_ledger_invoice_id ON public.customer_ledger(invoice_id);

-- ══════════════════════════════════════════════════════════════
-- 📝 الجدول 2: وصولات القبض (Payment Receipts)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  
  -- العميل
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  
  -- المبالغ
  amount_received DECIMAL(15,0) NOT NULL, -- المبلغ الواصل
  previous_balance DECIMAL(15,0) NOT NULL, -- الرصيد قبل التسديد
  new_balance DECIMAL(15,0) NOT NULL,      -- الرصيد بعد التسديد
  
  -- طريقة الدفع
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')),
  
  -- التفاصيل
  notes TEXT,
  
  -- الطباعة
  printed_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMP WITH TIME ZONE,
  
  -- التدقيق
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index للأداء
CREATE INDEX idx_payment_receipts_customer_id ON public.payment_receipts(customer_id);
CREATE INDEX idx_payment_receipts_created_at ON public.payment_receipts(created_at DESC);

-- ربط الحقل المفقود
ALTER TABLE public.customer_ledger 
ADD CONSTRAINT fk_payment_receipt 
FOREIGN KEY (payment_receipt_id) 
REFERENCES public.payment_receipts(id);

-- ══════════════════════════════════════════════════════════════
-- 🔒 Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.customer_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- سياسات customer_ledger
CREATE POLICY "Authenticated users can view ledger" 
ON public.customer_ledger FOR SELECT 
USING (public.is_authenticated());

CREATE POLICY "Admins and sales can insert ledger entries" 
ON public.customer_ledger FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'sales'::app_role) OR
  public.has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "Admins can update ledger" 
ON public.customer_ledger FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات payment_receipts
CREATE POLICY "Authenticated users can view receipts" 
ON public.payment_receipts FOR SELECT 
USING (public.is_authenticated());

CREATE POLICY "Admins and sales can create receipts" 
ON public.payment_receipts FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'sales'::app_role)
);

CREATE POLICY "Admins can update receipts" 
ON public.payment_receipts FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ══════════════════════════════════════════════════════════════
-- ⚙️ الدوال المساعدة (Helper Functions)
-- ══════════════════════════════════════════════════════════════

-- دالة لحساب رصيد العميل الحالي
CREATE OR REPLACE FUNCTION public.get_customer_balance(p_customer_id UUID)
RETURNS DECIMAL(15,0)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance DECIMAL(15,0);
BEGIN
  SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
  INTO v_balance
  FROM public.customer_ledger
  WHERE customer_id = p_customer_id;
  
  RETURN v_balance;
END;
$$;

-- دالة لتوليد رقم وصل قبض
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.payment_receipts;
  v_number := 'REC' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
  RETURN v_number;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 🔄 Trigger لتحديث رصيد العميل تلقائياً
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_customer_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحديث رصيد العميل في جدول customers
  UPDATE public.customers
  SET 
    balance = public.get_customer_balance(NEW.customer_id),
    updated_at = now()
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_customer_balance
AFTER INSERT ON public.customer_ledger
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_balance();

-- ══════════════════════════════════════════════════════════════
-- 📊 View لتسهيل الاستعلامات
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_customer_balance_summary AS
SELECT 
  c.id,
  c.name,
  c.phone,
  c.balance,
  COUNT(DISTINCT cl.id) as total_transactions,
  COUNT(DISTINCT CASE WHEN cl.transaction_type = 'sale' THEN cl.id END) as total_sales,
  COUNT(DISTINCT CASE WHEN cl.transaction_type = 'payment' THEN cl.id END) as total_payments,
  COALESCE(SUM(CASE WHEN cl.transaction_type = 'sale' THEN cl.debit_amount ELSE 0 END), 0) as total_sales_amount,
  COALESCE(SUM(CASE WHEN cl.transaction_type = 'payment' THEN cl.credit_amount ELSE 0 END), 0) as total_payments_received
FROM public.customers c
LEFT JOIN public.customer_ledger cl ON c.id = cl.customer_id
GROUP BY c.id, c.name, c.phone, c.balance;

-- منح الصلاحيات على الـ View
GRANT SELECT ON public.v_customer_balance_summary TO authenticated;
