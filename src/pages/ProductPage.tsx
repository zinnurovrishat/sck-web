import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Check, Package } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { useSEO } from '../hooks/useSEO'
import { COMPANY_PHONE, COMPANY_PHONE_HREF } from '../lib/constants'

const FALLBACK_IMAGE = '/images/shlakoblok-390.jpg'

const PURPOSE_LABELS = {
  partition: 'Перегородка',
  wall: 'Несущая стена',
  universal: 'Универсальный',
}

function ProductSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-24 bg-gray-100 rounded-xl mt-2" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl mt-auto" />
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: products = [], isPlaceholderData } = useProducts()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = products.find(p => p.id === id)

  useSEO(
    product?.name ?? 'Товар',
    product?.description ?? undefined,
    { image: product?.image_url || undefined, type: 'product' },
  )

  // JSON-LD: Product structured data
  useEffect(() => {
    if (!product) return
    const existing = document.getElementById('json-ld-product')
    if (existing) existing.remove()
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'json-ld-product'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      ...(product.description && { description: product.description }),
      image: product.image_url || FALLBACK_IMAGE,
      offers: {
        '@type': 'Offer',
        price: product.price_cash,
        priceCurrency: 'RUB',
        availability: product.in_stock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'СЦК — Стерлитамакский центр комплектации' },
      },
    })
    document.head.appendChild(script)
    return () => { document.getElementById('json-ld-product')?.remove() }
  }, [product])

  // Show skeleton while loading from Supabase (placeholder data might not have this product)
  if (!product && isPlaceholderData) {
    return <ProductSkeleton />
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Товар не найден</p>
        <Link to="/shop" className="mt-3 inline-block text-[#f97316] hover:underline text-sm">
          ← Вернуться в каталог
        </Link>
      </div>
    )
  }

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const specs: { label: string; value: string }[] = []
  if (product.dimensions) specs.push({ label: 'Размер', value: product.dimensions })
  if (product.strength_grade) specs.push({ label: 'Марка прочности', value: product.strength_grade })
  if (product.weight_kg > 0) specs.push({ label: 'Вес', value: `${product.weight_kg} кг` })
  if (product.purpose) specs.push({ label: 'Назначение', value: PURPOSE_LABELS[product.purpose] })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#1e3a5f] transition-colors">Главная</Link>
        <span>›</span>
        <Link to="/shop" className="hover:text-[#1e3a5f] transition-colors">Каталог</Link>
        <span>›</span>
        <span className="text-[#1e3a5f] font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50">
          {product.is_popular && (
            <Badge className="absolute top-3 left-3 z-10 bg-[#f97316] hover:bg-[#f97316] text-white">
              Хит продаж
            </Badge>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-sm font-medium text-gray-400">Нет в наличии</span>
            </div>
          )}
          <img
            src={product.image_url || FALLBACK_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">{product.name}</h1>

          {product.description && (
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{product.description}</p>
          )}

          {/* Specs table */}
          {specs.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                {specs.map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-sm font-semibold text-[#1e3a5f]">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prices */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-[#1e3a5f]/5 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Наличные</p>
              <p className="text-xl font-bold text-[#1e3a5f]">{product.price_cash.toLocaleString('ru-RU')} ₽</p>
              <p className="text-xs text-gray-400">за {product.unit}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Безналичный</p>
              <p className="text-xl font-bold text-gray-600">{product.price_cashless.toLocaleString('ru-RU')} ₽</p>
              <p className="text-xs text-gray-400">за {product.unit}</p>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition-colors cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(999, q + 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all cursor-pointer ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-[#f97316] hover:bg-[#ea6c04] disabled:opacity-40 disabled:cursor-not-allowed text-white'
              }`}
            >
              {added ? (
                <><Check className="h-5 w-5" /> Добавлено</>
              ) : (
                <><ShoppingCart className="h-5 w-5" /> В корзину</>
              )}
            </button>
          </div>

          {!product.in_stock && (
            <p className="text-sm text-gray-400 mt-2">
              Нет в наличии — позвоните для уточнения:{' '}
              <a href={COMPANY_PHONE_HREF} className="text-[#f97316] hover:underline">{COMPANY_PHONE}</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
