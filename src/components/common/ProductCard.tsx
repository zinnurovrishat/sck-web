import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { Badge } from '../ui/badge'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'

interface Props {
  product: Product
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'

export default function ProductCard({ product }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem(product, quantity)
    setQuantity(1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#f97316]/40 hover:shadow-md transition-all group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.is_popular && (
          <Badge className="absolute top-2 left-2 z-10 bg-[#f97316] hover:bg-[#f97316] text-white text-xs">
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.dimensions}</p>
        <h3 className="font-semibold text-[#1e3a5f] text-sm leading-tight mb-3 flex-1">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="flex gap-3 mb-4 text-sm">
          <div>
            <span className="text-xs text-gray-400 block">Нал</span>
            <span className="font-bold text-[#1e3a5f]">
              {product.price_cash} ₽/{product.unit}
            </span>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <span className="text-xs text-gray-400 block">Безнал</span>
            <span className="font-medium text-gray-600">
              {product.price_cashless} ₽/{product.unit}
            </span>
          </div>
        </div>

        {/* Add to cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-lg transition-colors cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.in_stock}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg transition-all cursor-pointer ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#1e3a5f] hover:bg-[#162d4a] disabled:opacity-40 disabled:cursor-not-allowed text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Добавлено
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                В корзину
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
