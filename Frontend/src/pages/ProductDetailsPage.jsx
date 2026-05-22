import { useParams } from 'react-router-dom';
import ProductTabs from '../components/ProductTabs';

// Mock product
const PRODUCT = {
  id: 1,
  title: 'Apple MacBook Pro M2 2023 16GB/512GB Space Gray',
  price: '45000',
  location: 'Київ, Печерський район',
  date: 'Опубліковано сьогодні о 14:30',
  condition: 'Нове',
  seller: {
    name: 'Олександр',
    rating: 4.8,
    joined: 'на Tsundere з 2022'
  },
  images: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=1200'
  ]
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        Головна &raquo; Ноутбуки &raquo; Apple &raquo; {PRODUCT.title}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-video">
            <img src={PRODUCT.images[0]} alt={PRODUCT.title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {PRODUCT.images.map((img, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square cursor-pointer hover:border-indigo-500 transition-colors">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-4">
              {PRODUCT.condition}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{PRODUCT.title}</h1>
            <div className="text-4xl font-extrabold text-indigo-600 mb-6">
              {PRODUCT.price} ₴
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors mb-3 text-lg">
              Купити
            </button>
            <button className="w-full bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Написати продавцю
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Продавець</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                {PRODUCT.seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{PRODUCT.seller.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-medium mr-2">{PRODUCT.seller.rating}</span>
                  <span>{PRODUCT.seller.joined}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Місцезнаходження</h3>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {PRODUCT.location}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {PRODUCT.date}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed specs */}
      <ProductTabs />
    </div>
  );
}
