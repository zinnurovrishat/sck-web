import { useState, useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { PRODUCTS, CATEGORY_LABELS } from '../data/products'
import type { ProductCategory, StrengthGrade } from '../types'
import ProductCard from '../components/common/ProductCard'

const CATEGORIES = ['all', 'blocks', 'bricks', 'mesh', 'cement', 'other'] as const
const GRADES: StrengthGrade[] = ['M50', 'M75', 'M100', 'M125', 'M150', 'M200', 'M500']
const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
]

export default function ShopPage() {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [grades, setGrades] = useState<StrengthGrade[]>([])
  const [sort, setSort] = useState('popular')
  const [filterOpen, setFilterOpen] = useState(false)

  const toggleGrade = (g: StrengthGrade) =>
    setGrades(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]))

  const filtered = useMemo(() => {
    let result = PRODUCTS.filter(p => p.in_stock)
    if (category !== 'all') result = result.filter(p => p.category === category)
    if (grades.length > 0)
      result = result.filter(p => p.strength_grade && grades.includes(p.strength_grade))
    if (sort === 'popular') result = [...result].sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0))
    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price_cash - b.price_cash)
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price_cash - a.price_cash)
    return result
  }, [category, grades, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-400 mb-6">
        <span>Главная</span> <span className="mx-1.5">›</span>
        <span className="text-[#1e3a5f] font-medium">Каталог товаров</span>
      </nav>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">Каталог товаров</h1>
          <p className="text-sm text-gray-400 mt-1">
            Стройматериалы с доставкой по Стерлитамаку · {filtered.length} товаров
          </p>
        </div>

        {/* Sort + mobile filter toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="md:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:border-[#1e3a5f] cursor-pointer"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Фильтры
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar filters ── */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-48 shrink-0`}>
          {/* Category */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Категория
            </p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#1e3a5f] text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'Все товары' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Strength grade */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Марка прочности
            </p>
            <div className="flex flex-col gap-2">
              {GRADES.map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={grades.includes(g)}
                    onChange={() => toggleGrade(g)}
                    className="w-4 h-4 rounded accent-[#1e3a5f] cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1e3a5f] transition-colors">
                    {g}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Products grid ── */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-lg font-medium">Товары не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
