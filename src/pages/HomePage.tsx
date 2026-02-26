import { Link } from 'react-router-dom'
import { Calculator, User, CheckCircle, Truck, FileText, Phone, Mail, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/common/ProductCard'

const HERO_BG =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function HomePage() {
  const popularProducts = PRODUCTS.filter(p => p.is_popular).slice(0, 4)

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#1e3a5f]/80" />

        <motion.div
          className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Работаем · Стерлитамак и Юг Башкирии
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
            Комплектация <br className="hidden sm:block" />
            стройплощадок <span className="text-[#f97316]">за 1 день</span>
          </h1>

          <p className="text-white/80 text-lg sm:text-xl mb-3">
            Рассчитаем, соберём и привезём стройматериалы под ваш объект
          </p>

          <p className="text-white/60 text-sm mb-3">
            Бесплатный расчёт · Один поставщик · Доставка до объекта
          </p>

          {/* Trust signal */}
          <p className="text-white/50 text-xs mb-8">
            ✓ 120+ объектов сдано · ✓ ИП с документами
          </p>

          {/* CTA buttons — hierarchy: primary orange, secondary ghost */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link
              to="/calculator"
              className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base w-full sm:w-auto"
            >
              <Calculator className="h-5 w-5" />
              Рассчитать материалы
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 border border-white/40 hover:border-white/70 hover:bg-white/10 text-white font-medium px-6 py-4 rounded-xl transition-all text-base w-full sm:w-auto"
            >
              <User className="h-5 w-5" />
              Войти в кабинет
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Advantages ── */}
      <motion.section
        className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] text-center mb-10"
        >
          Почему выбирают нас
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: 'Официальные документы',
              desc: 'УПД, договоры, гарантии — всё по закону',
            },
            {
              icon: Truck,
              title: 'Доставка за 1 день',
              desc: 'Манипулятор по Стерлитамаку и Юг Башкирии',
            },
            {
              icon: CheckCircle,
              title: 'Гарантия качества',
              desc: 'Материалы от проверенных производителей',
            },
          ].map(item => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-[#f97316]/30 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-[#f97316]" />
              </div>
              <h3 className="font-semibold text-[#1e3a5f] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Popular products ── */}
      <motion.section
        className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-3xl mb-8"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">Популярные товары</h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-medium text-[#f97316] hover:text-[#ea6c04] transition-colors"
          >
            Весь каталог <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularProducts.map((product, i) => (
            <motion.div
              key={product.id}
              variants={fadeUp}
              custom={i}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Manager contact ── */}
      <motion.section
        className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="bg-[#1e3a5f] text-white rounded-2xl p-8">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-[#f97316]/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#f97316] select-none">РЗ</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Ришат Зиннуров</h3>
          <p className="text-white/60 text-sm mb-5">Менеджер по снабжению · Ответим в течение 15 минут</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:89177969222"
              className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="h-4 w-4" />
              8-917-796-92-22
            </a>
            <a
              href="mailto:info@sck-stroi.ru"
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              <Mail className="h-4 w-4" />
              info@sck-stroi.ru
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
