-- ============================================================
-- СЦК — Синхронизация каталога товаров
-- Запускать в Supabase SQL Editor
-- ============================================================

-- 1. Обновить CHECK constraint категорий (добавить 'rebar')
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('blocks', 'bricks', 'mesh', 'cement', 'rebar', 'other'));

-- 2. Очистить старые товары
TRUNCATE products RESTART IDENTITY CASCADE;

-- 3. Вставить актуальный каталог (14 позиций)
INSERT INTO products (
  name, category,
  price_cash, price_cashless, unit,
  weight_kg, dimensions, strength_grade, purpose,
  in_stock, is_popular, sort_order,
  image_url, description
) VALUES
  -- Блоки шлакоблок
  (
    'Шлакоблок щелевой 390×190×188', 'blocks',
    55, 59, 'шт',
    18, '390×190×188', 'M75', 'wall',
    true, true, 1,
    '/images/shlakoblok-390.jpg',
    'Стеновой щелевой шлакоблок для кладки несущих стен. Марка прочности М75, морозостойкость F50.'
  ),
  (
    'Шлакоблок с круглыми отверстиями 390×190×188', 'blocks',
    52, 56, 'шт',
    17, '390×190×188', 'M75', 'wall',
    true, false, 2,
    '/images/shlakoblok-krugly.jpg',
    'Стеновой шлакоблок с круглыми пустотами. Подходит для гаражей, хозпостроек и заборов.'
  ),
  (
    'Шлакоблок перегородочный 390×90×188', 'blocks',
    38, 41, 'шт',
    9, '390×90×188', 'M75', 'partition',
    true, true, 3,
    '/images/shlakoblok-120.jpg',
    'Тонкий перегородочный шлакоблок для межкомнатных перегородок. Снижает нагрузку на фундамент.'
  ),
  -- Кирпич
  (
    'Кирпич рядовой М125', 'bricks',
    22, 24, 'шт',
    3.5, '250×120×65', 'M125', 'wall',
    true, true, 4,
    '/images/kirpich-ryadovoy.jpg',
    'Полнотелый керамический кирпич для кладки несущих стен, цоколей и фундаментов.'
  ),
  (
    'Кирпич облицовочный М150', 'bricks',
    32, 35, 'шт',
    3.3, '250×120×65', 'M150', 'wall',
    true, false, 5,
    '/images/kirpich-oblitsovochny.jpg',
    'Фасадный кирпич для облицовки фасадов и декоративной кладки. Ровная поверхность.'
  ),
  -- Сетка
  (
    'Сетка кладочная 50×50', 'mesh',
    140, 150, 'м²',
    1.2, '50×50×3мм', null, null,
    true, true, 6,
    '/images/setka-kladochnaya.jpg',
    'Сварная кладочная сетка для армирования кирпичной кладки, стяжки и штукатурки. Оцинкованная проволока.'
  ),
  (
    'Сетка штукатурная ЦПВС оцинк 3×3 мм', 'mesh',
    1750, 1900, 'рул.',
    1.5, '1,0×5,0 м (5 м²), ячейка 3×3 мм, Ø3 мм', null, null,
    true, false, 7,
    '/images/setka-shtukaturna.jpg',
    'Оцинкованная штукатурная сетка ЦПВС для армирования штукатурного слоя. Рулон 1,0×5,0 м (5 м²).'
  ),
  -- Цемент
  (
    'Цемент М500 (50 кг)', 'cement',
    590, 640, 'мешок',
    50, '50 кг', 'M500', null,
    true, true, 8,
    '/images/tsement-m500.jpg',
    'Портландцемент ПЦ 500 Д0. Быстрый набор прочности. Для фундаментов и ответственных конструкций.'
  ),
  (
    'Цемент М400 (50 кг)', 'cement',
    520, 560, 'мешок',
    50, '50 кг', 'M500', null,
    true, false, 9,
    '/images/tsement-m400.jpg',
    'Портландцемент ПЦ 400 Д20. Универсальный цемент для кладочных растворов, штукатурки и стяжки.'
  ),
  -- Газобетон
  (
    'Блок газобетонный D500 600×300×200', 'blocks',
    6500, 7000, 'м³',
    0, '600×300×200', null, 'wall',
    true, false, 10,
    '/images/gazobeton.jpg',
    'Автоклавный газобетон D500. Лёгкий, тёплый, легко обрабатывается. Для малоэтажного строительства.'
  ),
  -- Арматура
  (
    'Арматура А500С Ø8', 'rebar',
    25, 27, 'м.п.',
    0.4, 'Ø8 мм, прутки 11,7 м', 'M500', null,
    true, false, 11,
    '/images/armatura.jpg',
    'Арматура стальная рифлёная А500С ГОСТ 34028-2016. Диаметр 8 мм, прутки 11,7 м.'
  ),
  (
    'Арматура А500С Ø10', 'rebar',
    35, 38, 'м.п.',
    0.62, 'Ø10 мм, прутки 11,7 м', 'M500', null,
    true, true, 12,
    '/images/armatura.jpg',
    'Арматура стальная рифлёная А500С ГОСТ 34028-2016. Диаметр 10 мм, прутки 11,7 м.'
  ),
  (
    'Арматура А500С Ø12', 'rebar',
    48, 52, 'м.п.',
    0.89, 'Ø12 мм, прутки 11,7 м', 'M500', null,
    true, true, 13,
    '/images/armatura.jpg',
    'Арматура стальная рифлёная А500С ГОСТ 34028-2016. Диаметр 12 мм, прутки 11,7 м.'
  ),
  (
    'Арматура А500С Ø14', 'rebar',
    68, 73, 'м.п.',
    1.21, 'Ø14 мм, прутки 11,7 м', 'M500', null,
    true, false, 14,
    '/images/armatura.jpg',
    'Арматура стальная рифлёная А500С ГОСТ 34028-2016. Диаметр 14 мм, прутки 11,7 м.'
  );

-- Проверить результат
SELECT id, name, category, price_cash, price_cashless, unit, sort_order
FROM products
ORDER BY sort_order;

-- ============================================================
-- Таблица Мои объекты (sites)
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  address         text NOT NULL,
  contact_person  text,
  contact_phone   text,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- RLS для sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sites_select_own" ON sites;
DROP POLICY IF EXISTS "sites_insert_own" ON sites;
DROP POLICY IF EXISTS "sites_delete_own" ON sites;

CREATE POLICY "sites_select_own" ON sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sites_insert_own" ON sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sites_delete_own" ON sites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Таблица документов по заказам (order_documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  type         text CHECK (type IN ('invoice', 'upd', 'contract', 'receipt')) NOT NULL,
  file_url     text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_select_own" ON order_documents;
CREATE POLICY "docs_select_own" ON order_documents
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );
