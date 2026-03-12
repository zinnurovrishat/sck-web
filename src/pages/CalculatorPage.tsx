import { useState, useMemo } from 'react'
import { useSEO } from '../hooks/useSEO'
import { Plus, X, ShoppingCart, Calculator, Info, Check, Home, Layers, Columns2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'
import { useProducts } from '../hooks/useProducts'

interface Opening {
  id: string
  width: number
  height: number
}

type WallThickness = 40 | 20
type TabType = 'walls' | 'foundation' | 'partition'

interface WallsState {
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

interface FoundationState {
  perimeter: number
  depth: number
  blockId: string
  jointMm: number
  wastePct: number
}

interface PartitionState {
  length: number
  height: number
  blockId: string
  jointMm: number
  wastePct: number
  openings: Opening[]
}

interface CalcResult {
  netArea: number
  baseCount: number
  withWaste: number
  weightKg: number
  costCash: number
  costCashless: number
  blocksPerPallet: number
  pallets: number
  palletDeposit: number
  truckLoads: number
  truckLoadsWithTrailer: number
}

function newOpening(w = 0.9, h = 2.1): Opening {
  return { id: Math.random().toString(36).slice(2), width: w, height: h }
}

function computeResult(
  netArea: number,
  block: typeof PRODUCTS[0],
  jointMm: number,
  wastePct: number,
): CalcResult | null {
  const dims = block.dimensions
    .split(/[×x×]/)
    .map(d => parseFloat(d.replace(/[^0-9.]/g, '')))
  if (dims.length < 3) return null

  const blockL = (dims[0] + jointMm) / 1000
  const blockH = (dims[1] + jointMm) / 1000
  const blocksPerSqm = 1 / (blockL * blockH)
  const baseCount = Math.ceil(netArea * blocksPerSqm)
  const withWaste = Math.ceil(baseCount * (1 + wastePct / 100))

  const weightKg = withWaste * block.weight_kg
  const costCash = withWaste * block.price_cash
  const costCashless = withWaste * block.price_cashless

  const blockThickness = dims[2] ?? 190
  const blocksPerPallet = blockThickness <= 100 ? 144 : 72
  const pallets = Math.ceil(withWaste / blocksPerPallet)
  const palletDeposit = pallets * 300
  const truckLoads = Math.ceil(pallets / 16)
  const truckLoadsWithTrailer = Math.ceil(pallets / 30)

  return {
    netArea, baseCount, withWaste, weightKg, costCash, costCashless,
    blocksPerPallet, pallets, palletDeposit, truckLoads, truckLoadsWithTrailer,
  }
}

export default function CalculatorPage() {
  useSEO('Калькулятор блоков', 'Рассчитайте количество блоков для стен, фундамента и перегородок онлайн.')
  const { addItem } = useCart()
  const { data: allProducts = PRODUCTS } = useProducts()
  const blockProducts = allProducts.filter(p => p.category === 'blocks')
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('walls')

  const [walls, setWalls] = useState<WallsState>({
    length: 10, width: 8, height: 3,
    thickness: 40,
    blockId: blockProducts[0]?.id ?? '',
    jointMm: 10, wastePct: 10,
    doors: [newOpening()],
    windows: [newOpening(1.2, 1.4)],
  })

  const [foundation, setFoundation] = useState<FoundationState>({
    perimeter: 36,
    depth: 1.5,
    blockId: blockProducts[0]?.id ?? '',
    jointMm: 10,
    wastePct: 5,
  })

  const [partition, setPartition] = useState<PartitionState>({
    length: 5, height: 2.7,
    blockId: blockProducts[0]?.id ?? '',
    jointMm: 10, wastePct: 5,
    openings: [],
  })

  const updateWalls = (patch: Partial<WallsState>) => setWalls(prev => ({ ...prev, ...patch }))
  const updateFoundation = (patch: Partial<FoundationState>) => setFoundation(prev => ({ ...prev, ...patch }))
  const updatePartition = (patch: Partial<PartitionState>) => setPartition(prev => ({ ...prev, ...patch }))

  const selectedBlock = useMemo(() => {
    const id = activeTab === 'walls' ? walls.blockId
      : activeTab === 'foundation' ? foundation.blockId
      : partition.blockId
    return allProducts.find(p => p.id === id) ?? blockProducts[0]
  }, [activeTab, walls.blockId, foundation.blockId, partition.blockId, allProducts, blockProducts])

  const result = useMemo((): CalcResult | null => {
    if (!selectedBlock) return null

    if (activeTab === 'walls') {
      const perimeter = 2 * (walls.length + walls.width)
      const wallArea = perimeter * walls.height
      const doorsArea = walls.doors.reduce((s, d) => s + d.width * d.height, 0)
      const windowsArea = walls.windows.reduce((s, w) => s + w.width * w.height, 0)
      const netArea = Math.max(0, wallArea - doorsArea - windowsArea)
      return computeResult(netArea, selectedBlock, walls.jointMm, walls.wastePct)
    }

    if (activeTab === 'foundation') {
      const netArea = foundation.perimeter * foundation.depth
      return computeResult(netArea, selectedBlock, foundation.jointMm, foundation.wastePct)
    }

    // partition
    const openingsArea = partition.openings.reduce((s, o) => s + o.width * o.height, 0)
    const netArea = Math.max(0, partition.length * partition.height - openingsArea)
    return computeResult(netArea, selectedBlock, partition.jointMm, partition.wastePct)
  }, [activeTab, walls, foundation, partition, selectedBlock])

  const handleAddToCart = () => {
    if (!result || !selectedBlock) return
    addItem(selectedBlock, result.withWaste)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'walls', label: 'Стены дома', icon: Home },
    { id: 'foundation', label: 'Фундамент', icon: Layers },
    { id: 'partition', label: 'Перегородки / Заборы', icon: Columns2 },
  ]

  const BlockSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
    >
      {blockProducts.map(p => (
        <option key={p.id} value={p.id}>
          {p.name}{p.dimensions ? ` (${p.dimensions})` : ''}
        </option>
      ))}
    </select>
  )

  const resultPanel = (
    <div className="bg-[#1e3a5f] text-white rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#f97316]" />
        Результат расчёта
      </h3>

      {result && result.withWaste > 0 ? (
        <>
          <motion.div
            key={`${activeTab}-${result.withWaste}-${result.netArea.toFixed(1)}`}
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
              <p className="text-xs text-white/60 mb-0.5">Количество, шт</p>
              <p className="text-xl font-bold text-[#f97316]">
                {result.withWaste.toLocaleString('ru-RU')} шт
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Базово {result.baseCount} + запас {activeTab === 'walls' ? walls.wastePct : activeTab === 'foundation' ? foundation.wastePct : partition.wastePct}%
              </p>
            </div>

            {selectedBlock && selectedBlock.weight_kg > 0 && (
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60 mb-0.5">Вес</p>
                <p className="text-lg font-semibold">
                  {result.weightKg >= 1000
                    ? `${(result.weightKg / 1000).toFixed(2)} т`
                    : `${result.weightKg} кг`}
                </p>
              </div>
            )}

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
              <><Check className="h-5 w-5" />Добавлено в корзину!</>
            ) : (
              <><ShoppingCart className="h-5 w-5" />Добавить в корзину</>
            )}
          </button>
          <p className="text-center text-xs text-white/40 mt-2">
            Цены уточняются у менеджера
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-white/40">
          <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Введите параметры</p>
          <p className="text-xs mt-1">Результат появится автоматически</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <Calculator className="h-7 w-7 text-[#f97316]" />
          Калькулятор материалов
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Онлайн-расчёт блоков с учётом проёмов и запаса</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setAdded(false) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1e3a5f]/30 hover:text-[#1e3a5f]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Result panel — first on mobile, right on desktop */}
        <div className="lg:col-span-2 order-first lg:order-last">
          <div className="sticky top-24">{resultPanel}</div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 flex flex-col gap-5 order-last lg:order-first">

          {/* ───── WALLS ───── */}
          {activeTab === 'walls' && (
            <>
              {/* Step 1: Dimensions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Размеры дома
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(['length', 'width', 'height'] as const).map(key => (
                    <div key={key}>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        {key === 'length' ? 'Длина (м)' : key === 'width' ? 'Ширина (м)' : 'Высота (м)'}
                      </Label>
                      <Input
                        type="number" min={0} step={0.1}
                        value={walls[key] || ''}
                        onChange={e => updateWalls({ [key]: parseFloat(e.target.value) || 0 })}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Толщина стены</Label>
                  <div className="flex gap-3">
                    {([40, 20] as const).map(t => (
                      <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        walls.thickness === t
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f] font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                        <input type="radio" className="sr-only" checked={walls.thickness === t} onChange={() => updateWalls({ thickness: t })} />
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${walls.thickness === t ? 'border-[#1e3a5f]' : 'border-gray-300'}`}>
                          {walls.thickness === t && <span className="w-2 h-2 rounded-full bg-[#1e3a5f]" />}
                        </span>
                        {t} см
                      </label>
                    ))}
                  </div>
                  {walls.thickness === 40 && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Info className="h-3 w-3" /> Для жилого дома рекомендуем 40 см
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Openings */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Проёмы
                </h2>
                {/* Doors */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Двери</p>
                    <button onClick={() => updateWalls({ doors: [...walls.doors, newOpening()] })}
                      className="flex items-center gap-1 text-xs text-[#f97316] hover:text-[#ea6c04] font-medium cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Добавить
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {walls.doors.map((door, i) => (
                      <div key={door.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-14">Дверь {i + 1}</span>
                        <Input type="number" min={0} step={0.1} value={door.width || ''} className="text-center h-9 text-sm"
                          onChange={e => updateWalls({ doors: walls.doors.map(d => d.id === door.id ? { ...d, width: parseFloat(e.target.value) || 0 } : d) })} />
                        <span className="text-gray-400 text-sm">×</span>
                        <Input type="number" min={0} step={0.1} value={door.height || ''} className="text-center h-9 text-sm"
                          onChange={e => updateWalls({ doors: walls.doors.map(d => d.id === door.id ? { ...d, height: parseFloat(e.target.value) || 0 } : d) })} />
                        <span className="text-xs text-gray-400">м</span>
                        <button onClick={() => updateWalls({ doors: walls.doors.filter(d => d.id !== door.id) })}
                          className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Windows */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Окна</p>
                    <button onClick={() => updateWalls({ windows: [...walls.windows, newOpening(1.2, 1.4)] })}
                      className="flex items-center gap-1 text-xs text-[#f97316] hover:text-[#ea6c04] font-medium cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Добавить
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {walls.windows.map((win, i) => (
                      <div key={win.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-14">Окно {i + 1}</span>
                        <Input type="number" min={0} step={0.1} value={win.width || ''} className="text-center h-9 text-sm"
                          onChange={e => updateWalls({ windows: walls.windows.map(w => w.id === win.id ? { ...w, width: parseFloat(e.target.value) || 0 } : w) })} />
                        <span className="text-gray-400 text-sm">×</span>
                        <Input type="number" min={0} step={0.1} value={win.height || ''} className="text-center h-9 text-sm"
                          onChange={e => updateWalls({ windows: walls.windows.map(w => w.id === win.id ? { ...w, height: parseFloat(e.target.value) || 0 } : w) })} />
                        <span className="text-xs text-gray-400">м</span>
                        <button onClick={() => updateWalls({ windows: walls.windows.filter(w => w.id !== win.id) })}
                          className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Masonry params */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Параметры кладки
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Размер блока</Label>
                    <BlockSelect value={walls.blockId} onChange={v => updateWalls({ blockId: v })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Толщина шва (мм)</Label>
                    <Input type="number" min={0} max={30} value={walls.jointMm || ''} className="text-center"
                      onChange={e => updateWalls({ jointMm: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Запас на бой (%)</Label>
                    <Input type="number" min={0} max={30} value={walls.wastePct || ''} className="text-center"
                      onChange={e => updateWalls({ wastePct: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ───── FOUNDATION ───── */}
          {activeTab === 'foundation' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Размеры фундамента
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Периметр ленты (м)</Label>
                    <Input type="number" min={0} step={0.5} value={foundation.perimeter || ''}
                      onChange={e => updateFoundation({ perimeter: parseFloat(e.target.value) || 0 })}
                      className="text-center" />
                    <p className="text-xs text-gray-400 mt-1">Сумма длин всех стен снаружи + внутри</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Высота фундамента (м)</Label>
                    <Input type="number" min={0} step={0.1} value={foundation.depth || ''}
                      onChange={e => updateFoundation({ depth: parseFloat(e.target.value) || 0 })}
                      className="text-center" />
                    <p className="text-xs text-gray-400 mt-1">Глубина залегания + надземная часть</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Для дома 10×8 м периметр внешних стен = 36 м. Если есть внутренние несущие — добавьте их длину.</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Параметры кладки
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Размер блока</Label>
                    <BlockSelect value={foundation.blockId} onChange={v => updateFoundation({ blockId: v })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Толщина шва (мм)</Label>
                    <Input type="number" min={0} max={30} value={foundation.jointMm || ''} className="text-center"
                      onChange={e => updateFoundation({ jointMm: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Запас (%)</Label>
                    <Input type="number" min={0} max={30} value={foundation.wastePct || ''} className="text-center"
                      onChange={e => updateFoundation({ wastePct: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ───── PARTITION / FENCE ───── */}
          {activeTab === 'partition' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Размеры
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Длина (м)</Label>
                    <Input type="number" min={0} step={0.5} value={partition.length || ''}
                      onChange={e => updatePartition({ length: parseFloat(e.target.value) || 0 })}
                      className="text-center" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Высота (м)</Label>
                    <Input type="number" min={0} step={0.1} value={partition.height || ''}
                      onChange={e => updatePartition({ height: parseFloat(e.target.value) || 0 })}
                      className="text-center" />
                  </div>
                </div>

                {/* Openings */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Проёмы (двери, ворота)</p>
                  <button onClick={() => updatePartition({ openings: [...partition.openings, newOpening()] })}
                    className="flex items-center gap-1 text-xs text-[#f97316] hover:text-[#ea6c04] font-medium cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Добавить
                  </button>
                </div>
                {partition.openings.length === 0 && (
                  <p className="text-xs text-gray-400 mb-1">Без проёмов — не добавляйте</p>
                )}
                <div className="flex flex-col gap-2">
                  {partition.openings.map((op, i) => (
                    <div key={op.id} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Проём {i + 1}</span>
                      <Input type="number" min={0} step={0.1} value={op.width || ''} className="text-center h-9 text-sm"
                        onChange={e => updatePartition({ openings: partition.openings.map(o => o.id === op.id ? { ...o, width: parseFloat(e.target.value) || 0 } : o) })} />
                      <span className="text-gray-400 text-sm">×</span>
                      <Input type="number" min={0} step={0.1} value={op.height || ''} className="text-center h-9 text-sm"
                        onChange={e => updatePartition({ openings: partition.openings.map(o => o.id === op.id ? { ...o, height: parseFloat(e.target.value) || 0 } : o) })} />
                      <span className="text-xs text-gray-400">м</span>
                      <button onClick={() => updatePartition({ openings: partition.openings.filter(o => o.id !== op.id) })}
                        className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Параметры кладки
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Размер блока</Label>
                    <BlockSelect value={partition.blockId} onChange={v => updatePartition({ blockId: v })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Толщина шва (мм)</Label>
                    <Input type="number" min={0} max={30} value={partition.jointMm || ''} className="text-center"
                      onChange={e => updatePartition({ jointMm: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Запас (%)</Label>
                    <Input type="number" min={0} max={30} value={partition.wastePct || ''} className="text-center"
                      onChange={e => updatePartition({ wastePct: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
