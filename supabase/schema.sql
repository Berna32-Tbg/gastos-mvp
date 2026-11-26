-- Ejecutar en Supabase > SQL Editor
create table if not exists categories(
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null, icon text,
  deleted boolean default false, updated_at timestamptz not null);

create table if not exists budgets(
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  category_id uuid not null references categories(id) on delete cascade,
  amount numeric not null check (amount > 0),
  period text not null check (period in ('weekly','monthly')),
  start_date timestamptz not null,
  deleted boolean default false, updated_at timestamptz not null);

create table if not exists expenses(
  id uuid primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  category_id uuid not null references categories(id),
  amount numeric not null check (amount > 0),
  description text, date timestamptz not null,
  deleted boolean default false, updated_at timestamptz not null);

alter table categories enable row level security;
alter table budgets    enable row level security;
alter table expenses   enable row level security;

create policy "own categories" on categories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own budgets"    on budgets    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own expenses"   on expenses   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
