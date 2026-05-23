import os, sys, django, urllib.request, uuid, shutil, random
from pathlib import Path
from decimal import Decimal
from io import BytesIO

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
django.setup()

from django.core.files.base import ContentFile
from django.utils.text import slugify
from apps.users.models import User, SiteSettings
from apps.products.models import Category, Product, ProductImage, Review
from apps.listings.models import Listing
from apps.orders.models import Order, OrderItem

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def download_image(url, filename):
    print(f"    Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        return ContentFile(data, name=filename)
    except Exception as e:
        print(f"    WARNING: Failed to download {url}: {e}")
        return None

def make_slug(name):
    s = slugify(name, allow_unicode=True)
    if not s:
        s = 'item'
    return f"{s}-{uuid.uuid4().hex[:6]}"

# ---------------------------------------------------------------------------
# Clear existing data (except superuser)
# ---------------------------------------------------------------------------
print("=" * 60)
print("  SEEDING DATABASE")
print("=" * 60)
print()

print("[1/8] Clearing old data...")
OrderItem.objects.all().delete()
Order.objects.all().delete()
Review.objects.all().delete()
ProductImage.objects.all().delete()
Product.objects.all().delete()
Listing.objects.all().delete()
Category.objects.all().delete()
User.objects.filter(is_superuser=False).delete()

media_root = BASE_DIR / 'media'
if media_root.exists():
    shutil.rmtree(media_root)
media_root.mkdir(exist_ok=True)
(media_root / 'products').mkdir(exist_ok=True)
(media_root / 'avatars').mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Create SiteSettings
# ---------------------------------------------------------------------------
print("[2/8] Site settings...")
SiteSettings.load()

# ---------------------------------------------------------------------------
# Create Users (sellers + buyers)
# ---------------------------------------------------------------------------
print("[3/8] Creating users...")

sellers_data = [
    {
        'username': 'techstore_ua',
        'email': 'techstore@example.com',
        'first_name': 'TechStore',
        'last_name': 'UA',
        'role': 'seller',
        'phone': '+380501234567',
        'city': 'Київ',
        'bio': 'Офіційний дилер Apple, Samsung, Xiaomi в Україні. Працюємо з 2018 року. Гарантія на всю продукцію.',
    },
    {
        'username': 'gadget_hub',
        'email': 'gadget@example.com',
        'first_name': 'Gadget',
        'last_name': 'Hub',
        'role': 'seller',
        'phone': '+380672345678',
        'city': 'Львів',
        'bio': 'Великий вибір гаджетів та аксесуарів. Швидка доставка по всій Україні.',
    },
    {
        'username': 'electroworld',
        'email': 'electro@example.com',
        'first_name': 'Electro',
        'last_name': 'World',
        'role': 'seller',
        'phone': '+380933456789',
        'city': 'Одеса',
        'bio': 'Побутова та комп\'ютерна техніка. Сертифікований продавець. Працюємо з юридичними особами.',
    },
    {
        'username': 'smart_devices',
        'email': 'smart@example.com',
        'first_name': 'Smart',
        'last_name': 'Devices',
        'role': 'seller',
        'phone': '+380664567890',
        'city': 'Харків',
        'bio': 'Розумні гаджети для дому та офісу. IoT, smart home, носима електроніка.',
    },
]

buyers_data = [
    {
        'username': 'ivan_kovalenko',
        'email': 'ivan@example.com',
        'first_name': 'Іван',
        'last_name': 'Коваленко',
        'role': 'buyer',
        'phone': '+380505678901',
        'city': 'Дніпро',
        'bio': '',
    },
    {
        'username': 'olena_shevchenko',
        'email': 'olena@example.com',
        'first_name': 'Олена',
        'last_name': 'Шевченко',
        'role': 'buyer',
        'phone': '+380676789012',
        'city': 'Вінниця',
        'bio': '',
    },
    {
        'username': 'dmytro_bondar',
        'email': 'dmytro@example.com',
        'first_name': 'Дмитро',
        'last_name': 'Бондар',
        'role': 'buyer',
        'phone': '+380937890123',
        'city': 'Запоріжжя',
        'bio': '',
    },
    {
        'username': 'anna_lysenko',
        'email': 'anna@example.com',
        'first_name': 'Анна',
        'last_name': 'Лисенко',
        'role': 'buyer',
        'phone': '+380668901234',
        'city': 'Чернігів',
        'bio': '',
    },
]

sellers = []
for sd in sellers_data:
    u = User.objects.create_user(
        username=sd['username'],
        email=sd['email'],
        password='seller1234',
        first_name=sd['first_name'],
        last_name=sd['last_name'],
        role=sd['role'],
        phone=sd['phone'],
        city=sd['city'],
        bio=sd['bio'],
    )
    sellers.append(u)
    print(f"  + Seller: {u.username}")

buyers = []
for bd in buyers_data:
    u = User.objects.create_user(
        username=bd['username'],
        email=bd['email'],
        password='buyer1234',
        first_name=bd['first_name'],
        last_name=bd['last_name'],
        role=bd['role'],
        phone=bd['phone'],
        city=bd['city'],
        bio=bd['bio'],
    )
    buyers.append(u)
    print(f"  + Buyer: {u.username}")

# ---------------------------------------------------------------------------
# Create Categories
# ---------------------------------------------------------------------------
print("[4/8] Creating categories...")

categories_data = [
    {'name': 'Смартфони',       'slug': 'smartphones'},
    {'name': 'Ноутбуки',        'slug': 'laptops'},
    {'name': 'Камери',          'slug': 'cameras'},
    {'name': 'Годинники',       'slug': 'watches'},
    {'name': 'Телевізори',      'slug': 'tvs'},
    {'name': 'Аксесуари',       'slug': 'accessories'},
]

categories = {}
for cd in categories_data:
    cat = Category.objects.create(name=cd['name'], slug=cd['slug'])
    categories[cd['slug']] = cat
    print(f"  + Category: {cat.name} ({cat.slug})")

# ---------------------------------------------------------------------------
# Create Products with real images
# ---------------------------------------------------------------------------
print("[5/8] Creating products with real images...")

products_data = [
    # === SMARTPHONES ===
    {
        'name': 'iPhone 15 Pro Max 256GB',
        'category': 'smartphones',
        'seller_idx': 0,
        'price': Decimal('52999.00'),
        'stock': 12,
        'description': (
            'Apple iPhone 15 Pro Max з дисплеєм Super Retina XDR 6.7", '
            'чіп A17 Pro, потрійна камера 48 МП з 5x оптичним зумом. '
            'Титанієвий корпус, USB-C, до 29 годин відтворення відео. '
            'Колір: натуральний титан.'
        ),
        'attributes': {
            'Бренд': 'Apple',
            'Дисплей': '6.7" Super Retina XDR',
            'Процесор': 'A17 Pro',
            'Оперативна пам\'ять': '8 ГБ',
            'Пам\'ять': '256 ГБ',
            'Камера': '48+12+12 МП',
            'Батарея': '4441 мАг',
            'ОС': 'iOS 17',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800', 'iphone15pro_1.jpg'),
            ('https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800', 'iphone15pro_2.jpg'),
        ],
    },
    {
        'name': 'Samsung Galaxy S24 Ultra',
        'category': 'smartphones',
        'seller_idx': 1,
        'price': Decimal('49999.00'),
        'stock': 8,
        'description': (
            'Флагман Samsung з чіпом Snapdragon 8 Gen 3, дисплеєм Dynamic AMOLED 2X 6.8", '
            'вбудованим S Pen та камерою 200 МП. AI-функції Galaxy AI для '
            'перекладів в реальному часі, редагування фото та багато іншого.'
        ),
        'attributes': {
            'Бренд': 'Samsung',
            'Дисплей': '6.8" Dynamic AMOLED 2X',
            'Процесор': 'Snapdragon 8 Gen 3',
            'Оперативна пам\'ять': '12 ГБ',
            'Пам\'ять': '256 ГБ',
            'Камера': '200+50+12+10 МП',
            'Батарея': '5000 мАг',
            'ОС': 'Android 14 / One UI 6.1',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800', 'galaxy_s24_1.jpg'),
            ('https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800', 'galaxy_s24_2.jpg'),
        ],
    },
    {
        'name': 'Xiaomi 14 Pro',
        'category': 'smartphones',
        'seller_idx': 2,
        'price': Decimal('27999.00'),
        'stock': 15,
        'description': (
            'Xiaomi 14 Pro з оптикою Leica, дисплеєм 2K LTPO AMOLED 6.73", '
            'чіпом Snapdragon 8 Gen 3, швидкою зарядкою 120W. '
            'Камера 50 МП з оптикою Leica Summilux. Захист IP68.'
        ),
        'attributes': {
            'Бренд': 'Xiaomi',
            'Дисплей': '6.73" 2K LTPO AMOLED',
            'Процесор': 'Snapdragon 8 Gen 3',
            'Оперативна пам\'ять': '12 ГБ',
            'Пам\'ять': '256 ГБ',
            'Камера': '50+50+50 МП (Leica)',
            'Батарея': '4880 мАг',
            'ОС': 'Android 14 / HyperOS',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800', 'xiaomi14_1.jpg'),
            ('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800', 'xiaomi14_2.jpg'),
        ],
    },

    # === LAPTOPS ===
    {
        'name': 'MacBook Pro 14" M3 Pro',
        'category': 'laptops',
        'seller_idx': 0,
        'price': Decimal('84999.00'),
        'stock': 5,
        'description': (
            'Apple MacBook Pro 14 дюймів з чіпом M3 Pro. 18 ГБ уніфікованої пам\'яті, '
            'SSD 512 ГБ. Дисплей Liquid Retina XDR з ProMotion 120 Гц. '
            'До 17 годин роботи від батареї. 3 порти Thunderbolt 4, HDMI, SDXC.'
        ),
        'attributes': {
            'Бренд': 'Apple',
            'Дисплей': '14.2" Liquid Retina XDR',
            'Процесор': 'Apple M3 Pro (11-core CPU, 14-core GPU)',
            'Оперативна пам\'ять': '18 ГБ',
            'Пам\'ять': '512 ГБ SSD',
            'Батарея': 'до 17 годин',
            'Вага': '1.61 кг',
            'ОС': 'macOS Sonoma',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800', 'macbook_pro_1.jpg'),
            ('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800', 'macbook_pro_2.jpg'),
        ],
    },
    {
        'name': 'ASUS ROG Strix G16 (2024)',
        'category': 'laptops',
        'seller_idx': 2,
        'price': Decimal('62999.00'),
        'stock': 7,
        'description': (
            'Ігровий ноутбук ASUS ROG Strix G16 з процесором Intel Core i9-14900HX, '
            'відеокартою NVIDIA RTX 4070, дисплеєм 16" QHD+ 240Hz. '
            '32 ГБ DDR5, 1 ТБ SSD. RGB-підсвітка клавіатури, Wi-Fi 6E.'
        ),
        'attributes': {
            'Бренд': 'ASUS',
            'Дисплей': '16" QHD+ 240Hz IPS',
            'Процесор': 'Intel Core i9-14900HX',
            'Відеокарта': 'NVIDIA RTX 4070 8GB',
            'Оперативна пам\'ять': '32 ГБ DDR5',
            'Пам\'ять': '1 ТБ SSD NVMe',
            'Вага': '2.5 кг',
            'ОС': 'Windows 11 Home',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800', 'rog_strix_1.jpg'),
            ('https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800', 'rog_strix_2.jpg'),
        ],
    },
    {
        'name': 'Lenovo ThinkPad X1 Carbon Gen 11',
        'category': 'laptops',
        'seller_idx': 3,
        'price': Decimal('58999.00'),
        'stock': 4,
        'description': (
            'Бізнес-ноутбук преміум-класу. Intel Core i7-1365U, 16 ГБ LPDDR5, '
            '512 ГБ SSD. Дисплей 14" 2.8K OLED. Вага лише 1.12 кг. '
            'Захист MIL-STD-810H, сканер відбитків, шторка веб-камери, Wi-Fi 6E.'
        ),
        'attributes': {
            'Бренд': 'Lenovo',
            'Дисплей': '14" 2.8K OLED',
            'Процесор': 'Intel Core i7-1365U',
            'Оперативна пам\'ять': '16 ГБ LPDDR5',
            'Пам\'ять': '512 ГБ SSD',
            'Вага': '1.12 кг',
            'Батарея': 'до 15 годин',
            'ОС': 'Windows 11 Pro',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800', 'thinkpad_1.jpg'),
            ('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800', 'thinkpad_2.jpg'),
        ],
    },

    # === CAMERAS ===
    {
        'name': 'Sony Alpha A7 IV',
        'category': 'cameras',
        'seller_idx': 1,
        'price': Decimal('72999.00'),
        'stock': 3,
        'description': (
            'Повнокадрова бездзеркальна камера Sony A7 IV. Матриця 33 МП Exmor R CMOS, '
            'процесор BIONZ XR, 4K 60p відео, 759 точок автофокусу. '
            'Діапазон ISO 100-51200. Стабілізація 5.5 стопів.'
        ),
        'attributes': {
            'Бренд': 'Sony',
            'Матриця': '33 MP Full-Frame Exmor R CMOS',
            'Процесор': 'BIONZ XR',
            'Відео': '4K 60fps',
            'Автофокус': '759 точок',
            'ISO': '100-51200',
            'Стабілізація': '5.5 стопів IBIS',
            'Байонет': 'Sony E-mount',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', 'sony_a7iv_1.jpg'),
            ('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800', 'sony_a7iv_2.jpg'),
        ],
    },
    {
        'name': 'Canon EOS R6 Mark II',
        'category': 'cameras',
        'seller_idx': 3,
        'price': Decimal('79999.00'),
        'stock': 2,
        'description': (
            'Canon EOS R6 Mark II з матрицею 24.2 МП, процесором DIGIC X, '
            'швидкістю зйомки до 40 к/с з електронним затвором. '
            '4K 60p відео, Dual Pixel CMOS AF II. Стабілізація до 8 стопів.'
        ),
        'attributes': {
            'Бренд': 'Canon',
            'Матриця': '24.2 MP Full-Frame CMOS',
            'Процесор': 'DIGIC X',
            'Відео': '4K 60fps, 6K RAW',
            'Автофокус': 'Dual Pixel CMOS AF II',
            'ISO': '100-102400',
            'Серійна зйомка': 'до 40 fps',
            'Байонет': 'Canon RF',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1606986628253-49e5a1b5e388?auto=format&fit=crop&q=80&w=800', 'canon_r6_1.jpg'),
            ('https://images.unsplash.com/photo-1581591524425-c7e0978cced5?auto=format&fit=crop&q=80&w=800', 'canon_r6_2.jpg'),
        ],
    },

    # === WATCHES ===
    {
        'name': 'Apple Watch Ultra 2',
        'category': 'watches',
        'seller_idx': 0,
        'price': Decimal('31999.00'),
        'stock': 10,
        'description': (
            'Найтриваліший та найфункціональніший Apple Watch. '
            'Титанієвий корпус 49 мм, дисплей до 3000 ніт, GPS L1+L5, '
            'глибина занурення до 40 м. Чіп S9 SiP, подвійний динамік. '
            'До 36 годин роботи.'
        ),
        'attributes': {
            'Бренд': 'Apple',
            'Дисплей': '49mm LTPO OLED (3000 nits)',
            'Процесор': 'S9 SiP',
            'Матеріал': 'Титан',
            'Захист від води': '100m (WR100), EN13319',
            'GPS': 'L1 + L5',
            'Батарея': 'до 36 годин',
            'ОС': 'watchOS 10',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=800', 'apple_watch_ultra_1.jpg'),
            ('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', 'apple_watch_ultra_2.jpg'),
        ],
    },
    {
        'name': 'Samsung Galaxy Watch 6 Classic',
        'category': 'watches',
        'seller_idx': 1,
        'price': Decimal('14999.00'),
        'stock': 14,
        'description': (
            'Класичний смарт-годинник з фізичним безелем, що обертається. '
            'Super AMOLED 1.47", сапфірове скло, Exynos W930, BIA-датчик складу тіла. '
            'GPS, NFC, Bluetooth 5.3. До 40 годин роботи.'
        ),
        'attributes': {
            'Бренд': 'Samsung',
            'Дисплей': '1.47" Super AMOLED',
            'Процесор': 'Exynos W930',
            'Матеріал': 'Нержавіюча сталь',
            'Захист від води': '5ATM + IP68',
            'NFC': 'Так',
            'Батарея': 'до 40 годин',
            'ОС': 'Wear OS 4 / One UI Watch 5',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1546868871-af0de0ae72be?auto=format&fit=crop&q=80&w=800', 'galaxy_watch6_1.jpg'),
            ('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800', 'galaxy_watch6_2.jpg'),
        ],
    },

    # === TVs ===
    {
        'name': 'LG OLED evo C3 55"',
        'category': 'tvs',
        'seller_idx': 2,
        'price': Decimal('42999.00'),
        'stock': 6,
        'description': (
            'LG OLED evo C3 55 дюймів з процесором a9 Gen6 AI. '
            'Ідеальний чорний, нескінченний контраст, Dolby Vision IQ та Dolby Atmos. '
            '4 порти HDMI 2.1 для ігор 4K@120Hz з VRR, ALLM, G-Sync та FreeSync.'
        ),
        'attributes': {
            'Бренд': 'LG',
            'Дисплей': '55" OLED evo',
            'Роздільна здатність': '4K (3840x2160)',
            'Процесор': 'a9 Gen6 AI Processor 4K',
            'HDR': 'Dolby Vision IQ, HDR10, HLG',
            'Оновлення екрану': '120Hz',
            'HDMI': '4x HDMI 2.1',
            'Smart TV': 'webOS 23',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800', 'lg_oled_c3_1.jpg'),
            ('https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=800', 'lg_oled_c3_2.jpg'),
        ],
    },
    {
        'name': 'Samsung QN90C Neo QLED 65"',
        'category': 'tvs',
        'seller_idx': 3,
        'price': Decimal('54999.00'),
        'stock': 4,
        'description': (
            'Samsung Neo QLED 65 дюймів з технологією Quantum Matrix та Mini LED. '
            'Процесор Neural Quantum 4K, антивідблискове покриття, '
            'Object Tracking Sound+, 4x HDMI 2.1. Ідеальний для ігор та кіно.'
        ),
        'attributes': {
            'Бренд': 'Samsung',
            'Дисплей': '65" Neo QLED (Mini LED)',
            'Роздільна здатність': '4K (3840x2160)',
            'Процесор': 'Neural Quantum Processor 4K',
            'HDR': 'Quantum HDR 32x',
            'Оновлення екрану': '120Hz',
            'HDMI': '4x HDMI 2.1',
            'Smart TV': 'Tizen OS',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800', 'samsung_qn90c_1.jpg'),
            ('https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?auto=format&fit=crop&q=80&w=800', 'samsung_qn90c_2.jpg'),
        ],
    },

    # === ACCESSORIES ===
    {
        'name': 'AirPods Pro 2 (USB-C)',
        'category': 'accessories',
        'seller_idx': 0,
        'price': Decimal('9499.00'),
        'stock': 25,
        'description': (
            'Apple AirPods Pro 2 з активним шумозаглушенням до 2x краще, '
            'адаптивним режимом прозорості, персоналізованим просторовим аудіо. '
            'Чіп H2, USB-C зарядка, захист IP54. До 6 годин прослуховування.'
        ),
        'attributes': {
            'Бренд': 'Apple',
            'Тип': 'TWS навушники',
            'Процесор': 'Apple H2',
            'Шумозаглушення': 'Так (ANC)',
            'Захист від води': 'IP54',
            'Батарея': '6 год (30 год з кейсом)',
            'Підключення': 'Bluetooth 5.3',
            'Зарядка': 'USB-C, MagSafe, Qi',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800', 'airpods_pro2_1.jpg'),
            ('https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800', 'airpods_pro2_2.jpg'),
        ],
    },
    {
        'name': 'Sony WH-1000XM5',
        'category': 'accessories',
        'seller_idx': 1,
        'price': Decimal('11999.00'),
        'stock': 18,
        'description': (
            'Флагманські бездротові навушники Sony з найкращим шумозаглушенням '
            'у своєму класі. 30 мм драйвери, LDAC, 30 годин роботи, '
            'мультиточкове підключення. Вага лише 250 г.'
        ),
        'attributes': {
            'Бренд': 'Sony',
            'Тип': 'Повнорозмірні навушники',
            'Драйвери': '30мм',
            'Шумозаглушення': 'Так (8 мікрофонів)',
            'Батарея': '30 годин',
            'Кодеки': 'LDAC, AAC, SBC',
            'Вага': '250 г',
            'Підключення': 'Bluetooth 5.2, 3.5mm',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', 'sony_wh1000xm5_1.jpg'),
            ('https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800', 'sony_wh1000xm5_2.jpg'),
        ],
    },
    {
        'name': 'Logitech MX Master 3S',
        'category': 'accessories',
        'seller_idx': 3,
        'price': Decimal('3799.00'),
        'stock': 30,
        'description': (
            'Професійна бездротова миша Logitech MX Master 3S. Тихий клік, '
            'датчик 8000 DPI, MagSpeed скролінг, ергономічний дизайн. '
            'Підключення через Bluetooth або Logi Bolt. '
            'Працює на будь-якій поверхні, навіть на склі.'
        ),
        'attributes': {
            'Бренд': 'Logitech',
            'Тип': 'Бездротова миша',
            'Сенсор': '8000 DPI',
            'Підключення': 'Bluetooth, Logi Bolt USB',
            'Батарея': 'до 70 днів (зарядка USB-C)',
            'Вага': '141 г',
            'Сумісність': 'Windows, macOS, Linux, iPadOS',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800', 'mx_master3s_1.jpg'),
            ('https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800', 'mx_master3s_2.jpg'),
        ],
    },

    # === More products for variety ===
    {
        'name': 'PlayStation 5 Slim',
        'category': 'accessories',
        'seller_idx': 2,
        'price': Decimal('22999.00'),
        'stock': 9,
        'description': (
            'Sony PlayStation 5 Slim з приводом Blu-Ray. Компактніший дизайн, '
            '1 ТБ SSD, AMD Zen 2, RDNA 2 GPU, 4K@120Hz, Ray Tracing. '
            'DualSense контролер в комплекті. Зворотна сумісність з іграми PS4.'
        ),
        'attributes': {
            'Бренд': 'Sony',
            'Тип': 'Ігрова консоль',
            'Пам\'ять': '1 ТБ SSD',
            'Процесор': 'AMD Zen 2 (8 cores)',
            'Відео': 'AMD RDNA 2 (10.28 TFLOPS)',
            'Роздільна здатність': 'до 4K@120Hz',
            'Ray Tracing': 'Так',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800', 'ps5_slim_1.jpg'),
            ('https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?auto=format&fit=crop&q=80&w=800', 'ps5_slim_2.jpg'),
        ],
    },
    {
        'name': 'iPad Air M2 11"',
        'category': 'smartphones',
        'seller_idx': 0,
        'price': Decimal('28999.00'),
        'stock': 11,
        'description': (
            'Apple iPad Air з чіпом M2, дисплеєм Liquid Retina 11", '
            'підтримкою Apple Pencil Pro та Magic Keyboard. '
            'Камера 12 МП, Wi-Fi 6E, 5G. Ідеальний для творчості та навчання.'
        ),
        'attributes': {
            'Бренд': 'Apple',
            'Дисплей': '11" Liquid Retina',
            'Процесор': 'Apple M2 (8-core CPU, 10-core GPU)',
            'Оперативна пам\'ять': '8 ГБ',
            'Пам\'ять': '128 ГБ',
            'Камера': '12 МП',
            'Вага': '462 г',
            'ОС': 'iPadOS 17',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800', 'ipad_air_m2_1.jpg'),
            ('https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&q=80&w=800', 'ipad_air_m2_2.jpg'),
        ],
    },
    {
        'name': 'DJI Mini 4 Pro',
        'category': 'cameras',
        'seller_idx': 1,
        'price': Decimal('34999.00'),
        'stock': 5,
        'description': (
            'Компактний дрон з камерою 4K/100fps, матриця 1/1.3" CMOS 48 МП. '
            'Омнідирекційна система ухилення від перешкод. '
            'Час польоту до 34 хвилин. Вага менше 249 г.'
        ),
        'attributes': {
            'Бренд': 'DJI',
            'Камера': '48 МП, 1/1.3" CMOS',
            'Відео': '4K/100fps, HDR',
            'Час польоту': 'до 34 хвилин',
            'Дальність': 'до 20 км',
            'Вага': '249 г',
            'Датчики': 'Омнідирекційна система',
            'Стан': 'Нове',
        },
        'images': [
            ('https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800', 'dji_mini4_1.jpg'),
            ('https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800', 'dji_mini4_2.jpg'),
        ],
    },
]

products = []
for pd_item in products_data:
    seller_obj = sellers[pd_item['seller_idx']]
    product = Product.objects.create(
        seller=seller_obj,
        category=categories[pd_item['category']],
        name=pd_item['name'],
        slug=make_slug(pd_item['name']),
        description=pd_item['description'],
        attributes=pd_item['attributes'],
        price=pd_item['price'],
        stock=pd_item['stock'],
        city=seller_obj.city,
        is_active=True,
    )

    for i, (img_url, img_filename) in enumerate(pd_item['images']):
        content_file = download_image(img_url, img_filename)
        if content_file:
            pi = ProductImage(product=product, is_main=(i == 0))
            pi.image.save(img_filename, content_file, save=True)

    products.append(product)
    print(f"  + Product: {product.name} ({product.price} UAH)")

# ---------------------------------------------------------------------------
# Create Listings
# ---------------------------------------------------------------------------
print("[6/8] Creating listings...")

listings_data = [
    {
        'title': 'iPhone 13 Pro 128GB - б/в, ідеальний стан',
        'category': 'smartphones',
        'seller_idx': 0,
        'price': Decimal('24500.00'),
        'city': 'Київ',
        'description': (
            'Продаю iPhone 13 Pro 128 ГБ, колір Graphite. Користувався 1.5 роки, '
            'завжди в чохлі та зі склом. Батарея 89%. Вся комплектація. '
            'Купував в офіційному магазині, є чек.'
        ),
        'photo': 'https://images.unsplash.com/photo-1632633173522-47456de71b76?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'MacBook Air M1 2020 - як новий',
        'category': 'laptops',
        'seller_idx': 1,
        'price': Decimal('26000.00'),
        'city': 'Львів',
        'description': (
            'MacBook Air на чіпі M1, 8/256 ГБ. Цикл зарядки лише 87. '
            'Екран без подряпин, корпус ідеальний. Зарядка оригінал в комплекті. '
            'Причина продажу - перейшов на Pro.'
        ),
        'photo': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'Sony WF-1000XM4 - бездротові навушники',
        'category': 'accessories',
        'seller_idx': 2,
        'price': Decimal('5500.00'),
        'city': 'Одеса',
        'description': (
            'Продаю навушники Sony WF-1000XM4 в чорному кольорі. '
            'Відмінне шумозаглушення, LDAC, до 8 годин роботи. '
            'Стан відмінний, носив у чохлі. Вся комплектація.'
        ),
        'photo': 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'Samsung Galaxy Tab S9 FE - планшет',
        'category': 'smartphones',
        'seller_idx': 3,
        'price': Decimal('14500.00'),
        'city': 'Харків',
        'description': (
            'Планшет Samsung Galaxy Tab S9 FE 128 ГБ, Wi-Fi. '
            'Дисплей 10.9", S Pen в комплекті. Купував 3 місяці тому, '
            'майже не користувався. Є коробка та документи.'
        ),
        'photo': 'https://images.unsplash.com/photo-1683103403569-805bf777e3fb?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'Apple Watch Series 8 45mm',
        'category': 'watches',
        'seller_idx': 0,
        'price': Decimal('10500.00'),
        'city': 'Київ',
        'description': (
            'Продаю Apple Watch Series 8 45mm Midnight Aluminum. '
            'Стан 9/10, є кілька дрібних подряпин на склі. '
            'Батарея 92%. У комплекті зарядка та 2 ремінці.'
        ),
        'photo': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'GoPro HERO 11 Black',
        'category': 'cameras',
        'seller_idx': 1,
        'price': Decimal('11000.00'),
        'city': 'Львів',
        'description': (
            'Екшн-камера GoPro HERO 11 Black. Використовував у 2 відпустках. '
            'Знімає 5.3K відео, стабілізація HyperSmooth 5.0. '
            'Додаю 2 додаткові батареї та кріплення на голову.'
        ),
        'photo': 'https://images.unsplash.com/photo-1558066518-8f8d68962002?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'Монітор Dell UltraSharp 27" 4K',
        'category': 'tvs',
        'seller_idx': 2,
        'price': Decimal('15900.00'),
        'city': 'Одеса',
        'description': (
            'Продаю монітор Dell UltraSharp U2723QE. 4K, IPS Black, HDR. '
            'Ідеальний для роботи з кольором. Без битих пікселів. '
            'Ще на гарантії (залишилось 1.5 роки).'
        ),
        'photo': 'https://images.unsplash.com/photo-1527443154391-507e9dc6cbe5?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
    {
        'title': 'Бездротова клавіатура Keychron K2',
        'category': 'accessories',
        'seller_idx': 3,
        'price': Decimal('3200.00'),
        'city': 'Харків',
        'description': (
            'Механічна клавіатура Keychron K2 (v2), червоні свічі. '
            'Біла підсвітка, розкладка ANSI. Стан ідеальний, клавіші не затерті. '
            'Bluetooth або кабельне підключення.'
        ),
        'photo': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
        'status': 'active',
    },
]

listings = []
for ld in listings_data:
    listing = Listing.objects.create(
        seller=sellers[ld['seller_idx']],
        category=categories[ld['category']],
        title=ld['title'],
        description=ld['description'],
        price=ld['price'],
        photo=ld['photo'],
        city=ld['city'],
        status=ld['status'],
    )
    listings.append(listing)
    print(f"  + Listing: {listing.title}")

# ---------------------------------------------------------------------------
# Create Reviews
# ---------------------------------------------------------------------------
print("[7/8] Creating reviews...")

reviews_data = [
    # Positive reviews
    "Відмінний товар! Все відповідає опису, доставка швидка. Рекомендую продавця.",
    "Дуже задоволений покупкою. Якість на висоті. Буду замовляти ще.",
    "Все супер, працює як годинник. Продавець швидко відповів на всі питання.",
    "Класний девайс, давно про такий мріяв. Рекомендую!",
    "Отримав на наступний день після замовлення. Упаковка надійна, товар цілий.",
    # Neutral/Mixed
    "Товар непоганий, але коробка була трохи пом'ята. Сам пристрій працює нормально.",
    "Все добре, але ціна трохи завищена, як на мене.",
    "Звичайний товар за свої гроші. Нічого особливого, але працює.",
    # Negative
    "Розчарований. Батарея тримає гірше, ніж очікував.",
    "Не підійшов розмір, довелося робити повернення."
]

for product in products:
    num_reviews = random.randint(2, 4)
    buyers_for_reviews = random.sample(buyers, num_reviews)
    
    for buyer in buyers_for_reviews:
        # Give mostly 4-5 stars, occasionally 3 or less
        rating_choices = [5, 5, 5, 4, 4, 4, 3, 2, 1]
        rating = random.choice(rating_choices)
        
        if rating >= 4:
            comment = random.choice(reviews_data[0:5])
        elif rating == 3:
            comment = random.choice(reviews_data[5:8])
        else:
            comment = random.choice(reviews_data[8:])
            
        Review.objects.create(
            product=product,
            buyer=buyer,
            rating=rating,
            comment=comment
        )
    print(f"  + Added {num_reviews} reviews for {product.name}")

# ---------------------------------------------------------------------------
# Create Orders
# ---------------------------------------------------------------------------
print("[8/8] Creating orders...")

order_addresses = [
    "м. Київ, вул. Хрещатик 22, кв 45",
    "м. Львів, вул. Городоцька 112, кв 12",
    "м. Одеса, вул. Дерибасівська 5",
    "м. Дніпро, пр. Яворницького 55, кв 3",
]
order_comments = [
    "Зателефонуйте перед доставкою.",
    "Подарунок, запакуйте гарно будь ласка.",
    "Без решти, оплачу карткою кур'єру.",
    "",
]
statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

for i in range(6):
    buyer = random.choice(buyers)
    address = random.choice(order_addresses)
    comment = random.choice(order_comments)
    status = random.choice(statuses)
    
    # Pick 1-3 random products
    order_products = random.sample(products, random.randint(1, 3))
    
    total = sum(p.price for p in order_products)
    
    order = Order.objects.create(
        buyer=buyer,
        status=status,
        total=total,
        address=address,
        comment=comment
    )
    
    for p in order_products:
        OrderItem.objects.create(
            order=order,
            product=p,
            quantity=1,
            price=p.price
        )
        
    print(f"  + Order #{order.id} for {buyer.username} ({status}) - {total} UAH")

print("\n" + "=" * 60)
print("  DATABASE SEEDED SUCCESSFULLY!")
print("=" * 60)
print(f"  Products: {Product.objects.count()}")
print(f"  Images: {ProductImage.objects.count()}")
print(f"  Listings: {Listing.objects.count()}")
print(f"  Reviews: {Review.objects.count()}")
print(f"  Orders: {Order.objects.count()}")
print(f"  Users: {User.objects.filter(is_superuser=False).count()}")
print("=" * 60)
