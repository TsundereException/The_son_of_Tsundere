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

# Clean up old products
print("Deleting existing products to start fresh...")
Product.objects.all().delete()
shutil.rmtree('dataset', ignore_errors=True)

# 1. Ensure mock users
usernames = ['oleksii_seller', 'maria_shop', 'ivan_store', 'olena_vintage', 'dmytro_trade', 'anna_best']
users = []
for un in usernames:
    u, created = User.objects.get_or_create(username=un, defaults={'email': f'{un}@example.com', 'first_name': un.split('_')[0].capitalize()})
    if created:
        u.set_password('password123')
        u.save()
    users.append(u)

cities = ['Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 'Івано-Франківськ', 'Тернопіль', 'Полтава']

prefixes = ["Продам", "Новий", "Фірмовий", "Оригінальний", "Чудовий", "Якісний", "Надійний", "Стильний"]
suffixes = ["в ідеальному стані", "недорого", "терміново", "з гарантією", "як новий", "в коробці", "для вас"]

categories = Category.objects.all()
leaf_categories = [c for c in categories if not c.children.exists()]

print(f"Found {len(leaf_categories)} leaf categories. Generating products...")

total_products = 0
for cat in leaf_categories:
    num_products = random.randint(2, 4)
    print(f"\n--- Generating {num_products} products for '{cat.name}' ---")
    
    # Download images for this category
    query = f"{cat.name} товар"
    try:
        downloader.download(query, limit=num_products * 2, output_dir='dataset', adult_filter_off=True, force_replace=False, timeout=5, verbose=False)
    except Exception as e:
        print(f"Failed to download images for {cat.name}: {e}")
        
    downloaded_dir = Path('dataset') / query
    images_available = []
    if downloaded_dir.exists():
        images_available = list(downloaded_dir.glob('*.jpg')) + list(downloaded_dir.glob('*.png')) + list(downloaded_dir.glob('*.jpeg'))
        random.shuffle(images_available)
    
    for _ in range(num_products):
        # Create realistic-sounding title
        clean_name = cat.name.split('/')[0].split(',')[0].strip()
        title = f"{random.choice(prefixes)} {clean_name.lower()} {random.choice(suffixes)}"
        desc = f"Продаю {clean_name.lower()} у зв'язку з непотрібністю. Стан видно на фото. Усі деталі за телефоном або в повідомленнях. Відправлю поштою."
        price = random.randint(100, 50000)
        
        slug_base = slugify(title, allow_unicode=True)
        slug = f"{slug_base}-{random.randint(100000, 999999)}"
        
        seller = random.choice(users)
        
        p = Product.objects.create(
            seller=seller,
            category=cat,
            name=title.capitalize(),
            slug=slug,
            description=desc,
            city=random.choice(cities),
            price=price,
            stock=1
        )
        
        # Attach images
        num_imgs = random.randint(1, 2)
        imgs_to_use = []
        for i in range(num_imgs):
            if images_available:
                imgs_to_use.append(images_available.pop())
                
        if imgs_to_use:
            for idx, img_path in enumerate(imgs_to_use):
                with open(img_path, 'rb') as f:
                    ProductImage.objects.create(
                        product=p,
                        image=File(f, name=f"{slug}_{idx}.jpg"),
                        is_main=(idx == 0)
                    )
        else:
            # Fallback if no images downloaded
            print(f"No image for product {p.name}")
            
        total_products += 1

print(f"\nFinished generating {total_products} mock products with unique Bing images!")
