import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, ShieldAlert, Truck } from 'lucide-react';

const FAQ_DATA = [
  {
    id: 1,
    question: "Як працює безпечна угода (Доставка)?",
    answer: "Безпечна угода захищає і покупця, і продавця. Гроші покупця резервуються на платформі під час замовлення. Продавець відправляє товар, а після того, як покупець огляне і забере посилку на пошті, кошти автоматично зараховуються на картку продавця. Якщо товар не підійшов — гроші повертаються покупцю.",
    icon: Truck
  },
  {
    id: 2,
    question: "Що робити, якщо товар виявився з дефектом?",
    answer: "Завжди перевіряйте товар безпосередньо у відділенні пошти при отриманні. Якщо ви помітили дефект, просто відмовтеся від посилки. У такому випадку (якщо це була безпечна угода) гроші повернуться на вашу картку впродовж кількох робочих днів.",
    icon: ShieldAlert
  },
  {
    id: 3,
    question: "Як зв'язатися з продавцем?",
    answer: "На сторінці кожного оголошення є кнопка 'Написати'. Наш вбудований чат дозволяє безпечно спілкуватися, обмінюватися фотографіями та уточнювати деталі товару без необхідності переходити у сторонні месенджери.",
    icon: MessageCircle
  },
  {
    id: 4,
    question: "Як довго оголошення залишається активним?",
    answer: "Оголошення залишається активним протягом 30 днів з моменту публікації. Потім воно автоматично переноситься до архіву. Ви можете безкоштовно відновити його з архіву у своєму профілі.",
    icon: HelpCircle
  }
];

export default function FAQPage() {
  const [openId, setOpenId] = useState(1);

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Часті запитання (FAQ)
          </h1>
          <p className="text-lg text-gray-600">
            Знайдіть відповіді на найпопулярніші запитання про роботу нашої платформи.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item) => {
            const Icon = item.icon;
            const isOpen = openId === item.id;
            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${isOpen ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100 hover:border-indigo-100'}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pl-14 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Не знайшли відповіді?</h3>
          <p className="text-indigo-700 mb-6">Зв'яжіться з нашою службою підтримки. Ми працюємо 24/7 і завжди раді допомогти.</p>
          <a href="mailto:support@tsundere.com" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm hover:shadow">
            Написати в підтримку
          </a>
        </div>
      </div>
    </div>
  );
}
