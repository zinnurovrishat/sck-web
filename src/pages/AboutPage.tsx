import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Truck, FileText, Calculator, Phone } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <motion.div
        className="text-center mb-14"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.p variants={fadeUp} className="text-[#f97316] font-medium text-sm mb-2 uppercase tracking-wide">
          О компании
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4">
          СЦК — Стерлитамакский центр комплектации
        </motion.h1>
        <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
          Помогаем строить быстрее. Берём на себя подбор, закупку и доставку строительных материалов,
          чтобы вы сосредоточились на самом строительстве.
        </motion.p>
      </motion.div>

      {/* Story */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-center"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">Как мы работаем</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Мы — небольшая, но очень оперативная команда. Работаем как агрегатор строительных материалов:
            находим лучшее предложение у поставщиков Стерлитамака и Башкирии, комплектуем заказ и
            организуем доставку на объект манипулятором.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Наш якорный продукт — шлакоблоки собственного производства партнёров. Но мы не ограничиваемся
            только блоками: под ваш объект подберём кирпич, цемент, кладочную сетку и другие позиции —
            всё в одной поставке, с одним документом.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Работаем официально: ИП Зиннуров Р.М., выдаём УПД и договоры. Удобно для юрлиц и ИП,
            которым нужна отчётность.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="bg-[#1e3a5f]/5 rounded-2xl p-8">
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '120+', label: 'объектов сдано' },
              { value: '1 день', label: 'срок доставки' },
              { value: '8+', label: 'лет опыта' },
              { value: '100%', label: 'с документами' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-[#f97316] mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Advantages */}
      <motion.section
        className="mb-14"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.h2 variants={fadeUp} className="text-2xl font-bold text-[#1e3a5f] mb-8 text-center">
          Почему выбирают нас
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: Truck,
              title: 'Доставка манипулятором',
              desc: 'Свой КамАЗ-манипулятор. Разгрузим точно на место без ручного труда. Стандарт — 16 поддонов, с прицепом — 30.',
            },
            {
              icon: FileText,
              title: 'Официальные документы',
              desc: 'УПД, договор поставки, гарантийные письма. Без серых схем — всё в соответствии с законодательством.',
            },
            {
              icon: CheckCircle,
              title: 'Проверенные материалы',
              desc: 'Работаем только с производителями, у которых есть сертификаты. Лично контролируем качество каждой партии.',
            },
            {
              icon: Calculator,
              title: 'Бесплатный расчёт',
              desc: 'Онлайн-калькулятор сразу считает количество блоков, вес и стоимость. Менеджер перезвонит и уточнит детали.',
            },
          ].map(item => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#f97316]/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="h-5 w-5 text-[#f97316]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1e3a5f] mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Requisites */}
      <motion.section
        className="mb-14 bg-gray-50 rounded-2xl p-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">Реквизиты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Полное наименование', value: 'ИП Зиннуров Ришат Мидхатович' },
            { label: 'ИНН', value: '026800071886' },
            { label: 'ОГРНИП', value: '325028000146701' },
            { label: 'Регион деятельности', value: 'Стерлитамак и Юг Башкирии' },
            { label: 'Телефон', value: '8-917-796-92-22' },
            { label: 'Email', value: 'info@sck-stroi.ru' },
          ].map(r => (
            <div key={r.label} className="flex flex-col gap-0.5">
              <span className="text-gray-400 text-xs">{r.label}</span>
              <span className="font-medium text-[#1e3a5f]">{r.value}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        className="text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3">Готовы к сотрудничеству?</h2>
        <p className="text-gray-500 mb-6">Свяжитесь с нами или рассчитайте материалы онлайн</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/calculator"
            className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            <Calculator className="h-4 w-4" />
            Рассчитать материалы
          </Link>
          <a
            href="tel:89177969222"
            className="flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            <Phone className="h-4 w-4" />
            Позвонить
          </a>
        </div>
      </motion.div>

    </div>
  )
}
