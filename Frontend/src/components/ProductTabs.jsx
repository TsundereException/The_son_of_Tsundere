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
 * @param {Object} props
 * @param {string} props.description - Опис товару з бекенду
 * @param {Object} props.attributes - Додаткові атрибути з бекенду (JSON)
 * @returns {JSX.Element} React компонент вкладок товару.
 */
export default function ProductTabs({ description, attributes = {} }) {
  const [activeTab, setActiveTab] = useState('description');

  const chars = attributes.characteristics || {};
  const packageItems = attributes.package || [];
  const warranty = attributes.warranty || '';
  const condition = attributes.condition || '';
  const benefits = attributes.benefits || [];

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
            {description ? (
              <p className="whitespace-pre-wrap">{description}</p>
            ) : (
              <p>Опис відсутній.</p>
            )}
          </div>
        )}

        {activeTab === 'characteristics' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Характеристики</h3>
            {Object.keys(chars).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(chars).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Характеристики не вказані.</p>
            )}
          </div>
        )}

        {activeTab === 'package' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Комплектація</h3>
            {packageItems.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {packageItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Інформація про комплектацію відсутня.</p>
            )}
          </div>
        )}

        {activeTab === 'warranty' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Гарантія</h3>
            {warranty ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start">
                <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <p className="font-semibold">{warranty}</p>
                  <p className="text-sm mt-1 text-green-700">Можливе повернення товару протягом 14 днів з моменту покупки згідно із законодавством України.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Гарантія не вказана.</p>
            )}
          </div>
        )}

        {activeTab === 'condition' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Стан товару</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">{condition || 'Не вказано'}</p>
              <p className="text-gray-600 text-sm">
                Деталі про стан товару можна дізнатися у продавця.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Додаткові переваги</h3>
            {benefits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benefits.map((b, idx) => (
                  <div key={idx} className="bg-indigo-50 p-4 rounded-xl text-center">
                    <div className="text-2xl mb-2">{b.icon || '✨'}</div>
                    <h4 className="font-semibold text-indigo-900 text-sm mb-1">{b.title}</h4>
                    <p className="text-xs text-indigo-700">{b.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Додаткові переваги не вказані.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
