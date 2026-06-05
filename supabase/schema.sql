-- ═══════════════════════════════════════════════════════════════
--  TasteBite — Supabase Database Schema
--  Run this entire file in your Supabase SQL Editor:
--  https://supabase.com/dashboard → your project → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text not null,
  full_name       text,
  phone           text,
  avatar_url      text,
  default_address text,
  is_admin        boolean default false,
  created_at      timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Categories ──────────────────────────────────────────────────
create table public.categories (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ─── Menu Items ──────────────────────────────────────────────────
create table public.menu_items (
  id                  uuid default uuid_generate_v4() primary key,
  category_id         uuid references public.categories(id) on delete set null,
  name                text not null,
  description         text not null default '',
  price               numeric(10,2) not null,
  image_url           text,
  is_available        boolean default true,
  is_featured         boolean default false,
  prep_time_minutes   int default 20,
  calories            int,
  tags                text[] default '{}',
  created_at          timestamptz default now()
);

-- ─── Orders ──────────────────────────────────────────────────────
create type order_status as enum (
  'pending','confirmed','preparing','ready','delivered','cancelled'
);

create table public.orders (
  id                          uuid default uuid_generate_v4() primary key,
  user_id                     uuid references auth.users(id) on delete set null,
  status                      order_status default 'pending',
  total_amount                numeric(10,2) not null,
  delivery_address            text,
  delivery_notes              text,
  estimated_delivery_minutes  int default 35,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.update_updated_at();

-- ─── Order Items ─────────────────────────────────────────────────
create table public.order_items (
  id            uuid default uuid_generate_v4() primary key,
  order_id      uuid references public.orders(id) on delete cascade,
  menu_item_id  uuid references public.menu_items(id) on delete set null,
  quantity      int not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  notes         text
);

-- ─── Row Level Security ───────────────────────────────────────────
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users see/edit only their own
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins see all profiles"      on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Categories & Menu: public read
create policy "Public read categories" on categories for select using (true);
create policy "Public read menu items" on menu_items for select using (true);

-- Categories & Menu: only admins write
create policy "Admin manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admin manage menu items" on menu_items for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Orders: users see own orders; admins see all
create policy "Users see own orders"  on orders for select using (auth.uid() = user_id);
create policy "Users create orders"   on orders for insert with check (auth.uid() = user_id);
create policy "Admins see all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins update orders"  on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Order items: same as orders
create policy "Users see own order items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);
create policy "Users create order items" on order_items for insert with check (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);
create policy "Admins see all order items" on order_items for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ─── Seed Data ───────────────────────────────────────────────────
insert into public.categories (name, slug, description, sort_order) values
  ('Starters',   'starters',   'Light bites to begin your meal',      1),
  ('Mains',      'mains',      'Hearty dishes and signature plates',   2),
  ('Burgers',    'burgers',    'Handcrafted smash burgers',            3),
  ('Pizzas',     'pizzas',     'Stone-baked to perfection',            4),
  ('Sides',      'sides',      'Perfect companions to any meal',       5),
  ('Desserts',   'desserts',   'Sweet finishes',                       6),
  ('Drinks',     'drinks',     'Refreshing beverages',                 7);

-- Seed menu items (uses subquery to get category id by slug)
insert into public.menu_items (category_id, name, description, price, is_featured, prep_time_minutes, calories, tags, image_url) values
  ((select id from categories where slug='starters'), 'Crispy Calamari',       'Golden-fried squid rings with marinara dipping sauce',              12.99, true,  15, 380, ARRAY['seafood','fried'],       'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600'),
  ((select id from categories where slug='starters'), 'Truffle Fries',         'Hand-cut fries tossed in black truffle oil and parmesan',            9.99,  false, 10, 420, ARRAY['vegetarian','truffle'],   'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600'),
  ((select id from categories where slug='starters'), 'Chicken Wings',         '8 wings glazed in choice of sauce: BBQ, buffalo or honey-sriracha', 13.99, true,  20, 640, ARRAY['chicken','spicy'],        'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600'),
  ((select id from categories where slug='mains'),    'Grilled Salmon',        'Atlantic salmon fillet, lemon butter, seasonal greens',             26.99, true,  25, 520, ARRAY['seafood','healthy'],      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600'),
  ((select id from categories where slug='mains'),    'Beef Tenderloin',       '8oz center-cut, chimichurri, roasted potatoes',                     38.99, true,  30, 680, ARRAY['beef','premium'],         'https://images.unsplash.com/photo-1558030006-450675393462?w=600'),
  ((select id from categories where slug='mains'),    'Mushroom Risotto',      'Arborio rice, wild mushrooms, truffle oil, aged parmesan',           22.99, false, 25, 480, ARRAY['vegetarian','risotto'],   'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600'),
  ((select id from categories where slug='burgers'),  'Classic Smash',         'Double smash patty, American cheese, pickles, special sauce',        16.99, true,  15, 780, ARRAY['beef','bestseller'],      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'),
  ((select id from categories where slug='burgers'),  'BBQ Bacon Beast',       'Triple patty, streaky bacon, cheddar, crispy onions, BBQ',          21.99, true,  18, 1100,ARRAY['beef','bacon'],           'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600'),
  ((select id from categories where slug='burgers'),  'Crispy Chicken',        'Buttermilk-fried chicken thigh, slaw, pickled jalapeños, aioli',    17.99, false, 18, 820, ARRAY['chicken','spicy'],        'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600'),
  ((select id from categories where slug='pizzas'),   'Margherita',            'San Marzano tomato, fior di latte, fresh basil, extra virgin olive', 17.99, false, 20, 680, ARRAY['vegetarian','classic'],   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600'),
  ((select id from categories where slug='pizzas'),   'Pepperoni Feast',       'Tomato, mozzarella, double pepperoni, chilli flakes',               20.99, true,  20, 820, ARRAY['meat','spicy'],           'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600'),
  ((select id from categories where slug='pizzas'),   'Truffle Fungi',         'White base, mixed mushrooms, truffle oil, rocket, parmesan',        23.99, false, 22, 740, ARRAY['vegetarian','truffle'],   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'),
  ((select id from categories where slug='sides'),    'Mac & Cheese',          'Creamy four-cheese blend, panko breadcrumb crust',                   7.99,  false, 12, 380, ARRAY['vegetarian'],             'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=600'),
  ((select id from categories where slug='sides'),    'Garden Salad',          'Mixed greens, cherry tomatoes, cucumber, house vinaigrette',          6.99,  false, 5,  120, ARRAY['vegetarian','healthy'],   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'),
  ((select id from categories where slug='desserts'),  'Chocolate Lava Cake',  'Warm dark chocolate fondant, vanilla bean ice cream',               9.99,  true,  15, 580, ARRAY['chocolate','warm'],       'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600'),
  ((select id from categories where slug='desserts'),  'NY Cheesecake',        'Classic New York style, berry compote',                              8.99,  false, 5,  460, ARRAY['cold'],                   'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600'),
  ((select id from categories where slug='drinks'),    'Fresh Lemonade',       'House-squeezed, mint, cane sugar',                                   4.99,  false, 3,  140, ARRAY['cold','fresh'],           'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600'),
  ((select id from categories where slug='drinks'),    'Iced Matcha Latte',    'Ceremonial grade matcha, oat milk, vanilla',                         5.99,  false, 5,  120, ARRAY['cold','matcha'],          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600');
