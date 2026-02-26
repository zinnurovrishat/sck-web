import { useState, useMemo } from 'react'
import { Plus, X, ShoppingCart, Calculator, Info, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'

interface Opening {
  id: string
  width: number
  height: number
}

type WallThickness = 40 | 20

interface CalcState {
  length: number
  width: number
  height: number
  thickness: WallThickness
  blockId: string
  jointMm: number
  wastePct: number
  doors: Opening[]
  windows: Opening[]
}

const BLOCK_PRODUCTS = PRODUCTS.filter(p => p.category === 'blocks')

function newOpening(): Opening {
  return { id: Math.random().toString(36).slice(2), width: 0.9, height: 2.1 }
}

function newWindow(): Opening {
  return { id: Math.random().toString(36).slice(2), width: 1.2, height: 1.4 }
}

export default function CalculatorPage() {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const [state, setState] = useState<CalcState>({
    length: 10,
    width: 8,
    height: 3,
    thickness: 40,
    blockId: BLOCK_PRODUCTS[0]?.id ?? '',
    jointMm: 10,
    wastePct: 10,
    doors: [newOpening()],
    windows: [newWindow()],
  })

  const update = (patch: Partial<CalcState>) =>
    setState(prev => ({ ...prev, ...patch }))

  const selectedBlock = PRODUCTS.find(p => p.id === state.blockId) ?? BLOCK_PRODUCTS[0]

  const result = useMemo(() => {
    if (!selectedBlock) return null

    const perimeter = 2 * (state.length + state.width)
    const wallArea = perimeter * state.height

    const doorsArea = state.doors.reduce((s, d) => s + d.width * d.height, 0)
    const windowsArea = state.windows.reduce((s, w) => s + w.width * w.height, 0)
    const netArea = Math.max(0, wallArea - doorsArea - windowsArea)

    // Parse block dimensions e.g. "390×190×190" → [L, H, W] in mm
    const dims = selectedBlock.dimensions
      .split(/[×x×]/)
      .map(d => parseFloat(d.replace(/[^0-9.]/g, '')))
    if (dims.length < 3) return null

    const blockL = (dims[0] + state.jointMm) / 1000 // metres
    const blockH = (dims[1] + state.jointMm) / 1000

    const blocksPerSqm = 1 / (blockL * blockH)
    const baseCount = Math.ceil(netArea * blocksPerSqm)
    const withWaste = Math.ceil(baseCount * (1 + state.wastePct / 100))

    const weightKg = withWaste * selectedBlock.weight_kg
    const costCash = withWaste * selectedBlock.price_cash
    const costCashless = withWaste * selectedBlock.price_cashless

    // Pallet calculation
    const blockThickness = dims[2] ?? 190
    const blocksPerPallet = blockThickness <= 100 ? 144 : 72
    const pallets = Math.ceil(withWaste / blocksPerPallet)
    const palletDeposit = pallets * 300

    // KamAZ capacity
    const truckLoads = Math.ceil(pallets / 16)
    const truckLoadsWithTrailer = Math.ceil(pallets / 30)

    return {
      netArea, baseCount, withWaste, weightKg, costCash, costCashless,
      blocksPerPallet, pallets, palletDeposit, truckLoads, truckLoadsWithTrailer,
    }
  }, [state, selectedBlock])

  const handleAddToCart = () => {
    if (!result || !selectedBlock) return
    addItem(selectedBlock, result.withWaste)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Result panel JSX extracted for reuse
  const resultPanel = (
    <div className="bg-[#1e3a5f] text-white rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#f97316]" />
        Результат расчёта
      </h3>

      {result && result.withWaste > 0 ? (
        <>
          <motion.div
            key={`${result.withWaste}-${result.netArea.toFixed(1)}`}
            initial={{ opacity: 0.5, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 mb-6"
          >
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-0.5">Площадь кладки</p>
              <p className="text-xl font-bold">{result.netArea.toFixed(1)} м²</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-0.5">
                Количество {selectedBlock?.unit ?? 'шт'}
              </p>
              <p className="text-xl font-bold text-[#f97316]">
                {result.withWaste.toLocaleString('ru-RU')} шт
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Базово {result.baseCount} + запас {state.wastePct}%
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-0.5">Вес</p>
              <p className="text-lg font-semibold">
                {result.weightKg >= 1000
                  ? `${(result.weightKg / 1000).toFixed(2)} т`
                  : `${result.weightKg} кг`}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-2">Стоимость блоков</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Наличные:</span>
                <span className="font-bold text-[#f97316]">
                  {result.costCash.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/70">Безналичный:</span>
                <span className="font-medium">
                  {result.costCashless.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Pallets */}
            <div className="bg-white/10 rounded-xl p-3 border border-[#f97316]/30">
              <p className="text-xs text-white/60 mb-2">Поддоны и доставка</p>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Поддонов:</span>
                  <span className="font-semibold">
                    {result.pallets} шт
                    <span className="text-xs text-white/40 ml-1">
                      ({result.blocksPerPallet}/поддон)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Залог за поддоны:</span>
                  <span className="font-medium text-[#f97316]">
                    {result.palletDeposit.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="h-px bg-white/10 my-0.5" />
                <div className="flex justify-between">
                  <span className="text-white/70">КамАЗ (16 поддонов):</span>
                  <span className="font-medium">
                    {result.truckLoads === 1 ? '1 рейс' : `${result.truckLoads} рейса`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">С прицепом (30):</span>
                  <span className="font-medium text-white/60">
                    {result.truckLoadsWithTrailer === 1
                      ? '1 рейс'
                      : `${result.truckLoadsWithTrailer} рейса`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/30 mt-2">
                Залог возвращается при сдаче поддонов
              </p>
            </div>
          </motion.div>

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all cursor-pointer ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#f97316] hover:bg-[#ea6c04] text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" />
                Добавлено в корзину!
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                Добавить в корзину
              </>
            )}
          </button>
          <p className="text-center text-xs text-white/40 mt-2">
            Цены уточняются у менеджера
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-white/40">
          <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Введите размеры дома</p>
          <p className="text-xs mt-1">Результат появится автоматически</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <Calculator className="h-7 w-7 text-[#f97316]" />
          Калькулятор материалов
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Расчёт количества блоков для стен дома</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Live Result — first on mobile, right on desktop ── */}
        <div className="lg:col-span-2 order-first lg:order-last">
          <div className="sticky top-24">
            {resultPanel}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="lg:col-span-3 flex flex-col gap-5 order-last lg:order-first">
          {/* Step 1: Dimensions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              Размеры дома
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(['length', 'width', 'height'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs text-gray-500 mb-1 block">
                    {key === 'length' ? 'Длина (м)' : key === 'width' ? 'Ширина (м)' : 'Высота (м)'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={state[key] || ''}
                    onChange={e => update({ [key]: parseFloat(e.target.value) || 0 })}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Толщина стены</Label>
              <div className="flex gap-3">
                {([40, 20] as const).map(t => (
                  <label
                    key={t}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      state.thickness === t
                        ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={state.thickness === t}
                      onChange={() => update({ thickness: t })}
                    />
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      state.thickness === t ? 'border-[#1e3a5f]' : 'border-gray-300'
                    }`}>
                      {state.thickness === t && (
                        <span className="w-2 h-2 rounded-full bg-[#1e3a5f]" />
                      )}
                    </span>
                    {t} см
                  </label>
                ))}
              </div>
              {state.thickness === 40 && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Для жилого дома рекомендуем 40 см
                </p>
              )}
            </div>
          </div>

          {/* Step 2: Openings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Проёмы
            </h2>

            {/* Doors */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Двери</p>
                <button
                  onClick={() => update({ doors: [...state.doors, newOpening()] })}
                  className="flex items-center gap-1 text-xs text-[#f97316] hover:text-[#ea6c04] font-medium cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {state.doors.map((door, i) => (
                  <div key={door.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14">Дверь {i + 1}</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={door.width || ''}
                      onChange={e =>
                        update({
                          doors: state.doors.map(d =>
                            d.id === door.id ? { ...d, width: parseFloat(e.target.value) || 0 } : d
                          ),
                        })
                      }
                      className="text-center h-9 text-sm"
                    />
                    <span className="text-gray-400 text-sm">×</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={door.height || ''}
                      onChange={e =>
                        update({
                          doors: state.doors.map(d =>
                            d.id === door.id ? { ...d, height: parseFloat(e.target.value) || 0 } : d
                          ),
                        })
                      }
                      className="text-center h-9 text-sm"
                    />
                    <span className="text-xs text-gray-400">м</span>
                    <button
                      onClick={() =>
                        update({ doors: state.doors.filter(d => d.id !== door.id) })
                      }
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Windows */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Окна</p>
                <button
                  onClick={() => update({ windows: [...state.windows, newWindow()] })}
                  className="flex items-center gap-1 text-xs text-[#f97316] hover:text-[#ea6c04] font-medium cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {state.windows.map((win, i) => (
                  <div key={win.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14">Окно {i + 1}</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={win.width || ''}
                      onChange={e =>
                        update({
                          windows: state.windows.map(w =>
                            w.id === win.id ? { ...w, width: parseFloat(e.target.value) || 0 } : w
                          ),
                        })
                      }
                      className="text-center h-9 text-sm"
                    />
                    <span className="text-gray-400 text-sm">×</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={win.height || ''}
                      onChange={e =>
                        update({
                          windows: state.windows.map(w =>
                            w.id === win.id ? { ...w, height: parseFloat(e.target.value) || 0 } : w
                          ),
                        })
                      }
                      className="text-center h-9 text-sm"
                    />
                    <span className="text-xs text-gray-400">м</span>
                    <button
                      onClick={() =>
                        update({ windows: state.windows.filter(w => w.id !== win.id) })
                      }
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Masonry */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              Параметры кладки
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Размер блока</Label>
                <select
                  value={state.blockId}
                  onChange={e => update({ blockId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
                >
                  {BLOCK_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.dimensions}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Толщина шва (мм)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={state.jointMm || ''}
                  onChange={e => update({ jointMm: parseFloat(e.target.value) || 0 })}
                  className="text-center"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Запас на бой (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={state.wastePct || ''}
                  onChange={e => update({ wastePct: parseFloat(e.target.value) || 0 })}
                  className="text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
