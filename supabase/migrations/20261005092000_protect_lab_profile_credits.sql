-- Användare kunde uppdatera sin egen lab_user_profiles-rad inklusive credits
-- (som köps via Stripe) och logga egna "köp" i lab_credit_transactions.
-- Nu: icke-admins kan bara minska credits, nya profiler från klienten får
-- startsaldot 5, och egna transaktioner får bara vara avdrag (amount <= 0).
-- Admins (admin-panelen), service_role (lab-stripe-webhook) och
-- SECURITY DEFINER-funktioner påverkas inte.
create or replace function public.protect_lab_profile_credits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated')
     and not public.has_role(auth.uid(), 'admin'::app_role) then
    if tg_op = 'INSERT' then
      new.credits := 5;
    elsif coalesce(new.credits, 0) > coalesce(old.credits, 0) then
      raise exception 'credits kan inte ökas av användaren';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_lab_profile_credits on public.lab_user_profiles;
create trigger protect_lab_profile_credits
  before insert or update on public.lab_user_profiles
  for each row execute function public.protect_lab_profile_credits();

drop policy if exists "Users can insert their own transactions" on public.lab_credit_transactions;
create policy "Users can insert their own transactions"
  on public.lab_credit_transactions for insert
  with check (auth.uid() = user_id and amount <= 0);
