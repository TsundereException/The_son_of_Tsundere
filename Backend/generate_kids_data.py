import os
import django
import random
import shutil
from pathlib import Path
from django.core.files import File
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category, Product, ProductImage
from apps.users.models import User
from bing_image_downloader import downloader

print("Starting generation for 'Дитячий світ' 30 items...")

# Clean up dataset folder
shutil.rmtree('dataset_kids', ignore_errors=True)

# 1. Ensure mock users
usernames = ['mama_sveta', 'olya_kids', 'maksym_toys', 'iryna_stroller', 'kateryna_baby', 'natali_shop']
users = []
for un in usernames:
    u, created = User.objects.get_or_create(username=un, defaults={'email': f'{un}@example.com', 'first_name': un.split('_')[0].capitalize()})
    if created:
        u.set_password('password123')
        u.save()
    users.append(u)

cities = ['Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 'Івано-Франківськ']

ITEMS = [
    # Дитячий одяг
    {"cat": "Дитячий одяг", "title": "Зимовий комбінезон Lenne 98р (хлопчик)", "desc": "Стан ідеальний, носили один сезон. Дуже теплий, не промокає. Колір синій з принтом. Всі замки працюють.", "price": 1800, "query": "Зимовий комбінезон Lenne 98"},
    {"cat": "Дитячий одяг", "title": "Набір бодіків Carter's 3-6 міс", "desc": "Новий набір, нам подарували, але не вгадали з розміром. 3 штуки, 100% бавовна, дуже приємні до тіла.", "price": 450, "query": "бодіки Carter's 3-6 міс"},
    {"cat": "Дитячий одяг", "title": "Куртка демісезонна Zara Kids 110р", "desc": "Стильна курточка на осінь/весну. Є невелика зачіпка на рукаві, в очі не кидається. Після однієї дитини.", "price": 750, "query": "Куртка демісезонна Zara Kids 110"},
    {"cat": "Дитячий одяг", "title": "Нарядна сукня H&M для дівчинки 122р", "desc": "Одягали рівно один раз на свято. Виглядає як нова. Пишна спідниця, дуже красива.", "price": 600, "query": "сукня H&M для дівчинки нарядна"},
    {"cat": "Дитячий одяг", "title": "Флісовий чоловічок Next 74р", "desc": "Зручний і теплий сліп, ідеально для прохолодних вечорів або як піддіва. Стан хороший, без плям.", "price": 250, "query": "Флісовий чоловічок Next 74"},
    
    # Дитяче взуття
    {"cat": "Дитяче взуття", "title": "Зимові термочеревики Superfit 25р", "desc": "Найкраще взуття на зиму! Ноги завжди сухі і теплі. Мембрана Gore-Tex. Є сліди носки на носочках.", "price": 1200, "query": "термочеревики Superfit 25"},
    {"cat": "Дитяче взуття", "title": "Дитячі кросівки Nike Air Max 28р", "desc": "Оригінал, купували в інтертопі. Дитина швидко виросла. Липучки тримають міцно.", "price": 950, "query": "кросівки Nike Air Max дитячі"},
    {"cat": "Дитяче взуття", "title": "Гумові чоботи Crocs 23-24р", "desc": "Оригінальні крокси. Ідеальні для калюж. Легенькі, дитині було дуже зручно.", "price": 500, "query": "Гумові чоботи Crocs дитячі жовті"},
    {"cat": "Дитяче взуття", "title": "Босоніжки ортопедичні Ecoby 26р", "desc": "Правильне взуття, твердий задник, супінатор. Носили в садочку. Стан на 4.", "price": 400, "query": "Босоніжки ортопедичні Ecoby"},
    {"cat": "Дитяче взуття", "title": "Пінетки UGG оригінал 18р", "desc": "Дуже милі і теплі пінетки для немовляти. Одягали тільки в колясці.", "price": 800, "query": "Пінетки UGG дитячі"},
    
    # Дитячі коляски
    {"cat": "Дитячі коляски", "title": "Коляска 2 в 1 Adamex Rimini", "desc": "Продаю нашу улюблену коляску. Повна комплектація (сумка, дощовик, москітка). Прохідна і м'яка. Текстиль в ідеалі, на рамі є пару подряпин від ліфта.", "price": 6500, "query": "Коляска 2 в 1 Adamex Rimini"},
    {"cat": "Дитячі коляски", "title": "Коляска для прогулянок Cybex Priam", "desc": "Шасі rose gold, текстиль чорний. Дуже маневрена і стильна. Віддаємо значно дешевше, ніж купували.", "price": 18000, "query": "Коляска Cybex Priam"},
    {"cat": "Дитячі коляски", "title": "Коляска-тростина Maclaren Techno XT", "desc": "Легка коляска для подорожей і міста. Складається однією рукою. Трохи вигорів капюшон, технічно справна.", "price": 2500, "query": "Коляска Maclaren Techno XT"},
    {"cat": "Дитячі коляски", "title": "Коляска 3 в 1 Anex m/type", "desc": "Після однієї дитини. У комплекті автокрісло (встановлюється на шасі). Супер амортизація.", "price": 15000, "query": "Коляска Anex m/type"},
    
    # Автокрісла
    {"cat": "Автокрісла", "title": "Автокрісло Maxi-Cosi CabrioFix", "desc": "Категорія 0+ (до 13 кг). Дуже зручне для немовлят, можна ставити на шасі коляски через адаптери. Без ДТП.", "price": 2800, "query": "Автокрісло Maxi-Cosi CabrioFix"},
    {"cat": "Автокрісла", "title": "Автокрісло Britax Römer King II", "desc": "Група 1 (9-18 кг). Кріплення штатним ременем, сидить намертво. Чохол випраний.", "price": 3500, "query": "Автокрісло Britax Römer King II"},
    {"cat": "Автокрісла", "title": "Автокрісло Cybex Pallas G i-Size", "desc": "Зі столиком безпеки, росте разом з дитиною (від 9 до 50 кг). Стан нового, користувались рідко.", "price": 7500, "query": "Автокрісло Cybex Pallas G i-Size"},
    {"cat": "Автокрісла", "title": "Бустер Graco", "desc": "Легкий бустер для старших діток (15-36 кг). З підстаканниками.", "price": 800, "query": "Бустер Graco дитячий"},
    
    # Дитячі меблі
    {"cat": "Дитячі меблі", "title": "Ліжечко Верес Соня ЛД1 з маятником", "desc": "Колір слонова кістка. Є маятник для заколисування та ящик для білизни. Матрац віддам у подарунок.", "price": 3200, "query": "Ліжечко Верес Соня ЛД1"},
    {"cat": "Дитячі меблі", "title": "Комод-пеленатор Angelo", "desc": "Дуже зручно переодягати дитину і зберігати речі. Пеленальний блок знімається, залишається просто комод.", "price": 2100, "query": "Комод-пеленатор Angelo"},
    {"cat": "Дитячі меблі", "title": "Стілець Chicco Polly Magic", "desc": "Можна використовувати від народження як шезлонг. Спинка розкладається. Чохол екошкіра, легко мити.", "price": 2800, "query": "Стілець для годування Chicco Polly"},
    {"cat": "Дитячі меблі", "title": "Парта-трансформер Mealux", "desc": "Росте разом з дитиною. Нахил стільниці регулюється. Чудовий варіант для школяра.", "price": 4500, "query": "Парта-трансформер Mealux"},
    
    # Іграшки
    {"cat": "Іграшки", "title": "Конструктор LEGO DUPLO Потяг із цифрами", "desc": "Всі деталі на місці, є коробка. Дитина дуже любила збирати. Чудово розвиває моторику.", "price": 450, "query": "LEGO DUPLO Потяг із цифрами"},
    {"cat": "Іграшки", "title": "Інтерактивна іграшка Furby Boom", "desc": "Оригінальний Фербі, реагує на дотики, музику, можна годувати через додаток. Стан ідеальний.", "price": 1200, "query": "Інтерактивна іграшка Furby Boom"},
    {"cat": "Іграшки", "title": "Розвиваючий килимок Tiny Love", "desc": "Багато іграшок, дзеркальце, шуршалки. Текстиль можна прати в машинці.", "price": 900, "query": "Розвиваючий килимок Tiny Love"},
    {"cat": "Іграшки", "title": "Трек Hot Wheels Охота на Акулу", "desc": "Повний комплект, машинка змінює колір у воді. Море емоцій для дитини.", "price": 1100, "query": "Трек Hot Wheels Акула"},
    
    # Транспорт для дітей
    {"cat": "Транспорт для дітей", "title": "Триколісний велосипед Doona Liki Trike S4", "desc": "Найкомпактніший складний велосипед! Поміщається в ручну поклажу в літаку. Є батьківська ручка.", "price": 7200, "query": "велосипед Doona Liki Trike"},
    {"cat": "Транспорт для дітей", "title": "Біговел Strider Sport 12", "desc": "Найкращий перший транспорт. Дуже легкий. Є подряпини на рамі, але технічно все супер.", "price": 3000, "query": "Біговел Strider Sport 12"},
    {"cat": "Транспорт для дітей", "title": "Самокат Micro Mini Deluxe", "desc": "Оригінальний швейцарський самокат. Плавно повертає, колеса світяться. Дитина їздила 2 сезони.", "price": 2000, "query": "Самокат Micro Mini Deluxe"},
    {"cat": "Транспорт для дітей", "title": "Електромобіль дитячий Mercedes G63 AMG", "desc": "Два мотори, акумулятор тримає годину. Є пульт радіокерування для батьків. Світяться фари, є музика.", "price": 6500, "query": "Електромобіль дитячий Mercedes G63"},
]

cats_cache = {c.name: c for c in Category.objects.filter(name__in=set(item['cat'] for item in ITEMS))}

created_count = 0
for idx, item in enumerate(ITEMS):
    cat_obj = cats_cache.get(item['cat'])
    if not cat_obj:
        print(f"Warning: Category '{item['cat']}' not found!")
        continue
        
    print(f"\n--- [{idx+1}/30] Generating '{item['title']}' ---")
    
    query = item['query']
    output_dir = 'dataset_kids'
    try:
        downloader.download(query, limit=2, output_dir=output_dir, adult_filter_off=True, force_replace=False, timeout=5, verbose=False)
    except Exception as e:
        print(f"Failed to download images for {item['title']}: {e}")
        
    downloaded_dir = Path(output_dir) / query
    images_available = []
    if downloaded_dir.exists():
        images_available = list(downloaded_dir.glob('*.jpg')) + list(downloaded_dir.glob('*.png')) + list(downloaded_dir.glob('*.jpeg'))
        random.shuffle(images_available)
        
    slug_base = slugify(item['title'], allow_unicode=True)
    slug = f"{slug_base}-{random.randint(100000, 999999)}"
    
    seller = random.choice(users)
    
    p = Product.objects.create(
        seller=seller,
        category=cat_obj,
        name=item['title'],
        slug=slug,
        description=item['desc'],
        city=random.choice(cities),
        price=item['price'],
        stock=1
    )
    
    if images_available:
        # Take up to 2 images
        for i, img_path in enumerate(images_available[:2]):
            with open(img_path, 'rb') as f:
                ProductImage.objects.create(
                    product=p,
                    image=File(f, name=f"{slug}_{i}.jpg"),
                    is_main=(i == 0)
                )
    else:
        print(f"No image downloaded for {p.name}")
        
    created_count += 1

print(f"\nFinished generating {created_count} products for Дитячий світ!")
