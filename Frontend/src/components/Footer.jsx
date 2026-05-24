import { Link } from 'react-router-dom';
import { Mail, Phone, Globe } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function Footer() {
  const { showAlert } = useModal();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Tsundere</span>
            </Link>
            <p className="mt-4 text-gray-500 text-sm">
              Знайди те, що шукаєш, або продай непотрібне швидко та безпечно.
            </p>
            <div className="flex space-x-6 mt-6">
              <a href="#" onClick={async (e) => { e.preventDefault(); await showAlert('Функція в розробці'); }} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Email</span>
                <Mail className="h-6 w-6" />
              </a>
              <a href="#" onClick={async (e) => { e.preventDefault(); await showAlert('Функція в розробці'); }} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Phone</span>
                <Phone className="h-6 w-6" />
              </a>
              <a href="#" onClick={async (e) => { e.preventDefault(); await showAlert('Функція в розробці'); }} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Website</span>
                <Globe className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Навігація</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/catalog" className="text-base text-gray-500 hover:text-gray-900">Оголошення</Link></li>
              <li><Link to="/profile" className="text-base text-gray-500 hover:text-gray-900">Мій профіль</Link></li>
              <li><Link to="/about" className="text-base text-gray-500 hover:text-gray-900">Про нас</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Підтримка</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" onClick={async (e) => { e.preventDefault(); await showAlert('Сторінка в розробці'); }} className="text-base text-gray-500 hover:text-gray-900">Контакти</a></li>
              <li><Link to="/faq" className="text-base text-gray-500 hover:text-gray-900">FAQ / Допомога</Link></li>
              <li><Link to="/safety" className="text-base text-gray-500 hover:text-gray-900">Правила безпеки</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Правова інформація</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">Політика конфіденційності</Link></li>
              <li><Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">Умови використання</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2026 The Son of Tsundere. Всі права захищено.
          </p>
        </div>
      </div>
    </footer>
  );
}
