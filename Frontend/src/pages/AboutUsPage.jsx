import { Code, Bug, GraduationCap, Map, Target, Zap } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-indigo-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
            Історія Tsundere
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-indigo-200">
            Від легенди в темному лісі до сучасного маркетплейсу, що об'єднує тисячі користувачів.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100 relative overflow-hidden">
            {/* Decorative background logo/icon */}
            <Map className="absolute -right-16 -top-16 w-64 h-64 text-gray-50 opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                  <Map className="w-6 h-6" />
                </span>
                Як все починалося
              </h2>
              
              <div className="prose prose-lg prose-indigo text-gray-600">
                <p>
                  Існує корпоративна легенда про те, як народилася ідея платформи <strong>Tsundere</strong>. Кажуть, що все почалося під час одного тімбілдингу.
                </p>
                <p>
                  Троє відважних програмістів та один невтомний бета-тестер заблукали в густому, незвіданому лісі дедлайнів. Серед дерев із синтаксичними помилками та кущів невідловлених багів, коли надія вже майже згасла, перед ними з'явилася загадкова постать.
                </p>
                <p>
                  Це був <em>Викладач Практики</em> — мудрий і суворий ментор. Він зупинив їх і сказав лише одну фразу: <strong>«Ви маєте створити маркетплейс. І щоб там усе працювало ідеально!»</strong>. 
                </p>
                <p>
                  Слова ментора стали для команди провідною зіркою. Вони вийшли з лісу з чіткою візією та непереборним бажанням створити щось грандіозне. Так з'явився проект, який поєднав у собі сучасний код, безкомпромісне тестування та зручний дизайн.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Команда творців</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Люди, які перетворили лісову легенду на професійний продукт.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Programmer 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Програміст 1</h3>
              <p className="text-sm text-blue-600 font-medium mb-3">Backend Architect</p>
              <p className="text-gray-500 text-sm">
                Той, хто прокладав шляхи через серверні хащі та приборкував бази даних.
              </p>
            </div>

            {/* Programmer 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Програміст 2</h3>
              <p className="text-sm text-purple-600 font-medium mb-3">Frontend Wizard</p>
              <p className="text-gray-500 text-sm">
                Оживив інтерфейс та зробив його таким же приємним, як галявина після дощу.
              </p>
            </div>

            {/* Programmer 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Програміст 3</h3>
              <p className="text-sm text-emerald-600 font-medium mb-3">DevOps & Security</p>
              <p className="text-gray-500 text-sm">
                Створив захисний бар'єр, крізь який не пройде жоден шахрай.
              </p>
            </div>

            {/* Beta Tester */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                <Bug className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Бета-тестер</h3>
              <p className="text-sm text-red-600 font-medium mb-3">Quality Assurance</p>
              <p className="text-gray-500 text-sm">
                Той, хто сміливо йшов у невідомість, натискав усі кнопки і ловив найхитріші баги.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Наша мета</h3>
              <p className="text-indigo-200">
                Зробити купівлю та продаж речей максимально швидкою та безпечною для кожного.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Швидкість</h3>
              <p className="text-indigo-200">
                Оптимізовані процеси дозволяють вам публікувати оголошення за лічені секунди.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Спадок Викладача</h3>
              <p className="text-indigo-200">
                Ми продовжуємо підтримувати високі стандарти коду та зручності, які були закладені на самому початку.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
