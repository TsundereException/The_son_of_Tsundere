"""
Скрипт заповнення бази даних повним деревом категорій OLX
з прив'язаними атрибутами фільтрів до кожної категорії.

Запуск: venv\Scripts\python.exe seed_olx_full.py
"""
import os
import django
import uuid
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category, FilterAttribute, FilterOption


def make_slug(name):
    """Генерує унікальний slug з uuid-суфіксом."""
    base = slugify(name, allow_unicode=True)
    if not base:
        base = 'cat'
    return f"{base}-{str(uuid.uuid4())[:6]}"


def make_attr_slug(name):
    """Генерує slug для атрибута (латиницею)."""
    # Транслітерація основних кириличних літер
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
        'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'j', 'к': 'k',
        'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
        'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', 'ґ': 'g',
        "'": '', "'": '', '"': '', ' ': '-', '/': '-', '(': '', ')': '',
    }
    result = ''
    for char in name.lower():
        result += translit_map.get(char, char)
    # Очистити від зайвих символів
    import re
    result = re.sub(r'[^a-z0-9-]', '', result)
    result = re.sub(r'-+', '-', result).strip('-')
    return result[:50] + '-' + str(uuid.uuid4())[:4]


def create_category(name, parent=None, icon_name=None, color=None):
    """Створює категорію."""
    cat = Category.objects.create(
        name=name,
        slug=make_slug(name),
        parent=parent,
        icon_name=icon_name,
        color=color,
    )
    print(f"  {'  ' * (1 if parent else 0)}+ Категорія: {name}")
    return cat


def create_attribute(name, attr_type, options, categories, order=0):
    """Створює атрибут фільтра з опціями і прив'язує до категорій."""
    attr = FilterAttribute.objects.create(
        name=name,
        slug=make_attr_slug(name),
        type=attr_type,
        order=order,
    )
    attr.categories.set(categories)
    for i, opt_value in enumerate(options):
        FilterOption.objects.create(
            attribute=attr,
            value=opt_value,
            order=i,
        )
    cat_names = ', '.join([c.name for c in categories[:3]])
    print(f"    ✓ Атрибут: {name} ({len(options)} опцій) → [{cat_names}]")
    return attr


