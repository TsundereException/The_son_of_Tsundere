import os
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category

def seed():
    data = [
        {
            "name": "Дитячий світ",
            "icon_name": "Baby",
            "color": "bg-yellow-100 text-yellow-600",
            "children": ["Дитячий одяг", "Дитяче взуття", "Дитячі коляски", "Дитячі автокрісла", "Іграшки", "Товари для школярів"]
        },
        {
            "name": "Нерухомість",
            "icon_name": "Home",
            "color": "bg-blue-100 text-blue-600",
            "children": ["Квартири", "Кімнати", "Будинки", "Земля", "Комерційна нерухомість", "Гаражі, парковки"]
        },
        {
            "name": "Авто",
            "icon_name": "Car",
            "color": "bg-cyan-100 text-cyan-600",
            "children": ["Легкові автомобілі", "Вантажні автомобілі", "Автобуси", "Мото", "Спецтехніка", "Сільгосптехніка"]
        },
        {
            "name": "Запчастини",
            "icon_name": "Wrench",
            "color": "bg-red-100 text-red-600",
            "children": ["Автозапчастини", "Аксесуари для авто", "Автозвук", "Шини, диски", "Мотозапчастини", "Мастила та автохімія"]
        },
        {
            "name": "Робота",
            "icon_name": "Briefcase",
            "color": "bg-amber-100 text-amber-600",
            "children": ["Роздрібна торгівля", "Транспорт / Логістика", "Будівництво", "Готельно-ресторанний бізнес", "ІТ / Телеком"]
        },
        {
            "name": "Тварини",
            "icon_name": "Dog",
            "color": "bg-indigo-100 text-indigo-600",
            "children": ["Собаки", "Коти", "Акваріумістика", "Птахи", "Гризуни", "Зоотовари"]
        },
        {
            "name": "Дім і сад",
            "icon_name": "Armchair",
            "color": "bg-emerald-100 text-emerald-600",
            "children": ["Меблі", "Будівництво / ремонт", "Інструменти", "Кімнатні рослини", "Посуд", "Садовий інвентар"]
        },
        {
            "name": "Електроніка",
            "icon_name": "Smartphone",
            "color": "bg-pink-100 text-pink-600",
            "children": ["Телефони та аксесуари", "Комп'ютери", "Фото / відео", "ТБ / відеотехніка", "Аудіотехніка", "Ігрові приставки"]
        },
        {
            "name": "Бізнес та послуги",
            "icon_name": "Wand2",
            "color": "bg-orange-100 text-orange-600",
            "children": ["Будівельні послуги", "Фінансові послуги", "Перевезення", "Реклама / поліграфія", "Няні / доглядальниці", "Краса / здоров'я"]
        },
        {
            "name": "Мода і стиль",
            "icon_name": "Shirt",
            "color": "bg-purple-100 text-purple-600",
            "children": ["Жіночий одяг", "Чоловічий одяг", "Жіноче взуття", "Чоловіче взуття", "Аксесуари", "Подарунки"]
        },
    ]

    print("Clearing old categories...")
    Category.objects.all().delete()

    import uuid
    for item in data:
        parent = Category.objects.create(
            name=item["name"],
            slug=slugify(item["name"], allow_unicode=True) + "-" + str(uuid.uuid4())[:6],
            icon_name=item["icon_name"],
            color=item["color"]
        )
        print(f"Created parent: {parent.name}")
        for child_name in item["children"]:
            Category.objects.create(
                name=child_name,
                slug=slugify(child_name, allow_unicode=True) + "-" + str(uuid.uuid4())[:6],
                parent=parent
            )
            print(f"  Created child: {child_name}")

    print("Done!")

if __name__ == '__main__':
    seed()
