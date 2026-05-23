import os
import django
import random
import uuid
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category, Product
from django.contrib.auth import get_user_model
User = get_user_model()

# Base descriptions for different main categories
DESCRIPTIONS = {
    "Нерухомість": "Пропонується до уваги чудовий об'єкт нерухомості. Стан відмінний, всі комунікації підведені. Розташування у зручному районі з розвиненою інфраструктурою. Документи готові до продажу. Телефонуйте для деталей!",
    "Авто": "Автомобіль у відмінному технічному стані. Обслуговувався вчасно, пробіг оригінальний. Салон чистий, не прокурений. Є кілька дрібних подряпин на кузові, але нічого серйозного. Сів і поїхав. Торг біля капота.",
    "Запчастини": "Оригінальна запчастина, знята з робочого автомобіля. Стан хороший, без дефектів. Гарантія на встановлення. Відправляємо по всій Україні.",
    "Електроніка": "Пристрій повністю робочий, без прихованих дефектів. Використовувався обережно. В комплекті є все необхідне. Продаю у зв'язку з покупкою новішої моделі. Можливі будь-які перевірки.",
    "Робота": "Шукаємо відповідального співробітника. Пропонуємо стабільну заробітну плату, офіційне працевлаштування, гнучкий графік та дружній колектив. Досвід роботи вітається, але не є обов'язковим. Деталі на співбесіді.",
    "Тварини": "Шукає новий дім чудовий улюбленець. Дуже ласкавий, грайливий, привчений до лотка/пелюшки. Має всі необхідні щеплення за віком. Віддамо тільки в хороші та відповідальні руки.",
    "Дім і сад": "Чудовий товар для вашого дому чи саду. Висока якість матеріалів, довговічний та надійний. Стан ідеальний, майже не користувалися. Продаємо через переїзд.",
    "Мода і стиль": "Стильна річ у відмінному стані. Розмір відповідає стандартному. Матеріал приємний до тіла. Одягалося всього кілька разів. Виглядає як нове.",
    "Хобі, відпочинок і спорт": "Ідеально підходить для активного відпочинку чи хобі. Стан дуже хороший, все працює справно. Подарує вам багато позитивних емоцій. Відправлю поштою або віддам при зустрічі.",
    "Бізнес та послуги": "Надаємо професійні послуги. Великий досвід роботи, гарантія якості та індивідуальний підхід до кожного клієнта. Працюємо швидко та надійно. Звертайтеся, будемо раді допомогти!",
    "Житло подобово": "Здається подобово. Чисто, затишно, є вся необхідна побутова техніка, Wi-Fi, чиста постільна білизна. Зручне розташування. Ідеально підходить для відряджень або відпочинку.",
    "Оренда та прокат": "Пропонуємо в оренду на вигідних умовах. Техніка/річ в ідеальному стані, повністю обслужена. Застава обговорюється індивідуально. Можлива доставка.",
    "Віддам безкоштовно": "Віддам безкоштовно в хороші руки. Стан нормальний, може ще послужити. Самовивіз.",
    "Обмін": "Пропоную на обмін. Річ в хорошому стані. Розгляну ваші пропозиції, перевага надається корисним у господарстві речам або техніці."
}

