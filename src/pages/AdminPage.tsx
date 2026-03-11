import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, LogOut, RefreshCw, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string
const STORAGE_KEY = 'sck_admin_auth'
const NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-customer`
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const PAGE_SIZE = 50

type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface OrderItem {
  name: string
  qty?: number
  quantity?: number
  unit: string
  price: number
}

interface Order {
  id: string
  order_number: string
  created_at: string
  customer_name: string | null
  customer_phone: string
  status: OrderStatus
  total_amount: number
  total_weight: number
  payment_method: 'cash' | 'cashless'
  delivery_method: 'manipulator' | 'pickup'
  items: OrderItem[]
  user_id: string | null
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Новый',
  confirmed: 'Подтверждён',
  completed: 'Выполнен',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setAuthed(true)
    } else {
      setPwError(true)
    }
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }

  const loadOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1)
    const rows = (data ?? []) as Order[]
    setOrders(rows)
    setHasMore(rows.length === PAGE_SIZE)
    setLoading(false)
  }

  const loadMore = async () => {
    setLoadingMore(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(orders.length, orders.length + PAGE_SIZE - 1)
    const rows = (data ?? []) as Order[]
    setOrders(prev => [...prev, ...rows])
    setHasMore(rows.length === PAGE_SIZE)
    setLoadingMore(false)
  }

  useEffect(() => {
    if (authed) loadOrders()
  }, [authed])

  const changeStatus = async (order: Order, newStatus: OrderStatus) => {
    setUpdating(order.id)
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)

    if (order.user_id) {
      try {
        await fetch(NOTIFY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ order_id: order.id, new_status: newStatus }),
        })
      } catch { /* ignore */ }
    }

    setOrders(prev =>
      prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o)),
    )
    setUpdating(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">Панель управления</h1>
          <p className="text-sm text-gray-400 mb-6">СЦК — только для сотрудников</p>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={`w-full border rounded-xl px-4 py-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
              pwError ? 'border-red-400' : 'border-gray-200'
            }`}
            autoFocus
          />
          {pwError && <p className="text-xs text-red-400 mb-3">Неверный пароль</p>}
          <button
            onClick={login}
            className="w-full bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl hover:bg-[#162d4a] transition-colors cursor-pointer mt-1"
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-[#1e3a5f] transition-colors">Сайт</Link>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <span className="font-semibold text-[#1e3a5f]">Заявки</span>
          <span className="ml-2 text-xs text-gray-400">({orders.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            title="Обновить"
            className="text-gray-400 hover:text-[#1e3a5f] cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', ...STATUS_FLOW] as const).map(s => {
            const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filterStatus === s
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1e3a5f]'
                }`}
              >
                {s === 'all' ? 'Все' : STATUS_LABELS[s]} ({count})
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Заявок нет</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-[#1e3a5f]">{order.order_number}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="font-bold text-[#f97316] text-lg">
                    {order.total_amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>

                {/* Customer info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                  {order.customer_name && <span>👤 {order.customer_name}</span>}
                  <a href={`tel:${order.customer_phone.replace(/\D/g, '')}`} className="text-[#1e3a5f] hover:underline">
                    📱 {order.customer_phone}
                  </a>
                  <span>{order.payment_method === 'cash' ? '💵 Наличные' : '🏦 Безналичный'}</span>
                  <span>{order.delivery_method === 'manipulator' ? '🚚 Манипулятор' : '📦 Самовывоз'}</span>
                  {order.total_weight > 0 && (
                    <span>
                      ⚖️{' '}
                      {order.total_weight >= 1000
                        ? `${(order.total_weight / 1000).toFixed(1)} т`
                        : `${order.total_weight} кг`}
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(order.items ?? []).map((item, i) => (
                    <span key={i} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg">
                      {item.name} × {item.qty ?? item.quantity} {item.unit}
                    </span>
                  ))}
                </div>

                {/* Status change buttons */}
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.filter(s => s !== order.status).map(s => (
                    <button
                      key={s}
                      onClick={() => changeStatus(order, s)}
                      disabled={updating === order.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 ${STATUS_COLORS[s]} hover:opacity-80`}
                    >
                      → {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#1e3a5f] hover:border-[#1e3a5f] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : null}
              {loadingMore ? 'Загружаем...' : 'Загрузить ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
