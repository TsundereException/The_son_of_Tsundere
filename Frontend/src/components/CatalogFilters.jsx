import { useState } from 'react';

const CATEGORIES = [
  { id: 'smartphones', label: 'Смартфони' },
  { id: 'laptops', label: 'Ноутбуки' },
  { id: 'cameras', label: 'Камери' },
  { id: 'watches', label: 'Годинники' },
  { id: 'tvs', label: 'Телевізори' },
  { id: 'accessories', label: 'Аксесуари' },
];

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Asus', 'Lenovo', 'Sony', 'LG'];
const MEMORY_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const COLORS = [
  { id: 'black', hex: '#000000' },
  { id: 'white', hex: '#ffffff' },
  { id: 'silver', hex: '#c0c0c0' },
  { id: 'blue', hex: '#0000ff' },
  { id: 'red', hex: '#ff0000' },
];

/**
 * Компонент бокової панелі фільтрів для каталогу товарів.
 * Дозволяє фільтрувати за категорією, ціною, брендом, кольором, пам'яттю та станом.
 * Наразі використовує локальний стан для демонстрації роботи UI.
 *
 * @returns {JSX.Element} React компонент фільтрів.
 */
export default function CatalogFilters() {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Фільтри</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Категорія</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="category" value={cat.id} className="text-indigo-600 focus:ring-indigo-500 rounded-full" />
              <span className="text-gray-700 text-sm hover:text-indigo-600 transition-colors">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Ціна, ₴</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Від" 
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="До" 
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Бренд</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          {BRANDS.map(brand => (
            <label key={brand} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-gray-700 text-sm hover:text-indigo-600">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Колір</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button 
              key={color.id} 
              className={`w-8 h-8 rounded-full border-2 border-transparent hover:border-indigo-400 focus:outline-none focus:border-indigo-600 ${color.id === 'white' ? 'border-gray-200' : ''}`}
              style={{ backgroundColor: color.hex }}
              title={color.id}
            />
          ))}
        </div>
      </div>

      {/* Storage */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Обсяг пам'яті</h3>
        <div className="flex flex-wrap gap-2">
          {MEMORY_OPTIONS.map(opt => (
            <button key={opt} className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:border-indigo-500 hover:text-indigo-600 transition-colors">
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Стан</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-gray-700 text-sm hover:text-indigo-600">Новий</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-gray-700 text-sm hover:text-indigo-600">Б/У</span>
          </label>
        </div>
      </div>
      
      <button className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors">
        Застосувати
      </button>
    </div>
  );
}
