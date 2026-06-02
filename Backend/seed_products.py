import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category, Product, ProductImage
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

User = get_user_model()
user = User.objects.first()

items = [
    {
        'category_name': 'Собаки',
        'title': 'Цуценя золотистого ретривера',
        'desc': 'Продається чудове цуценя золотистого ретривера, дуже грайливе та миле.',
        'price': 15000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\golden_retriever_1779705031558.png'
    },
    {
        'category_name': 'Мобільні телефони',
        'title': 'Сучасний смартфон',
        'desc': 'Новий стильний смартфон з OLED екраном та потужною камерою.',
        'price': 25000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\smartphone_1779705043958.png'
    },
    {
        'category_name': 'Оренда квартир',
        'title': 'Затишна 1-кімнатна квартира',
        'desc': 'Здається в оренду сучасна квартира з дизайнерським ремонтом.',
        'price': 12000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\apartment_1779705058358.png'
    },
    {
        'category_name': 'Плівкові фотоапарати',
        'title': 'Вінтажна камера',
        'desc': 'Стара плівкова камера в ідеальному стані, повністю робоча.',
        'price': 3000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\vintage_camera_1779705071682.png'
    },
    {
        'category_name': 'Комп\'ютери',
        'title': 'Ігровий ПК',
        'desc': 'Потужний ігровий комп\'ютер з RGB підсвіткою та крутою відеокартою.',
        'price': 45000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\gaming_pc_1779705085632.png'
    },
    {
        'category_name': 'Велосипеди',
        'title': 'Гірський велосипед',
        'desc': 'Спортивний гірський велосипед для екстремальних поїздок.',
        'price': 18000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\mountain_bike_1779705100314.png'
    },
    {
        'category_name': 'Фітнес',
        'title': 'Набір гантелей',
        'desc': 'Комплект сучасних гантелей для домашніх тренувань.',
        'price': 2500,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\dumbbells_1779705115739.png'
    },
    {
        'category_name': 'Коти',
        'title': 'Миле кошеня',
        'desc': 'Пухнасте кошеня шукає новий дім. Дуже любить гратися.',
        'price': 500,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\kitten_1779705128892.png'
    },
    {
        'category_name': 'Клавіатури',
        'title': 'Механічна клавіатура',
        'desc': 'Кастомна механічна клавіатура з унікальними кейкапами.',
        'price': 4200,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\mech_keyboard_1779705143079.png'
    },
    {
        'category_name': 'Акустичні гітари',
        'title': 'Акустична гітара',
        'desc': 'Прекрасна червона акустична гітара, ідеально звучить.',
        'price': 8000,
        'image': r'C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\acoustic_guitar_1779705156778.png'
    }
]

import uuid
from django.utils.text import slugify
from unidecode import unidecode

created_count = 0
for item in items:
    cat = Category.objects.filter(name__icontains=item['category_name']).first()
    if not cat:
        cat = Category.objects.filter(parent__isnull=False).first()
        
    base_slug = slugify(unidecode(item['title']))
    unique_slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"

    p = Product.objects.create(
        seller=user,
        category=cat,
        name=item['title'],
        description=item['desc'],
        price=item['price'],
        city='Київ',
        slug=unique_slug,
        is_active=True
    )
    
    with open(item['image'], 'rb') as f:
        img_content = f.read()
        
    pi = ProductImage(product=p, is_main=True)
    pi.image.save(os.path.basename(item['image']), ContentFile(img_content), save=True)
    created_count += 1
    print(f"Created {p.name} in {cat.name}")

print(f"Total created: {created_count}")
