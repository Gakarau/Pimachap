-- Paystack payment integration support
-- Adds paystack_reference, booking_metadata, and rider_fee_kes to orders

alter table public.orders
  add column if not exists paystack_reference text unique,
  add column if not exists rider_fee_kes integer not null default 0,
  add column if not exists booking_metadata jsonb not null default '{}'::jsonb;

-- Update default provider to paystack
alter table public.payments
  alter column provider set default 'paystack';

comment on column public.orders.paystack_reference is 'Paystack transaction reference, set when transaction is initialized';
comment on column public.orders.rider_fee_kes is 'Phlebotomist rider fee in KES';
comment on column public.orders.booking_metadata is 'JSON snapshot of cart, schedule, and delivery preferences at time of booking';
