import { createContext, useContext, useState, type ReactNode } from 'react'
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('manipulator')
  const [isOpen, setIsOpen] = useState(false)

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
