import os
import django
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from bing_image_downloader import downloader

shutil.rmtree('manual_review', ignore_errors=True)
os.makedirs('manual_review', exist_ok=True)

products = list(Product.objects.all()[:26])

print(f"Starting to download images for {len(products)} products...")

downloaded_images = []

for p in products:
    query = p.name
    # Extract the base name if there's an id attached like (123)
    if "(" in query:
        query = query.split("(")[0].strip()
        
    print(f"Downloading image for: {query}")
    try:
        downloader.download(query + " фото", limit=1, output_dir='manual_review', adult_filter_off=True, force_replace=False, timeout=5, verbose=False)
        downloaded_dir = Path('manual_review') / (query + " фото")
        imgs = list(downloaded_dir.glob('*.jpg')) + list(downloaded_dir.glob('*.png')) + list(downloaded_dir.glob('*.jpeg'))
        if imgs:
            downloaded_images.append((p.id, p.name, str(imgs[0])))
        else:
            downloaded_images.append((p.id, p.name, None))
    except Exception as e:
        print(f"Error for {query}: {e}")
        downloaded_images.append((p.id, p.name, None))

# Create a grid image
img_width = 300
img_height = 300
cols = 5
rows = 6

grid_width = cols * img_width
grid_height = rows * img_height

grid = Image.new('RGB', (grid_width, grid_height), color='white')

for idx, (p_id, p_name, img_path) in enumerate(downloaded_images):
    row = idx // cols
    col = idx % cols
    x = col * img_width
    y = row * img_height
    
    if img_path:
        try:
            img = Image.open(img_path)
            img = img.resize((img_width, img_height - 30)) # Leave 30px for text
            grid.paste(img, (x, y))
        except Exception as e:
            print(f"Could not open image for {p_name}: {e}")
            
    draw = ImageDraw.Draw(grid)
    # Simple text overlay
    short_name = p_name[:30]
    draw.text((x + 5, y + img_height - 25), f"ID:{p_id} {short_name}", fill="black")

grid.save("grid_review.jpg")
print("Saved grid_review.jpg")
