import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, TrendingUp, ShoppingBag, BadgePercent, LogOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface OrderItem {
  name: string
  quantity: number
  price: number
  unit: string
}

interface Order {
  id: string
  order_number: string
  created_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  total_amount: number
  total_weight: number
  payment_method: 'cash' | 'cashless'
  delivery_method: 'manipulator' | 'pickup'
  items: OrderItem[]
}

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Новый',
  confirmed: 'Подтверждён',
  completed: 'Выполнен',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function calcDiscount(completedCount: number): number {
  if (completedCount >= 20) return 10
  if (completedCount >= 10) return 5
  if (completedCount >= 5) return 3
  if (completedCount >= 1) return 1
  return 0
}

function nextDiscountInfo(completedCount: number): { target: number; discount: number } | null {
  if (completedCount >= 20) return null
  if (completedCount >= 10) return { target: 20, discount: 10 }
  if (completedCount >= 5) return { target: 10, discount: 5 }
  if (completedCount >= 1) return { target: 5, discount: 3 }
  return { target: 1, discount: 1 }
}

type Tab = 'orders' | 'settings'

export default function CabinetPage() {
  const { user, token, loading, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('orders')

  if (loading) return null
  if (!user || !token) return <Navigate to="/login" replace />

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Order[]
    },
    enabled: !!user.id,
  })

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalAmount = orders.reduce((s, o) => s + o.total_amount, 0)
  const discount = calcDiscount(completedOrders.length)
  const nextDisc = nextDiscountInfo(completedOrders.length)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-[#1e3a5f] transition-colors">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#1e3a5f] font-medium">Личный кабинет</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg">
              {user.name?.[0]?.toUpperCase() ?? 'К'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Личный кабинет</h1>
            <p className="text-sm text-gray-400">{user.name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            icon: Package,
            label: 'Всего заказов',
            value: orders.length,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            icon: TrendingUp,
            label: 'Выполнено',
            value: completedOrders.length,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            icon: ShoppingBag,
            label: 'Общая сумма',
            value: `${totalAmount.toLocaleString('ru-RU')} ₽`,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            icon: BadgePercent,
            label: 'Ваша скидка',
            value: `${discount}%`,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${bg} rounded-2xl p-4`}
          >
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Discount banner */}
      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 mb-6 text-white"
        >
          <div className="flex items-start gap-3">
            <BadgePercent className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Персональная скидка {discount}%</p>
              <p className="text-purple-200 text-sm">
                За {completedOrders.length}{' '}
                {completedOrders.length === 1
                  ? 'выполненный заказ'
                  : completedOrders.length < 5
                  ? 'выполненных заказа'
                  : 'выполненных заказов'}
                . Скидка применяется автоматически при оформлении новых заказов.
                {nextDisc && (
                  <> До скидки {nextDisc.discount}% осталось{' '}
                  {nextDisc.target - completedOrders.length} заказов.</>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6 gap-1">
        {([['orders', Package, 'История заказов'], ['settings', BadgePercent, 'Настройки']] as const).map(
          ([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
                tab === t
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ),
        )}
      </div>

      {/* Tab: Orders */}
      {tab === 'orders' && (
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">История заказов</h2>

          {ordersLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Заказов пока нет</p>
              <p className="text-sm mt-1">
                Оформите первый заказ в{' '}
                <Link to="/shop" className="text-[#f97316] hover:underline">
                  каталоге
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#1e3a5f]">Заказ №{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span>Товаров: {order.items?.length ?? 0}</span>
                    {order.total_weight > 0 && (
                      <span>
                        Вес:{' '}
                        {order.total_weight >= 1000
                          ? `${(order.total_weight / 1000).toFixed(1)} т`
                          : `${order.total_weight} кг`}
                      </span>
                    )}
                    <span>
                      {order.payment_method === 'cash' ? 'Наличные' : 'Безналичный'}
                    </span>
                    <span>
                      {order.delivery_method === 'manipulator' ? 'Манипулятор' : 'Самовывоз'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {(order.items ?? []).slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                      {(order.items?.length ?? 0) > 3 && (
                        <span className="text-xs text-gray-400">
                          +{order.items.length - 3} ещё
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-[#f97316] text-lg shrink-0 ml-4">
                      {order.total_amount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {tab === 'settings' && (
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">Настройки</h2>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-14 h-14 rounded-full" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-xl">
                  {user.name?.[0]?.toUpperCase() ?? 'К'}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1e3a5f]">{user.name}</p>
                {user.username && (
                  <p className="text-sm text-gray-400">@{user.username}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Ваш аккаунт привязан к Telegram. Данные обновляются автоматически при каждом входе.
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Выйти из кабинета
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
