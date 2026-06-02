import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category, Product

mapping = {
    'Цуценя золотистого ретривера': 'Собаки',
    'Сучасний смартфон': 'Мобільні телефони / смартфони',
    'Затишна 1-кімнатна квартира': 'Довгострокова оренда квартир',
    'Вінтажна камера': 'Фото / відео',
    'Ігровий ПК': 'Настільні комп\'ютери',
    'Гірський велосипед': 'Вело',
    'Набір гантелей': 'Спорт / відпочинок',
    'Миле кошеня': 'Коти',
    'Механічна клавіатура': 'Аксесуари / комплектуючі',
    'Акустична гітара': 'Музичні інструменти'
}

for product_name, cat_name in mapping.items():
    product = Product.objects.filter(name=product_name).first()
    if not product:
        continue

    # Try exact or icontains
    cat = Category.objects.filter(name__iexact=cat_name).first()
    if not cat:
        cat = Category.objects.filter(name__icontains=cat_name, parent__isnull=False).first()
    
    # fallback
    if not cat and cat_name == 'Мобільні телефони / смартфони':
        cat = Category.objects.filter(name__icontains='Мобильные', parent__isnull=False).first()
        if not cat:
            cat = Category.objects.filter(name__icontains='Телефони', parent__isnull=False).first()
    
    if not cat and cat_name == 'Довгострокова оренда квартир':
        cat = Category.objects.filter(name__icontains='Квартири', parent__isnull=False).first()

    if not cat and cat_name == 'Вело':
        cat = Category.objects.filter(name__icontains='Вело', parent__isnull=False).first()
        
    if cat:
        product.category = cat
        product.save()
        print(f"Moved {product_name} to {cat.name} (Parent: {cat.parent.name if cat.parent else 'None'})")
    else:
        print(f"COULD NOT FIND CATEGORY FOR {product_name} ({cat_name})")
