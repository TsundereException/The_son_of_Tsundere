import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category

# Отримуємо всі головні категорії (без parent)
categories = Category.objects.filter(parent__isnull=True).order_by('id')

# Список кольорів для красивого вигляder 
colors = [
    'bg-blue-100 text-blue-600',
    'bg-teal-100 text-teal-600',
    'bg-gray-200 text-gray-700',
    'bg-red-100 text-red-600',
    'bg-yellow-100 text-yellow-600',
    'bg-indigo-100 text-indigo-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-sky-100 text-sky-600',
    'bg-rose-100 text-rose-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-cyan-100 text-cyan-600'
]

# Для Дітей, Нерухомості, Авто і тд
fixed_colors = {
    'Дитячий світ': 'bg-pink-100 text-pink-600',
    'Нерухомість': 'bg-blue-100 text-blue-600',
    'Авто': 'bg-teal-100 text-teal-600',
    'Запчастини': 'bg-gray-200 text-gray-700',
    'Електроніка': 'bg-red-100 text-red-600',
    'Робота': 'bg-yellow-100 text-yellow-600',
    'Тварини': 'bg-indigo-100 text-indigo-600',
    'Дім і сад': 'bg-green-100 text-green-600',
    'Мода і стиль': 'bg-purple-100 text-purple-600',
    'Хобі, відпочинок і спорт': 'bg-orange-100 text-orange-600',
    'Бізнес та послуги': 'bg-sky-100 text-sky-600',
    'Житло подобово': 'bg-rose-100 text-rose-600',
    'Оренда та прокат': 'bg-amber-100 text-amber-600',
    'Віддам безкоштовно': 'bg-emerald-100 text-emerald-600',
    'Обмін': 'bg-fuchsia-100 text-fuchsia-600'
}

for cat in categories:
    color = fixed_colors.get(cat.name)
    if not color:
        color = 'bg-gray-100 text-gray-600'
    cat.color = color
    cat.save()
    print(f"Updated {cat.name} with color {color}")
