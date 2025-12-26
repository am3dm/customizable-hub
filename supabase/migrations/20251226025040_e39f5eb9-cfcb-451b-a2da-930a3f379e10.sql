-- Drop the overly permissive SELECT policy on customers
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

-- Create a more restrictive SELECT policy for customers - only admin and sales can view
CREATE POLICY "Admins and sales can view customers" 
ON public.customers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role));