-- ============================================================
-- СЦК — Supabase Schema
-- Запустить в: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── products ────────────────────────────────────────────────

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null check (category in ('blocks', 'bricks', 'mesh', 'cement', 'other')),
  price_cash     numeric not null,
  price_cashless numeric not null,
  unit           text not null,
  weight_kg      numeric,
  dimensions     text,
  strength_grade text,
  purpose        text,
  in_stock       boolean default true,
  is_popular     boolean default false,
  sort_order     integer default 0,
  image_url      text,
  description    text,
  created_at     timestamptz default now()
);

alter table public.products enable row level security;

-- Все могут читать товары
create policy "products_public_read" on public.products
  for select using (true);

-- ── orders ──────────────────────────────────────────────────

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,
  customer_name   text,
  customer_phone  text not null,
  items           jsonb not null,
  total_amount    numeric not null,
  total_weight    numeric,
  payment_method  text not null check (payment_method in ('cash', 'cashless')),
  delivery_method text not null check (delivery_method in ('manipulator', 'pickup')),
  status          text default 'pending',
  created_at      timestamptz default now()
);

alter table public.orders enable row level security;

-- Все могут создавать заявки (анонимно)
create policy "orders_public_insert" on public.orders
  for insert with check (true);

-- ── seed: products ───────────────────────────────────────────

insert into public.products
  (name, category, price_cash, price_cashless, unit, weight_kg, dimensions, strength_grade, purpose, in_stock, is_popular, sort_order, image_url, description)
values
  (
    'Шлакоблок 390×190×190', 'blocks', 28, 30, 'шт', 18, '390×190×190',
    'M75', 'wall', true, true, 1,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'Стеновой блок для несущих стен и перегородок'
  ),
  (
    'Шлакоблок 390×190×120', 'blocks', 22, 24, 'шт', 12, '390×190×120',
    'M75', 'partition', true, true, 2,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'Полублок для перегородок и облицовки'
  ),
  (
    'Кирпич рядовой М125', 'bricks', 12, 13, 'шт', 3.5, '250×120×65',
    'M125', 'wall', true, true, 3,
    'https://images.unsplash.com/photo-1590644365607-f2da7e7c31e1?w=400&q=80',
    'Полнотелый керамический кирпич для кладки стен'
  ),
  (
    'Кирпич облицовочный М150', 'bricks', 18, 20, 'шт', 3.3, '250×120×65',
    'M150', 'wall', true, false, 4,
    'https://images.unsplash.com/photo-1590644365607-f2da7e7c31e1?w=400&q=80',
    'Фасадный кирпич для облицовки'
  ),
  (
    'Сетка кладочная 50×50', 'mesh', 140, 150, 'м²', 1.2, '50×50×3мм',
    null, null, true, true, 5,
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
    'Для армирования кладки и стяжки'
  ),
  (
    'Цемент М500 (50 кг)', 'cement', 380, 400, 'мешок', 50, '50 кг',
    'M500', null, true, true, 6,
    'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400&q=80',
    'Портландцемент ПЦ 500 Д0'
  ),
  (
    'Блок газобетонный 600×300×200', 'blocks', 55, 58, 'шт', 9, '600×300×200',
    'M100', 'wall', true, false, 7,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'Автоклавный газобетон D500'
  ),
  (
    'Цемент М400 (50 кг)', 'cement', 340, 360, 'мешок', 50, '50 кг',
    'M200', null, true, false, 8,
    'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400&q=80',
    'Портландцемент ПЦ 400 Д20'
  );