def seed():
    print("\n[+] Очищаємо старі дані...")
    FilterOption.objects.all().delete()
    FilterAttribute.objects.all().delete()
    Category.objects.all().delete()
    print("   Готово.\n")

    print("[+] Створюємо дерево категорій...\n")

    # ==========================================
    # 1. ДИТЯЧИЙ СВІТ
    # ==========================================
    kids = create_category("Дитячий світ", icon_name="Baby", color="bg-pink-100 text-pink-600")
    kids_clothes = create_category("Дитячий одяг", parent=kids)
    create_category("Одяг для хлопчиків", parent=kids_clothes)
    create_category("Одяг для дівчаток", parent=kids_clothes)
    create_category("Одяг для немовлят", parent=kids_clothes)
    kids_shoes = create_category("Дитяче взуття", parent=kids)
    kids_strollers = create_category("Дитячі коляски", parent=kids)
    kids_carseats = create_category("Автокрісла", parent=kids)
    kids_furniture = create_category("Дитячі меблі", parent=kids)
    kids_toys = create_category("Іграшки", parent=kids)
    kids_transport = create_category("Транспорт для дітей", parent=kids)

    all_kids = [kids, kids_clothes, kids_shoes, kids_strollers, kids_carseats, kids_furniture, kids_toys, kids_transport]
    create_attribute("Стан", "radio", ["Нове", "Вживане"], all_kids, order=1)
    create_attribute("Розмір одягу (дитячий)", "checkbox",
        ["50", "56", "62", "68", "74", "80", "86", "92", "98", "104", "110", "116", "122", "128", "134", "140", "146", "152", "158", "164", "170+"],
        [kids_clothes], order=2)
    create_attribute("Розмір взуття (дитячий)", "checkbox",
        ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
        [kids_shoes], order=3)
    create_attribute("Бренд (дитячий)", "checkbox",
        ["Chicco", "Zara", "H&M", "Lenne", "Reima", "Carter's", "Next", "Nike", "Adidas", "Puma"],
        [kids_clothes, kids_shoes], order=4)

    # ==========================================
    # 2. НЕРУХОМІСТЬ
    # ==========================================
    realty = create_category("Нерухомість", icon_name="Home", color="bg-blue-100 text-blue-600")
    apartments = create_category("Квартири", parent=realty)
    create_category("Продаж квартир", parent=apartments)
    create_category("Оренда квартир", parent=apartments)
    houses = create_category("Будинки", parent=realty)
    rooms = create_category("Кімнати", parent=realty)
    land = create_category("Земля", parent=realty)
    commercial = create_category("Комерційна нерухомість", parent=realty)
    abroad = create_category("Нерухомість за кордоном", parent=realty)

    all_realty = [realty, apartments, houses, rooms, land, commercial, abroad]
    create_attribute("Тип нерухомості", "radio",
        ["Квартира", "Будинок", "Кімната", "Ділянка", "Гараж", "Комерційна"],
        all_realty, order=1)
    create_attribute("Тип угоди", "radio",
        ["Від власника", "Від забудовника", "Бізнес"],
        all_realty, order=2)
    create_attribute("Кількість кімнат", "radio",
        ["1", "2", "3", "4", "5+"],
        [realty, apartments, houses, rooms], order=3)
    create_attribute("Тип стін", "checkbox",
        ["Цегляний", "Панельний", "Монолітний", "Газоблок"],
        [realty, apartments, houses], order=4)
    create_attribute("Опалення", "checkbox",
        ["Централізоване", "Індивідуальне газове", "Власна котельня"],
        [realty, apartments, houses], order=5)
    create_attribute("Ремонт", "radio",
        ["Авторський проект", "Євроремонт", "Косметичний ремонт", "Без ремонту", "Під чистову обробку"],
        [realty, apartments, houses], order=6)
    create_attribute("Меблювання", "radio", ["Так", "Ні"],
        [realty, apartments, houses, rooms], order=7)

    # ==========================================
    # 3. АВТО
    # ==========================================
    auto = create_category("Авто", icon_name="Car", color="bg-teal-100 text-teal-600")
    cars = create_category("Легкові автомобілі", parent=auto)
    trucks = create_category("Вантажні автомобілі", parent=auto)
    buses = create_category("Автобуси", parent=auto)
    moto = create_category("Мото", parent=auto)
    special = create_category("Спецтехніка", parent=auto)
    agro = create_category("Сільгосптехніка", parent=auto)
    water = create_category("Водний транспорт", parent=auto)
    auto_pl = create_category("Автомобілі з Польщі", parent=auto)
    trailers = create_category("Причепи / будинки на колесах", parent=auto)
    trucks_pl = create_category("Вантажівки та спецтехніка з Польщі", parent=auto)
    other_transport = create_category("Інший транспорт", parent=auto)

    all_auto = [auto, cars, trucks, buses, moto, special, agro, water, auto_pl, trailers, trucks_pl, other_transport]
    
    create_attribute("Тип автомобіля", "radio",
        ["Вживані", "Нові", "Під пригон"],
        [cars], order=1)
        
    create_attribute("Рік випуску", "range", [],
        [auto, cars], order=2)
        
    create_attribute("Умови продажу", "radio",
        ["Звичайний продаж", "Можливий обмін", "Під виплату", "Кредит"],
        [auto, cars], order=3)
        
    create_attribute("Пробіг", "range", [],
        [auto, cars], order=4)

    create_attribute("Марка авто", "checkbox",
        ["Alfa Romeo", "Audi", "Bentley", "BMW", "Buick", "Cadillac", "Chery", "Chevrolet",
         "Chrysler", "Citroen", "Dacia", "Daewoo", "Dodge", "Fiat", "Ford", "Geely",
         "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Land Rover", "Lexus", "Mazda",
         "Mercedes-Benz", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche",
         "Renault", "Skoda", "Subaru", "Suzuki", "Toyota", "Volkswagen", "Volvo", "ВАЗ"],
        [auto, cars, trucks, buses], order=5)
        
    create_attribute("Тип кузова", "radio",
        ["Седан", "Хетчбек", "Універсал", "Позашляховик / Кросовер", "Мінівен", "Купе"],
        [auto, cars], order=6)
        
    create_attribute("Вид палива", "radio",
        ["Бензин", "Дизель", "Газ", "Газ / Бензин", "Електро", "Гібрид"],
        [auto, cars], order=7)
        
    create_attribute("Коробка передач", "radio",
        ["Ручна / Механіка", "Автомат", "Варіатор", "Робот"],
        [auto, cars], order=8)
        
    create_attribute("Колір", "color",
        ["Білий", "Чорний", "Сірий", "Срібний", "Синій", "Червоний", "Зелений", "Коричневий", "Інший"],
        [auto, cars], order=9)
        
    create_attribute("Технічний стан", "radio",
        ["На ходу, технічно справна", "Потребує ремонту", "Після ДТП", "Не на ходу", "Гаражне зберігання"],
        [auto, cars], order=10)
        
    create_attribute("Розмитнена", "radio", ["Так", "Ні"],
        [auto, cars], order=11)
        
    create_attribute("Авто пригнано з", "radio",
        ["США", "Європи", "Кореї", "Грузії", "Іншої країни"],
        [auto, cars], order=12)
        
    # ==========================================
    # 3.1. ЗАПЧАСТИНИ
    # ==========================================
    parts = create_category("Запчастини", icon_name="Settings", color="bg-gray-200 text-gray-700")
    engine = create_category("Двигун", parent=parts)
    exhaust = create_category("Вихлопна система", parent=parts)
    suspension = create_category("Ходова частина / підвіска", parent=parts)
    transmission = create_category("Трансмісія / КПП та АКПП", parent=parts)
    brakes = create_category("Гальмівна система", parent=parts)
    body_parts = create_category("Кузовні запчастини", parent=parts)
    
    all_parts = [parts, engine, exhaust, suspension, transmission, brakes, body_parts]
    create_attribute("Тип запчастини", "radio", ["Оригінал", "Аналог"],
        all_parts, order=1)
    create_attribute("Стан запчастини", "radio", ["Нове", "Вживане"],
        all_parts, order=2)
    create_attribute("Тип двигуна", "radio",
        ["Бензин", "Дизель", "Газ", "Електро", "Інший"],
        [engine], order=3)

    # ==========================================
    # 4. ЕЛЕКТРОНІКА
    # ==========================================
    electronics = create_category("Електроніка", icon_name="Smartphone", color="bg-red-100 text-red-600")
    phones = create_category("Телефони та аксесуари", parent=electronics)
    computers = create_category("Комп'ютери та комплектуючі", parent=electronics)
    audio = create_category("Аудіотехніка", parent=electronics)
    tv = create_category("ТБ / Відеотехніка", parent=electronics)
    tablets = create_category("Планшети, електронні книги та аксесуари", parent=electronics)
    home_tech = create_category("Техніка для дому", parent=electronics)
    climate = create_category("Кліматичне обладнання", parent=electronics)
    games = create_category("Ігри та ігрові приставки", parent=electronics)

    all_electronics = [electronics, phones, computers, audio, tv, tablets, home_tech, climate, games]
    create_attribute("Стан (електроніка)", "radio", ["Нове", "Вживане"],
        all_electronics, order=1)
    create_attribute("Марка телефону", "checkbox",
        ["Apple", "Samsung", "Xiaomi", "Huawei", "Motorola", "OnePlus", "Google", "Nokia", "Realme", "OPPO"],
        [phones], order=2)
    create_attribute("Оперативна пам'ять", "radio",
        ["2 ГБ", "4 ГБ", "6 ГБ", "8 ГБ", "12 ГБ", "16 ГБ", "32 ГБ", "64 ГБ"],
        [phones, computers, tablets], order=3)
    create_attribute("Вбудована пам'ять", "radio",
        ["32 ГБ", "64 ГБ", "128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"],
        [phones, computers, tablets], order=4)
    create_attribute("Бренд ноутбука", "checkbox",
        ["Asus", "Acer", "Apple", "Dell", "HP", "Lenovo", "MSI", "Microsoft"],
        [computers], order=5)
    create_attribute("Тип ТБ", "radio",
        ["LED", "OLED", "QLED", "Плазмовий"],
        [tv], order=6)
    create_attribute("Smart TV", "radio", ["Так", "Ні"],
        [tv], order=7)

    # ==========================================
    # 5. РОБОТА
    # ==========================================
    work = create_category("Робота", icon_name="Briefcase", color="bg-yellow-100 text-yellow-600")
    create_category("Роздрібна торгівля / Продажі", parent=work)
    create_category("Транспорт / Логістика", parent=work)
    create_category("Будівництво / Архітектура", parent=work)
    create_category("Готельно-ресторанний бізнес / Туризм", parent=work)
    create_category("Охорона / Безпека", parent=work)
    create_category("Домашній персонал", parent=work)
    create_category("IT / Телеком / Комп'ютери", parent=work)
    create_category("Маркетинг / Реклама / Дизайн", parent=work)
    create_category("Виробництво / Робітничі спеціальності", parent=work)

    all_work = [work] + list(Category.objects.filter(parent=work))
    create_attribute("Тип зайнятості", "radio",
        ["Повна зайнятість", "Неповна зайнятість", "Віддалена робота"],
        all_work, order=1)
    create_attribute("Графік роботи", "radio",
        ["Гнучкий графік", "Змінний графік", "Вахта", "5/2"],
        all_work, order=2)
    create_attribute("Досвід роботи", "radio",
        ["Без досвіду", "До 1 року", "1-3 роки", "3-5 років", "Більше 5 років"],
        all_work, order=3)
    create_attribute("Рівень освіти", "radio",
        ["Вища", "Незакінчена вища", "Середня спеціальна", "Середня"],
        all_work, order=4)

    # ==========================================
    # 6. ТВАРИНИ
    # ==========================================
    animals = create_category("Тварини", icon_name="PawPrint", color="bg-indigo-100 text-indigo-600")
    dogs = create_category("Собаки", parent=animals)
    cats = create_category("Коти", parent=animals)
    birds = create_category("Птахи", parent=animals)
    rodents = create_category("Гризуни", parent=animals)
    aquarium = create_category("Акваріумістика", parent=animals)
    pet_goods = create_category("Товари для тварин", parent=animals)

    all_animals = [animals, dogs, cats, birds, rodents, aquarium, pet_goods]
    create_attribute("Порода собак", "checkbox",
        ["Вівчарка", "Мопс", "Хаскі", "Лабрадор", "Йоркширський тер'єр", "Чихуахуа", "Такса", "Ротвейлер", "Безпородна"],
        [dogs], order=1)
    create_attribute("Порода котів", "checkbox",
        ["Британська", "Шотландська", "Мейн-кун", "Сфінкс", "Персидська", "Сіамська", "Бенгальська", "Безпородна"],
        [cats], order=2)
    create_attribute("Вік тварини", "radio",
        ["До 3 міс.", "3-6 міс.", "6-12 міс.", "Більше 1 року"],
        all_animals, order=3)
    create_attribute("Стать тварини", "radio",
        ["Хлопчик", "Дівчинка"],
        [animals, dogs, cats, birds, rodents], order=4)
    create_attribute("Родовід", "radio",
        ["З родоводом", "Без родоводу"],
        [dogs, cats], order=5)

    # ==========================================
    # 7. ДІМ І САД
    # ==========================================
    home = create_category("Дім і сад", icon_name="TreePine", color="bg-green-100 text-green-600")
    furniture = create_category("Меблі", parent=home)
    construction = create_category("Будівництво / ремонт", parent=home)
    garden = create_category("Сад / город", parent=home)
    plants = create_category("Кімнатні рослини", parent=home)
    dishes = create_category("Посуд / кухонне приладдя", parent=home)

    all_home = [home, furniture, construction, garden, plants, dishes]
    create_attribute("Стан (дім)", "radio", ["Нове", "Вживане"],
        all_home, order=1)
    create_attribute("Тип меблів", "checkbox",
        ["Дивани", "Ліжка", "Шафи", "Столи", "Стільці", "Комоди", "Полиці"],
        [furniture], order=2)
    create_attribute("Матеріал", "checkbox",
        ["Дерево", "ДСП", "МДФ", "Метал", "Скло", "Пластик"],
        [furniture], order=3)
    create_attribute("Тип будматеріалів", "checkbox",
        ["Цегла", "Газоблок", "Цемент", "Гіпсокартон", "Утеплювач", "Фарба", "Плитка"],
        [construction], order=4)

    # ==========================================
    # 8. МОДА І СТИЛЬ
    # ==========================================
    fashion = create_category("Мода і стиль", icon_name="Shirt", color="bg-purple-100 text-purple-600")
    clothing = create_category("Одяг", parent=fashion)
    footwear = create_category("Взуття", parent=fashion)
    accessories = create_category("Аксесуари", parent=fashion)
    watches = create_category("Годинники", parent=fashion)
    gifts = create_category("Подарунки", parent=fashion)

    all_fashion = [fashion, clothing, footwear, accessories, watches, gifts]
    create_attribute("Стан (мода)", "radio", ["Нове", "Вживане"],
        all_fashion, order=1)
    create_attribute("Тип одягу", "checkbox",
        ["Сукні", "Куртки", "Штани", "Футболки", "Джинси", "Светри", "Спортивний одяг"],
        [clothing], order=2)
    create_attribute("Для кого", "radio",
        ["Жіночий", "Чоловічий", "Унісекс"],
        [fashion, clothing, footwear], order=3)
    create_attribute("Розмір одягу", "checkbox",
        ["XS", "S", "M", "L", "XL", "XXL", "3XL+"],
        [clothing], order=4)
    create_attribute("Розмір взуття", "checkbox",
        ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
        [footwear], order=5)
    create_attribute("Сезон", "radio",
        ["Літо", "Осінь", "Зима", "Весна", "Демісезон"],
        [fashion, clothing, footwear], order=6)

    # ==========================================
    # 9. ХОБІ, ВІДПОЧИНОК І СПОРТ
    # ==========================================
    hobby = create_category("Хобі, відпочинок і спорт", icon_name="Dumbbell", color="bg-orange-100 text-orange-600")
    sport = create_category("Спорт / відпочинок", parent=hobby)
    books = create_category("Книги / журнали", parent=hobby)
    music = create_category("Музичні інструменти", parent=hobby)
    antiques = create_category("Антикваріат / Колекції", parent=hobby)

    all_hobby = [hobby, sport, books, music, antiques]
    create_attribute("Стан (хобі)", "radio", ["Нове", "Вживане"],
        all_hobby, order=1)
    create_attribute("Вид спорту", "checkbox",
        ["Велоспорт", "Туризм", "Тренажери", "Зимові види спорту", "Єдиноборства", "Водні види", "Біг"],
        [sport], order=2)
    create_attribute("Жанр книги", "checkbox",
        ["Художня література", "Бізнес", "Навчальна", "Дитяча", "Наукова", "Фантастика"],
        [books], order=3)
    create_attribute("Тип інструменту", "checkbox",
        ["Гітари", "Клавішні", "Ударні", "Смичкові", "Духові", "Електронні"],
        [music], order=4)

    # ==========================================
    # 10. БІЗНЕС ТА ПОСЛУГИ
    # ==========================================
    services = create_category("Бізнес та послуги", icon_name="Wrench", color="bg-gray-100 text-gray-600")
    create_category("Будівельні послуги", parent=services)
    create_category("Ремонт та обслуговування техніки", parent=services)
    create_category("Послуги для тварин", parent=services)
    create_category("Няні / доглядальниці", parent=services)
    create_category("Краса / здоров'я", parent=services)
    create_category("Освіта / Спорт", parent=services)
    create_category("Юридичні послуги", parent=services)
    create_category("Перевезення / Оренда транспорту", parent=services)

    # ==========================================
    # 11. ЖИТЛО ПОДОБОВО
    # ==========================================
    daily_rent = create_category("Житло подобово", icon_name="Key", color="bg-pink-100 text-pink-600")
    create_category("Квартири подобово", parent=daily_rent)
    create_category("Будинки подобово", parent=daily_rent)
    create_category("Кімнати подобово", parent=daily_rent)
    create_category("Готелі / Бази відпочинку", parent=daily_rent)
    
    # ==========================================
    # 12. ОРЕНДА ТА ПРОКАТ
    # ==========================================
    rentals = create_category("Оренда та прокат", icon_name="RefreshCw", color="bg-blue-100 text-blue-600")
    create_category("Прокат авто", parent=rentals)
    create_category("Прокат суконь", parent=rentals)
    create_category("Прокат інструментів", parent=rentals)

    # ==========================================
    # ПІДСУМОК
    # ==========================================
    total_cats = Category.objects.count()
    total_attrs = FilterAttribute.objects.count()
    total_opts = FilterOption.objects.count()
    
    print(f"\n{'='*50}")
    print(f"[OK] ГОТОВО!")
    print(f"   Категорій:   {total_cats}")
    print(f"   Атрибутів:   {total_attrs}")
    print(f"   Опцій:       {total_opts}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    seed()
