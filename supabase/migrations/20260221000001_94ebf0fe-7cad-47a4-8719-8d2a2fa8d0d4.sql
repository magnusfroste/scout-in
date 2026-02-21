-- Allow admins to view all user profiles (lab_user_profiles)
CREATE POLICY "Admins can view all user profiles"
ON public.lab_user_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any user profile (for credit adjustments)
CREATE POLICY "Admins can update all user profiles"
ON public.lab_user_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all credit transactions
CREATE POLICY "Admins can view all credit transactions"
ON public.lab_credit_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert credit transactions (for manual adjustments)
CREATE POLICY "Admins can insert credit transactions"
ON public.lab_credit_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all research
CREATE POLICY "Admins can view all research"
ON public.lab_prospect_research
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
