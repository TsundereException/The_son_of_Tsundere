import { useState } from 'react';

const TABS = [
  { id: 'description', label: 'Опис товару' },
  { id: 'characteristics', label: 'Характеристики' },
  { id: 'package', label: 'Комплектація' },
  { id: 'warranty', label: 'Гарантія' },
  { id: 'condition', label: 'Стан товару' },
  { id: 'benefits', label: 'Додаткові переваги' },
];

/**
 * Компонент вкладок (табів) для сторінки деталей товару.
 * Відображає різні секції інформації про товар (Опис, Характеристики, Комплектація тощо).
 *
 * @returns {JSX.Element} React компонент вкладок товару.
 */
export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-gray-200 custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="p-6 md:p-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-600">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Детальний опис товару</h3>
            <p className="mb-4">
              Це ідеальний пристрій для тих, хто цінує надійність, швидкість та стильний дизайн. 
              Завдяки новітньому процесору ви зможете виконувати найскладніші завдання без затримок.
            </p>
            <p>
              Пристрій оснащений чудовим екраном з високою роздільною здатністю, що робить перегляд фільмів та роботу з графікою справжнім задоволенням.
            </p>
          </div>
        )}

        {activeTab === 'characteristics' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Характеристики</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Бренд:</span>
                <span className="font-medium text-gray-900">Apple</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Модель:</span>
                <span className="font-medium text-gray-900">MacBook Pro M2</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Пам'ять:</span>
                <span className="font-medium text-gray-900">512 GB SSD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">ОЗП:</span>
                <span className="font-medium text-gray-900">16 GB</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'package' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Комплектація</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Оригінальна коробка</li>
              <li>Пристрій</li>
              <li>Зарядний кабель (Type-C)</li>
              <li>Блок живлення 67W</li>
              <li>Документація та наклейки</li>
            </ul>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Гарантія</h3>
            <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start">
              <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <p className="font-semibold">Офіційна гарантія від виробника: 12 місяців</p>
                <p className="text-sm mt-1 text-green-700">Можливе повернення товару протягом 14 днів з моменту покупки згідно із законодавством України.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'condition' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Стан товару</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Ідеальний (Як новий)</p>
              <p className="text-gray-600 text-sm">
                Пристрій був у користуванні менше тижня. Жодних подряпин на екрані або корпусі. 
                Батарея має 100% ємності (всього 4 цикли перезарядки). Всі функції працюють бездоганно.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Додаткові переваги</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-semibold text-indigo-900 text-sm mb-1">Безкоштовна доставка</h4>
                <p className="text-xs text-indigo-700">Відправляємо Новою Поштою в день замовлення без передоплати.</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <h4 className="font-semibold text-amber-900 text-sm mb-1">Безпечна угода</h4>
                <p className="text-xs text-amber-700">Гроші резервуються на платформі доки ви не оглянете товар.</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🎁</div>
                <h4 className="font-semibold text-rose-900 text-sm mb-1">Подарунок</h4>
                <p className="text-xs text-rose-700">У комплекті йде якісний чохол та захисне скло на екран.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
