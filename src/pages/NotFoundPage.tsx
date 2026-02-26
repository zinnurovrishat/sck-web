import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calculator } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <motion.div
      className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-[120px] font-bold text-[#1e3a5f]/8 leading-none mb-4 select-none">
        404
      </p>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Страница не найдена</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        Такой страницы не существует. Возможно, ссылка устарела или содержит опечатку.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Home className="h-4 w-4" />
          На главную
        </Link>
        <Link
          to="/calculator"
          className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Calculator className="h-4 w-4" />
          Калькулятор
        </Link>
      </div>
    </motion.div>
  )
}
