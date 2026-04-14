alter table public.partner_applications
  add column if not exists activated_lab_id uuid references public.labs(id) on delete set null,
  add column if not exists activated_by uuid references auth.users(id) on delete set null,
  add column if not exists activated_at timestamptz;
