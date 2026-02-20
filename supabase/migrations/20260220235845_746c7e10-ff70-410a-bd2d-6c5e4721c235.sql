-- Allow admins to insert webhooks
CREATE POLICY "Admins can insert webhooks"
ON public.webhook_testing
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update webhooks
CREATE POLICY "Admins can update webhooks"
ON public.webhook_testing
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete webhooks
CREATE POLICY "Admins can delete webhooks"
ON public.webhook_testing
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
