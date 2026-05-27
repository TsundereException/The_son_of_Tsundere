import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, CreditCard, MapPin, Truck } from 'lucide-react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

export default function CheckoutModal({ isOpen, onClose, product, isSafeDeal }) {
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    delivery_provider: 'nova_poshta',
    address: '',
    card_number: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        address: formData.address,
        comment: formData.comment,
        items: [{ product_id: product.id, quantity: 1 }]
      };

      if (isSafeDeal) {
        payload.delivery_provider = formData.delivery_provider;
        payload.card_number = formData.card_number;
        await apiClient.post('/orders/safe-buy/', payload);
        await showAlert('Безпечну угоду оформлено успішно! Гроші зарезервовані.');
      } else {
        await apiClient.post('/orders/create/', payload);
        await showAlert('Замовлення оформлено!');
      }

      onClose();
      navigate('/profile'); // Перехід до профілю (Мої замовлення)
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка оформлення замовлення');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isSafeDeal ? 'Оформлення Безпечної угоди' : 'Оформлення замовлення'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Інформація про товар */}
          <div className="flex gap-4 items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <img src={product.images?.[0]?.image || 'https://via.placeholder.com/60'} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-indigo-600 font-bold">{product.price} ₴</p>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-500" /> Доставка
                </h3>
                
                {isSafeDeal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Служба доставки</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 transition-colors ${formData.delivery_provider === 'nova_poshta' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="delivery_provider" value="nova_poshta" className="hidden" checked={formData.delivery_provider === 'nova_poshta'} onChange={(e) => setFormData({...formData, delivery_provider: e.target.value})} />
                        <span className="font-bold">Нова Пошта</span>
                      </label>
                      <label className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 transition-colors ${formData.delivery_provider === 'ukrposhta' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="delivery_provider" value="ukrposhta" className="hidden" checked={formData.delivery_provider === 'ukrposhta'} onChange={(e) => setFormData({...formData, delivery_provider: e.target.value})} />
                        <span className="font-bold">Укрпошта</span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Відділення / Адреса</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      id="address"
                      type="text" 
                      required 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="м. Київ, Відділення №1"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Коментар до замовлення</label>
                  <textarea 
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    rows="2"
                  />
                </div>
              </div>
            )}

            {step === 2 && isSafeDeal && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" /> Оплата
                </h3>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>Кошти будуть лише зарезервовані.</strong> Продавець отримає гроші тільки після того, як ви оглянете товар на пошті та заберете його.
                  </p>
                </div>
                <div>
                  <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1">Номер картки (Тестовий)</label>
                  <input 
                    id="card_number"
                    type="text" 
                    required 
                    value={formData.card_number}
                    onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                    placeholder="4149 4993 0000 9999"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Термін дії</label>
                    <input id="expiry" type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input id="cvv" type="password" placeholder="123" maxLength="3" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t flex justify-between bg-gray-50 gap-4">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50">
              Назад
            </button>
          ) : (
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200">
              Скасувати
            </button>
          )}

          {(step === 1 && isSafeDeal) ? (
            <button type="button" onClick={handleNext} disabled={!formData.address} className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex-1">
              Далі (Оплата)
            </button>
          ) : (
            <button type="submit" form="checkout-form" disabled={isSubmitting || (isSafeDeal && !formData.card_number)} className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex-1">
              {isSubmitting ? 'Обробка...' : (isSafeDeal ? `Оплатити ${product.price} ₴` : 'Замовити')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

CheckoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    images: PropTypes.array
  }).isRequired,
  isSafeDeal: PropTypes.bool
};
