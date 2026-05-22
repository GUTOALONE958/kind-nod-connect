-- Remove the redundant foreign key to auth.users in favor of profiles
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS fk_withdrawals_user;
