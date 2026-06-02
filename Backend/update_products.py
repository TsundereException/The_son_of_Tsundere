import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product

updates = {
    'Цуценя золотистого ретривера': {
        'breed': 'Золотистий ретривер',
        'age': '2 місяці',
        'gender': 'Хлопчик',
        'vaccination': 'Так',
        'documents': 'Є (родовід)'
    },
    'Сучасний смартфон': {
        'brand': 'Samsung',
        'model': 'Galaxy S24',
        'condition': 'Новий',
        'storage': '256 ГБ',
        'ram': '8 ГБ',
        'color': 'Phantom Black'
    },
    'Затишна 1-кімнатна квартира': {
        'rooms': '1',
        'floor': '5',
        'total_area': '45 кв.м',
        'heating': 'Індивідуальне газове',
        'condition': 'Євроремонт',
        'furniture': 'Так'
    },
    'Вінтажна камера': {
        'brand': 'Zenit',
        'model': 'ET',
        'condition': 'Вживане',
        'film_format': '35 мм',
        'lens': 'Helios-44-2'
    },
    'Ігровий ПК': {
        'processor': 'Intel Core i7-13700K',
        'gpu': 'NVIDIA RTX 4070 Ti',
        'ram': '32 ГБ DDR5',
        'storage': '1 ТБ SSD NVMe',
        'condition': 'Новий'
    },
    'Гірський велосипед': {
        'brand': 'Trek',
        'wheel_size': '29"',
        'frame_size': 'L (19"-20")',
        'condition': 'Вживане',
        'brakes': 'Дискові гідравлічні',
        'frame_material': 'Алюміній'
    },
    'Набір гантелей': {
        'weight': '2х10 кг',
        'material': 'Метал, гума',
        'condition': 'Новий',
        'type': 'Розбірні'
    },
    'Миле кошеня': {
        'breed': 'Шотландська висловуха',
        'age': '1.5 місяці',
        'gender': 'Дівчинка',
        'litter_trained': 'Так',
        'condition': 'Вживане' # well, for animals condition is sometimes not applicable, let's put it as empty
    },
    'Механічна клавіатура': {
        'brand': 'Keychron',
        'model': 'Q1 Pro',
        'switches': 'Gateron Brown',
        'connection': 'Бездротова (Bluetooth / 2.4 GHz)',
        'condition': 'Новий',
        'layout': 'ENG/UKR'
    },
    'Акустична гітара': {
        'brand': 'Yamaha',
        'model': 'F310',
        'type': 'Дредноут',
        'strings': 'Бронзові (нові)',
        'condition': 'Вживане',
        'color': 'Червоний санбьорст'
    }
}

for name, attrs in updates.items():
    product = Product.objects.filter(name=name).order_by('-id').first()
    if product:
        # Some tweaks to 'condition' for animals
        if name == 'Миле кошеня' or name == 'Цуценя золотистого ретривера':
            if 'condition' in attrs:
                del attrs['condition']
                
        # Also need to map to standard slugs if applicable
        # Let's just use string values directly as JSON
        # The frontend maps 'stan', 'condition', 'стан' to condition pill. Let's make sure it's 'стан'
        if 'condition' in attrs:
            attrs['stan'] = attrs.pop('condition')

        product.attributes = attrs
        product.save()
        print(f"Updated attributes for {name}")
