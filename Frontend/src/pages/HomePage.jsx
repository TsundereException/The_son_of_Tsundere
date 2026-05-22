import { Smartphone, Laptop, Camera, Watch, Tv, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const MOCK_PRODUCTS = [
  { id: 1, title: 'MacBook Pro M2 2023', price: '45000', location: 'Київ', date: 'Сьогодні', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600' },
  { id: 2, title: 'PlayStation 5', price: '18500', location: 'Львів', date: 'Вчора', condition: 'Used', imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600' },
  { id: 3, title: 'Офісне крісло', price: '2500', location: 'Одеса', date: 'Сьогодні', condition: 'Used', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600' },
  { id: 4, title: 'iPhone 15 Pro Max', price: '52000', location: 'Дніпро', date: '2 дні тому', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600' },
];

const CATEGORIES = [
  { name: 'Смартфони', icon: Smartphone, color: 'bg-blue-100 text-blue-600', slug: 'smartphones' },
  { name: 'Ноутбуки', icon: Laptop, color: 'bg-purple-100 text-purple-600', slug: 'laptops' },
  { name: 'Камери', icon: Camera, color: 'bg-amber-100 text-amber-600', slug: 'cameras' },
  { name: 'Годинники', icon: Watch, color: 'bg-green-100 text-green-600', slug: 'watches' },
  { name: 'Телевізори', icon: Tv, color: 'bg-red-100 text-red-600', slug: 'tvs' },
  { name: 'Аксесуари', icon: Headphones, color: 'bg-gray-100 text-gray-600', slug: 'accessories' },
];


export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Шукай, купуй, продавай швидко!
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            The Son of Tsundere - найкраще місце для вигідних покупок та швидких продажів.
          </p>
          <button className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-gray-50 transition-colors">
            Розмістити оголошення
          </button>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Популярні категорії</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link 
                to={`/catalog?category=${category.slug}`} 
                key={category.name} 
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
              >
                <div className={`p-4 rounded-full ${category.color} group-hover:scale-110 transition-transform mb-3`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-medium text-gray-700">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Listings Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Нові оголошення</h2>
          <a href="/catalog" className="text-indigo-600 hover:text-indigo-700 font-medium hidden sm:block">
            Дивитись усі &rarr;
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <a href="/catalog" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Дивитись усі &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
