import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product

# Отримуємо всі товари, які не мають жодної прив'язаної фотографії
products_without_images = Product.objects.filter(images__isnull=True)
count = products_without_images.count()

print(f"Знайдено оголошень без фото: {count}")

if count > 0:
    products_without_images.delete()
    print("Всі оголошення без фото успішно видалені.")
else:
    print("Немає оголошень для видалення.")
