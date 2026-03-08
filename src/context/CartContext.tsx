import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CartItem, Product, PaymentMethod, DeliveryMethod } from '../types'

interface CartContextType {
  items: CartItem[]
  paymentMethod: PaymentMethod
  deliveryMethod: DeliveryMethod
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setPaymentMethod: (method: PaymentMethod) => void
  setDeliveryMethod: (method: DeliveryMethod) => void
  openCart: () => void
  closeCart: () => void
  totalItems: number
  totalAmount: number
  totalWeight: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'sck_cart'

function loadFromStorage(): { items: CartItem[]; paymentMethod: PaymentMethod; deliveryMethod: DeliveryMethod } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], paymentMethod: 'cash', deliveryMethod: 'manipulator' }
    return JSON.parse(raw)
  } catch {
    return { items: [], paymentMethod: 'cash', deliveryMethod: 'manipulator' }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const saved = loadFromStorage()
  const [items, setItems] = useState<CartItem[]>(saved.items)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(saved.paymentMethod)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(saved.deliveryMethod)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, paymentMethod, deliveryMethod }))
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — ignore silently
    }
  }, [items, paymentMethod, deliveryMethod])

  const addItem = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity }]
    })
    setIsOpen(true)
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const totalAmount = items.reduce((sum, i) => {
    const price = paymentMethod === 'cash' ? i.product.price_cash : i.product.price_cashless
    return sum + price * i.quantity
  }, 0)

  const totalWeight = items.reduce(
    (sum, i) => sum + i.product.weight_kg * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        paymentMethod,
        deliveryMethod,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setPaymentMethod,
        setDeliveryMethod,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        totalItems,
        totalAmount,
        totalWeight,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
