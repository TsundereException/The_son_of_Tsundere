import { useState } from 'react';

const TABS = [
  { id: 'description', label: 'Опис товару' },
  { id: 'characteristics', label: 'Характеристики' },
];

export default function ProductTabs({ description, attributes = {} }) {
  const [activeTab, setActiveTab] = useState('description');

  // Treat the entire attributes object as characteristics
  const chars = attributes || {};
  const hasChars = Object.keys(chars).length > 0;

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
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Детальний опис
            </h3>
            {description ? (
              <p className="whitespace-pre-wrap leading-relaxed">{description}</p>
            ) : (
              <p className="italic text-gray-400">Продавець не додав опис до цього товару.</p>
            )}
          </div>
        )}

        {activeTab === 'characteristics' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Характеристики
            </h3>
            {hasChars ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(chars).map(([key, val], idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-500 text-sm font-medium">{key}</span>
                    <span className="font-semibold text-gray-900 text-right">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500">Характеристики не вказані.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
