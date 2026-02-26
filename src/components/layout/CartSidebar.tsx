import { useState } from 'react'
import { Minus, Plus, X, ShoppingCart, Truck, Package } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'
import OrderModal from '../common/OrderModal'

export default function CartSidebar() {
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    deliveryMethod,
    setDeliveryMethod,
    totalAmount,
    totalWeight,
  } = useCart()

  const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₽'

  return (
    <>
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <ShoppingCart className="h-5 w-5" />
            Корзина
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-gray-400">
            <ShoppingCart className="h-12 w-12 opacity-30" />
            <p className="text-sm">Корзина пуста</p>
            <p className="text-xs">Добавьте товары из каталога</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-3">
              {items.map(item => {
                const price =
                  paymentMethod === 'cash'
                    ? item.product.price_cash
                    : item.product.price_cashless
                return (
                  <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1e3a5f] leading-tight">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {price} ₽/{item.product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#f97316] transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#f97316] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Options */}
            <div className="border-t pt-4 flex flex-col gap-4">
              {/* Payment */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Способ оплаты</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'cashless'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
                      }`}
                    >
                      {m === 'cash' ? 'Наличные' : 'Безналичный'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Доставка</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryMethod('manipulator')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'manipulator'
                        ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" /> Манипулятор
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
                    }`}
                  >
                    <Package className="h-3.5 w-3.5" /> Самовывоз
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Итого</p>
                  <p className="text-lg font-bold text-[#1e3a5f]">{formatPrice(totalAmount)}</p>
                </div>
                <p className="text-xs text-gray-400">
                  Вес: {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)} т` : `${totalWeight} кг`}
                </p>
              </div>

              <Button
                onClick={() => setOrderModalOpen(true)}
                className="w-full bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold py-3 rounded-xl cursor-pointer"
              >
                Оформить заявку
              </Button>
              <p className="text-center text-xs text-gray-400">
                Менеджер перезвонит в течение 15 минут
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>

    <OrderModal
      open={orderModalOpen}
      onClose={() => setOrderModalOpen(false)}
      items={items}
      paymentMethod={paymentMethod}
      deliveryMethod={deliveryMethod}
      totalAmount={totalAmount}
      totalWeight={totalWeight}
      onSuccess={() => {
        setOrderModalOpen(false)
        clearCart()
        closeCart()
      }}
    />
    </>
  )
}
