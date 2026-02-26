import { motion } from 'framer-motion'
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.p variants={fadeUp} className="text-[#f97316] font-medium text-sm mb-2 uppercase tracking-wide">
          Контакты
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4">
          Свяжитесь с нами
        </motion.h1>
        <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto">
          Ришат ответит в течение 15 минут в рабочее время.
          Если не дозвонились — напишите на почту или позвоните повторно.
        </motion.p>
      </motion.div>

      {/* Contact cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Phone */}
        <motion.a
          variants={fadeUp}
          href="tel:89177969222"
          className="flex items-start gap-4 p-6 bg-[#1e3a5f] text-white rounded-2xl hover:bg-[#162d4a] transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#f97316] flex items-center justify-center shrink-0">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-white/60 mb-1">Телефон</p>
            <p className="text-xl font-bold group-hover:text-[#f97316] transition-colors">
              8-917-796-92-22
            </p>
            <p className="text-xs text-white/50 mt-1">Нажмите для звонка</p>
          </div>
        </motion.a>

        {/* Email */}
        <motion.a
          variants={fadeUp}
          href="mailto:info@sck-stroi.ru"
          className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:border-[#f97316]/40 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center shrink-0">
            <Mail className="h-6 w-6 text-[#f97316]" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Email</p>
            <p className="text-lg font-bold text-[#1e3a5f] group-hover:text-[#f97316] transition-colors">
              info@sck-stroi.ru
            </p>
            <p className="text-xs text-gray-400 mt-1">Ответим в течение 2 часов</p>
          </div>
        </motion.a>

        {/* WhatsApp */}
        <motion.a
          variants={fadeUp}
          href="https://wa.me/79177969222"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:border-green-400/40 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">WhatsApp</p>
            <p className="text-lg font-bold text-[#1e3a5f] group-hover:text-green-600 transition-colors">
              +7 917 796-92-22
            </p>
            <p className="text-xs text-gray-400 mt-1">Удобно для фото и документов</p>
          </div>
        </motion.a>

        {/* Working hours */}
        <motion.div
          variants={fadeUp}
          className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Режим работы</p>
            <p className="font-bold text-[#1e3a5f]">Пн–Пт: 8:00–18:00</p>
            <p className="font-medium text-gray-600 mt-0.5">Сб: 9:00–15:00</p>
            <p className="text-xs text-gray-400 mt-1">Вс — выходной</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Manager block */}
      <motion.div
        className="bg-[#1e3a5f] text-white rounded-2xl p-8 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-[#f97316]/50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-[#f97316] select-none">РЗ</span>
        </div>
        <h2 className="text-lg font-bold mb-1">Ришат Зиннуров</h2>
        <p className="text-white/60 text-sm mb-2">Менеджер по снабжению · Руководитель</p>
        <p className="text-white/50 text-xs mb-6 max-w-md mx-auto">
          Лично контролирует каждый заказ. Поможет подобрать материалы, рассчитает объём
          и организует доставку в удобное для вас время.
        </p>
        <a
          href="tel:89177969222"
          className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          <Phone className="h-4 w-4" />
          Позвонить Ришату
        </a>
      </motion.div>

      {/* Requisites */}
      <motion.div
        className="mt-8 p-6 bg-gray-50 rounded-2xl text-sm text-gray-500"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p className="font-medium text-gray-700 mb-2">Реквизиты для документов</p>
        <p>ИП Зиннуров Ришат Мидхатович</p>
        <p>ИНН: 026800071886 · ОГРНИП: 325028000146701</p>
      </motion.div>

    </div>
  )
}