# Generic names based on subcategory keywords
def generate_names_for_subcategory(parent_cat_name, sub_name):
    sub_name_lower = sub_name.lower()
    
    # Нерухомість
    if "квартири" in sub_name_lower: return ["1-к квартира з ремонтом", "Простора 2-к квартира", "Студія в новобудові", "3-к квартира в центрі", "Затишна квартира"]
    if "будинки" in sub_name_lower: return ["Сучасний котедж", "Цегляний будинок з ділянкою", "Таунхаус з гаражем", "Затишна дача"]
    if "кімнати" in sub_name_lower: return ["Кімната в гуртожитку", "Ізольована кімната", "Кімната без посередників", "Затишна кімната для студента"]
    if "земля" in sub_name_lower: return ["Ділянка під забудову", "Земельна ділянка 10 соток", "Ділянка біля лісу", "Земля сільгосппризначення"]
    
    # Авто
    if "легкові" in sub_name_lower: return ["Toyota Camry 2.5", "Volkswagen Golf VII", "BMW 320i", "Ford Focus", "Renault Megane"]
    if "вантажні" in sub_name_lower: return ["MAN TGX", "DAF XF 105", "Renault Magnum", "Mercedes Sprinter"]
    if "мото" in sub_name_lower: return ["Yamaha R6", "Honda CBR600", "Скутер Honda Dio", "Електроскутер City"]
    
    # Запчастини
    if "двигун" in sub_name_lower: return ["Двигун 2.0 TDI", "Мотор 1.6 бензин", "ГБЦ в зборі", "Турбіна Garret"]
    if "кузов" in sub_name_lower or "кузовні" in sub_name_lower: return ["Капот оригінал", "Крило ліве", "Бампер передній", "Двері праві"]
    if "шини" in sub_name_lower: return ["Комплект літньої резини 205/55 R16", "Зимові шини Michelin", "Диски литі R17"]
    
    # Електроніка
    if "телефони" in sub_name_lower: return ["iPhone 13 Pro 256GB", "Samsung Galaxy S22", "Xiaomi Redmi Note 11", "Чохол для iPhone"]
    if "комп'ютери" in sub_name_lower: return ["Ігровий ПК RTX 3060", "Монітор 24 дюйми 144Hz", "Процесор AMD Ryzen 5", "Оперативна пам'ять 16GB"]
    if "ноутбуки" in sub_name_lower: return ["MacBook Air M1", "Lenovo Legion 5", "Acer Aspire 7", "HP Pavilion"]
    
    # Робота
    if "торгівля" in sub_name_lower or "продаж" in sub_name_lower: return ["Продавець-консультант", "Касир в супермаркет", "Менеджер з продажу", "Мерчендайзер"]
    if "будівництво" in sub_name_lower: return ["Різноробочий", "Маляр-штукатур", "Плиточник", "Електрик"]
    if "it" in sub_name_lower: return ["Junior Python Developer", "QA Engineer", "Системний адміністратор", "HTML Coder"]
    
    # Тварини
    if "собаки" in sub_name_lower: return ["Цуценя лабрадора", "Французький бульдог", "Німецька вівчарка", "Йоркширський тер'єр"]
    if "коти" in sub_name_lower: return ["Шотландське кошеня", "Мейн-кун дівчинка", "Британський кіт", "Безпородне кошеня в добрі руки"]
    
    # Дім і сад
    if "меблі" in sub_name_lower: return ["Диван розкладний", "Шафа-купе", "Двоспальне ліжко", "Кухонний стіл"]
    if "рослини" in sub_name_lower: return ["Орхідея фаленопсис", "Фікус Бенджаміна", "Монстера", "Кактуси набір"]
    
    # Мода
    if "жіночий одяг" in sub_name_lower: return ["Сукня вечірня", "Куртка демісезонна Zara", "Джинси mom fit", "Спортивний костюм"]
    if "чоловічий одяг" in sub_name_lower: return ["Куртка зимова", "Джинси класичні", "Сорочка бавовняна", "Спортивні штани Nike"]
    if "взуття" in sub_name_lower: return ["Кросівки бігові", "Туфлі класичні", "Чоботи зимові шкіряні", "Босоніжки літні"]
    
    # Хобі та спорт
    if "спорт" in sub_name_lower: return ["Гантелі розбірні", "Килимок для фітнесу", "Тренажер орбітрек", "Боксерські рукавиці"]
    if "вело" in sub_name_lower: return ["Велосипед гірський 29\"", "Шосейний велосипед", "Дитячий велосипед", "Шолом велосипедний"]
    
    # Fallback generic names
    base_noun = sub_name.split()[0].capitalize()
    return [
        f"{base_noun} відмінної якості",
        f"{base_noun} новий запакований",
        f"{base_noun} вживаний в хорошому стані",
        f"Оригінальний {base_noun.lower()} недорого"
    ]

def get_attributes(main_cat):
    attr = {}
    if main_cat in ["Авто", "Електроніка", "Дім і сад", "Мода і стиль", "Хобі, відпочинок і спорт", "Запчастини"]:
        attr["Стан"] = random.choice(["Новий", "Вживаний", "Ідеальний", "Задовільний"])
    if main_cat == "Авто":
        attr["Рік випуску"] = str(random.randint(2005, 2023))
        attr["Пробіг"] = f"{random.randint(50, 300)} тис. км"
    if main_cat == "Нерухомість":
        attr["Площа"] = f"{random.randint(30, 150)} м²"
        attr["Поверх"] = str(random.randint(1, 15))
    if main_cat == "Робота":
        attr["Тип зайнятості"] = random.choice(["Повна зайнятість", "Неповна зайнятість", "Віддалена робота"])
    return attr

def create_listings():
    seller = User.objects.first()
    if not seller:
        print("No users found in database to act as seller.")
        return

    main_categories = Category.objects.filter(parent__isnull=True)
    cities = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Тернопіль", "Івано-Франківськ"]

    total_created = 0

    for main_cat in main_categories:
        # Skip "Дитячий світ" as it was already populated
        if main_cat.name == "Дитячий світ":
            continue
            
        description_template = DESCRIPTIONS.get(main_cat.name, "Чудова пропозиція. Звертайтесь за деталями.")
        
        subcats = main_cat.children.all()
        for subcat in subcats:
            names = generate_names_for_subcategory(main_cat.name, subcat.name)
            
            # Create exactly len(names) items, usually 4
            for name in names:
                price = random.randint(100, 50000)
                is_free = (main_cat.name == "Віддам безкоштовно")
                is_exchange = (main_cat.name == "Обмін")
                if is_free or is_exchange:
                    price = 0
                
                # Uniqueness for slug allowing Cyrillic
                slug = slugify(name, allow_unicode=True) + "-" + str(uuid.uuid4())[:8]
                if not slug:
                    slug = "item-" + str(uuid.uuid4())[:12]
                
                Product.objects.create(
                    seller=seller,
                    category=subcat,
                    name=name,
                    slug=slug,
                    description=description_template,
                    city=random.choice(cities),
                    attributes=get_attributes(main_cat.name),
                    price=price,
                    is_negotiable=random.choice([True, False]),
                    is_free=is_free,
                    is_exchange=is_exchange,
                    stock=random.randint(1, 5),
                    is_active=True
                )
                total_created += 1
                
    print(f"Successfully created {total_created} listings across all subcategories.")

if __name__ == '__main__':
    create_listings()
