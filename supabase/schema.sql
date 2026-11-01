create table if not exists products (
  id text primary key, name text not null,
  "pricePi" float8 not null check ("pricePi" > 0),
  category text not null, image text not null,
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true,
  sizes jsonb, colors jsonb, description text,
  updated_at timestamptz default now()
);
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  "paymentId" text unique not null, txid text,
  "customerName" text, phone text, address text, "deliveryType" text,
  "productIds" jsonb, "totalPi" float8, status text default 'paid',
  created_at timestamptz default now()
);
-- RLS ON, no anon policies: the app reads/writes only through server routes (service role).
alter table products enable row level security;
alter table orders enable row level security;
create or replace function decrement_stock(p_id text, p_qty int) returns void language sql as $$
  update products set stock = greatest(stock - p_qty, 0), updated_at = now() where id = p_id;
$$;
