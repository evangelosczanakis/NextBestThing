-- Run this in your Supabase SQL Editor

create table transactions (
  id text primary key,
  amount numeric,
  merchant text,
  category text,
  type text,
  date timestamptz,
  updated_at timestamptz default now(),
  _deleted boolean default false
);

-- Enable RLS (Row Level Security)
alter table transactions enable row level security;

-- Policy: Allow anonymous access (For MVP only)
create policy "Public Access" on transactions
for all using (true) with check (true);

-- Enable Realtime
alter publication supabase_realtime add table transactions;
