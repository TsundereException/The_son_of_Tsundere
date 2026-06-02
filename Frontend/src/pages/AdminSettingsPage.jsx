import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    platform_commission: 5.0,
    support_email: '',
    hide_generated_data: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get('/auth/admin/settings/');
        setSettings({
          maintenance_mode: data.maintenance_mode,
          platform_commission: parseFloat(data.platform_commission),
          support_email: data.support_email,
          hide_generated_data: data.hide_generated_data
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Миттєве збереження для тумблерів (checkbox)
    if (type === 'checkbox') {
      try {
        await apiClient.put('/auth/admin/settings/', { ...settings, [name]: newValue });
        setMessage('Статус оновлено!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Failed to quick-save setting:', error);
        setMessage('Помилка при збереженні.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/auth/admin/settings/', settings);
      setMessage('Налаштування успішно збережено!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Помилка при збереженні налаштувань.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Завантаження налаштувань...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Глобальні налаштування</h1>
        <p className="mt-1 text-sm text-gray-500">Керування конфігурацією маркетплейсу.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="flex items-center justify-between p-4 border rounded-xl border-gray-200">
            <div>
              <label className="font-medium text-gray-900 block">Режим обслуговування</label>
              <span className="text-sm text-gray-500">Якщо увімкнено, користувачі бачитимуть сторінку технічних робіт.</span>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="maintenance_mode" 
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleChange}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-indigo-600 focus:outline-none transition-all duration-300"
                style={{ top: '0', left: settings.maintenance_mode ? '1.5rem' : '0', right: '0' }}
              />
              <label htmlFor="maintenance_mode" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.maintenance_mode ? 'bg-indigo-600' : 'bg-gray-300'}`}></label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl border-gray-200">
            <div>
              <label className="font-medium text-gray-900 block">Приховати тестові оголошення</label>
              <span className="text-sm text-gray-500">Якщо увімкнено, згенеровані тестові оголошення не відображатимуться на сайті.</span>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="hide_generated_data" 
                id="hide_generated_data"
                checked={settings.hide_generated_data}
                onChange={handleChange}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-indigo-600 focus:outline-none transition-all duration-300"
                style={{ top: '0', left: settings.hide_generated_data ? '1.5rem' : '0', right: '0' }}
              />
              <label htmlFor="hide_generated_data" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.hide_generated_data ? 'bg-indigo-600' : 'bg-gray-300'}`}></label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комісія платформи (%)</label>
            <input 
              type="number"
              step="0.01"
              name="platform_commission"
              value={settings.platform_commission}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Відсоток, який платформа забирає з кожного продажу.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактний Email підтримки</label>
            <input 
              type="email"
              name="support_email"
              value={settings.support_email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Помилка') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
