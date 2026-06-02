import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const { showAlert, showConfirm, showPrompt } = useModal();

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/categories/');
      setCategories(data.results || data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategorySlug) return;
    
    try {
      await apiClient.post('/auth/admin/categories/', { 
        name: newCategoryName, 
        slug: newCategorySlug 
      });
      setNewCategoryName('');
      setNewCategorySlug('');
      fetchCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      await showAlert('Помилка при створенні категорії (можливо такий slug вже існує)');
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = await showConfirm('Видалити категорію? Усі товари в ній можуть залишитись без категорії.');
    if (confirmed) {
      try {
        await apiClient.delete(`/auth/admin/categories/${id}/`);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        await showAlert('Не вдалося видалити категорію');
      }
    }
  };

  const editCategory = async (id, currentName, currentSlug) => {
    const newName = await showPrompt('Нова назва категорії:', currentName);
    if (!newName) return;
    const newSlug = await showPrompt('Новий slug (url-назва, англійською без пробілів):', currentSlug);
    if (!newSlug) return;

    try {
      await apiClient.patch(`/auth/admin/categories/${id}/`, {
        name: newName,
        slug: newSlug
      });
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      await showAlert('Не вдалося оновити категорію');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Завантаження категорій...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управління категоріями</h1>
        <p className="mt-1 text-sm text-gray-500">Додавання, редагування та видалення категорій товарів.</p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Додати нову категорію</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Назва категорії</label>
            <input 
              type="text" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Наприклад: Ноутбуки"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (для URL)</label>
            <input 
              type="text" 
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Наприклад: laptops"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center h-[42px]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Додати
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => editCategory(c.id, c.name, c.slug)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                    title="Редагувати"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(c.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  Категорій поки немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
