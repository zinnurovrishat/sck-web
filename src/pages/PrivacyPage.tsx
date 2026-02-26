import { motion } from 'framer-motion'

const EFFECTIVE_DATE = '1 января 2025 г.'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-[#1e3a5f] mb-3">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <p className="text-[#f97316] font-medium text-sm mb-2 uppercase tracking-wide">Документ</p>
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Политика конфиденциальности</h1>
        <p className="text-gray-400 text-sm">Дата вступления в силу: {EFFECTIVE_DATE}</p>
      </div>

      <div className="prose-custom">

        <Section title="1. Общие положения">
          <p>
            Настоящая Политика конфиденциальности (далее — «Политика») описывает, какие персональные данные
            собирает ИП Зиннуров Ришат Мидхатович (далее — «Оператор», «мы»), как они используются и защищаются
            при использовании сайта sck-stroi.ru (далее — «Сайт»).
          </p>
          <p>
            Используя Сайт и отправляя заявку, вы соглашаетесь с условиями настоящей Политики.
          </p>
        </Section>

        <Section title="2. Какие данные мы собираем">
          <p>При оформлении заявки мы просим указать:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Имя (необязательно)</li>
            <li>Номер телефона (обязательно)</li>
          </ul>
          <p className="mt-2">
            Также мы можем автоматически фиксировать технические данные: тип браузера, IP-адрес,
            страницы Сайта, которые вы посещали — исключительно в целях улучшения работы Сайта.
          </p>
        </Section>

        <Section title="3. Цели обработки данных">
          <p>Ваши данные используются исключительно для:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Обратной связи по оставленной заявке</li>
            <li>Уточнения деталей заказа</li>
            <li>Направления коммерческого предложения (только если вы об этом просили)</li>
          </ul>
          <p className="mt-2">
            Мы не продаём, не передаём и не раскрываем ваши персональные данные третьим лицам
            без вашего явного согласия, за исключением случаев, предусмотренных законодательством РФ.
          </p>
        </Section>

        <Section title="4. Хранение и защита данных">
          <p>
            Заявки поступают в защищённый мессенджер (Telegram) и хранятся только на устройствах
            уполномоченных сотрудников. Мы принимаем разумные технические меры для защиты данных
            от несанкционированного доступа.
          </p>
          <p>
            Срок хранения персональных данных — не более 3 лет с момента получения заявки,
            если иное не требуется законодательством.
          </p>
        </Section>

        <Section title="5. Права субъекта данных">
          <p>Вы вправе в любое время:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Запросить информацию о том, какие ваши данные мы храним</li>
            <li>Потребовать исправления или удаления ваших данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
          </ul>
          <p className="mt-2">
            Для реализации прав обратитесь по email:{' '}
            <a href="mailto:info@sck-stroi.ru" className="text-[#f97316] hover:underline">
              info@sck-stroi.ru
            </a>
          </p>
        </Section>

        <Section title="6. Cookie и аналитика">
          <p>
            Сайт может использовать cookies — небольшие текстовые файлы, сохраняемые в браузере —
            для корректной работы интерфейса. Cookies не содержат персональных данных.
            Вы можете отключить cookies в настройках браузера, однако некоторые функции Сайта
            могут работать некорректно.
          </p>
        </Section>

        <Section title="7. Изменения Политики">
          <p>
            Мы оставляем за собой право вносить изменения в настоящую Политику. Актуальная версия
            всегда доступна на этой странице. Продолжение использования Сайта после публикации
            изменений означает ваше согласие с ними.
          </p>
        </Section>

        <Section title="8. Контакты оператора">
          <p>ИП Зиннуров Ришат Мидхатович</p>
          <p>ИНН: 026800071886 · ОГРНИП: 325028000146701</p>
          <p>
            Телефон:{' '}
            <a href="tel:89177969222" className="text-[#f97316] hover:underline">
              8-917-796-92-22
            </a>
          </p>
          <p>
            Email:{' '}
            <a href="mailto:info@sck-stroi.ru" className="text-[#f97316] hover:underline">
              info@sck-stroi.ru
            </a>
          </p>
        </Section>

      </div>
    </motion.div>
  )
}
