import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, TrendingUp, ShoppingBag, BadgePercent, LogOut, ChevronRight, Settings, MapPin, Plus, Trash2, X, FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useSEO } from '../hooks/useSEO'
import { calcDiscount, nextDiscountInfo } from '../lib/discount'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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


interface OrderDocument {
  id: string
  order_id: string
  type: 'invoice' | 'upd' | 'contract' | 'receipt'
  file_url: string
  created_at: string
}

const DOC_TYPE_LABELS: Record<OrderDocument['type'], string> = {
  invoice: 'Накладная',
  upd: 'УПД',
  contract: 'Договор',
  receipt: 'Чек',
}

interface Site {
  id: string
  name: string
  address: string
  contact_person?: string
  contact_phone?: string
  notes?: string
}

type Tab = 'orders' | 'documents' | 'sites' | 'settings'

export default function CabinetPage() {
  useSEO('Личный кабинет')
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

  const queryClient = useQueryClient()

  const { data: documents = [] } = useQuery<OrderDocument[]>({
    queryKey: ['order_documents', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_documents')
        .select('*, orders!inner(user_id)')
        .eq('orders.user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) return []
      return (data ?? []) as OrderDocument[]
    },
    enabled: !!user.id,
  })

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites', user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('sites').select('*').eq('user_id', user.id).order('created_at')
      if (error) return []
      return (data ?? []) as Site[]
    },
    enabled: !!user.id,
  })

  const [showSiteForm, setShowSiteForm] = useState(false)
  const [siteForm, setSiteForm] = useState({ name: '', address: '', contact_person: '', contact_phone: '', notes: '' })

  const addSite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('sites').insert({
        user_id: user.id,
        name: siteForm.name.trim(),
        address: siteForm.address.trim(),
        contact_person: siteForm.contact_person.trim() || null,
        contact_phone: siteForm.contact_phone.trim() || null,
        notes: siteForm.notes.trim() || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', user.id] })
      setShowSiteForm(false)
      setSiteForm({ name: '', address: '', contact_person: '', contact_phone: '', notes: '' })
    },
  })

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites', user.id] }),
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
        {([['orders', Package, 'История заказов'], ['documents', FileText, 'Документы'], ['sites', MapPin, 'Мои объекты'], ['settings', Settings, 'Настройки']] as const).map(
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

      {/* Tab: Documents */}
      {tab === 'documents' && (
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">Документы</h2>
          {documents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Документов пока нет</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">
                Накладные, УПД и договоры появятся здесь после подтверждения заказа менеджером
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {documents.map(doc => {
                const order = orders.find(o => o.id === doc.order_id)
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-[#1e3a5f]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1e3a5f]">{DOC_TYPE_LABELS[doc.type]}</p>
                        {order && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Заказ №{order.order_number} ·{' '}
                            {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1.5 text-sm font-medium text-[#f97316] hover:text-[#ea6c04] transition-colors shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      Скачать
                    </a>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Sites */}
      {tab === 'sites' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Мои объекты</h2>
            <button
              onClick={() => setShowSiteForm(v => !v)}
              className="flex items-center gap-1.5 text-sm bg-[#f97316] hover:bg-[#ea6c04] text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {showSiteForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showSiteForm ? 'Отмена' : 'Добавить объект'}
            </button>
          </div>

          {showSiteForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 mb-4"
            >
              <h3 className="font-semibold text-[#1e3a5f] mb-4">Новый объект</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Название объекта <span className="text-red-400">*</span></Label>
                  <Input placeholder="Напр.: Дом в Ишимбае" value={siteForm.name}
                    onChange={e => setSiteForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Адрес <span className="text-red-400">*</span></Label>
                  <Input placeholder="ул. Ленина, 10" value={siteForm.address}
                    onChange={e => setSiteForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Контактное лицо</Label>
                  <Input placeholder="Прораб Иван" value={siteForm.contact_person}
                    onChange={e => setSiteForm(f => ({ ...f, contact_person: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Телефон на объекте</Label>
                  <Input placeholder="+7 (___) ___-__-__" value={siteForm.contact_phone}
                    onChange={e => setSiteForm(f => ({ ...f, contact_phone: e.target.value }))} />
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-xs text-gray-500 mb-1 block">Заметки</Label>
                <textarea
                  placeholder="Особенности въезда, время работы и т.д."
                  value={siteForm.notes}
                  onChange={e => setSiteForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none"
                />
              </div>
              <button
                onClick={() => addSite.mutate()}
                disabled={!siteForm.name.trim() || !siteForm.address.trim() || addSite.isPending}
                className="bg-[#1e3a5f] hover:bg-[#162d4a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
              >
                {addSite.isPending ? 'Сохраняем...' : 'Сохранить объект'}
              </button>
            </motion.div>
          )}

          {sites.length === 0 && !showSiteForm ? (
            <div className="text-center py-16 text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Объектов пока нет</p>
              <p className="text-sm mt-1">Добавьте адрес стройки для быстрого оформления доставки</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sites.map(site => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-[#1e3a5f]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1e3a5f]">{site.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{site.address}</p>
                        {site.contact_person && (
                          <p className="text-xs text-gray-400 mt-1">
                            {site.contact_person}
                            {site.contact_phone && ` · ${site.contact_phone}`}
                          </p>
                        )}
                        {site.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">{site.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSite.mutate(site.id)}
                      disabled={deleteSite.isPending}
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
            <p className="text-sm text-gray-400">
              Аккаунт привязан к Telegram. Данные обновляются автоматически при каждом входе.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
