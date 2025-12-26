-- Drop the overly permissive SELECT policy on suppliers
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;

-- Create a more restrictive SELECT policy - only admin and warehouse can view
CREATE POLICY "Admins and warehouse can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role));