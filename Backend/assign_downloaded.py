import os, django, shutil
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from apps.products.models import Product, ProductImage
from django.core.files import File

def assign_images():
    products = Product.objects.all()
    
    # First, clear all existing product images to ensure we start clean
    ProductImage.objects.all().delete()
    
    # Also delete existing files in media/products to avoid clutter
    media_products_dir = os.path.join('media', 'products')
    if os.path.exists(media_products_dir):
        for f in os.listdir(media_products_dir):
            file_path = os.path.join(media_products_dir, f)
            if os.path.isfile(file_path):
                os.remove(file_path)
    
    temp_dir = 'temp_images'
    assigned_count = 0
    for p in products:
        assigned = False
        for i in range(1, 4):
            for ext in ['.jpg', '.png', '.webp', '.jpeg']:
                filename = f"{p.id}_{i}{ext}"
                filepath = os.path.join(temp_dir, filename)
                if os.path.exists(filepath):
                    with open(filepath, 'rb') as f:
                        prod_img = ProductImage(product=p)
                        prod_img.image.save(filename, File(f), save=True)
                        print(f"Assigned {filename} to product {p.id}")
                        assigned = True
        if assigned:
            assigned_count += 1
            
    print(f"Total products with images assigned: {assigned_count} out of {products.count()}")
    
if __name__ == '__main__':
    assign_images()
