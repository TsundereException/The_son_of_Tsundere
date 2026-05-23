import os
import django
import shutil
from pathlib import Path
from PIL import Image, ImageDraw

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from bing_image_downloader import downloader

# Map Product ID to specific, high-quality English search query
# This guarantees we get good, relevant images instead of random garbage.
QUERIES = {
    1045: "Mercedes G63 AMG kids ride on car white background",
    1044: "Micro Mini Deluxe scooter isolated",
    1043: "Strider Sport 12 balance bike",
    1042: "Doona Liki Trike S4",
    1041: "Hot Wheels Shark Chomp track",
    1040: "Tiny Love play mat isolated",
    1039: "Furby Boom toy",
    1038: "LEGO DUPLO 10847 Number Train box",
    1037: "kids adjustable desk chair",
    1036: "Chicco Polly Magic high chair",
    1035: "Baby changing dresser white",
    1034: "White wooden baby crib isolated",
    1033: "Graco booster car seat",
    1032: "Cybex Pallas G i-Size",
    1031: "Britax Romer King II",
    1030: "Maxi-Cosi CabrioFix",
    1029: "Anex m/type stroller",
    1028: "Maclaren Techno XT stroller",
    1027: "Cybex Priam stroller",
    1026: "Adamex Rimini stroller",
    1025: "UGG baby booties",
    1024: "Kids orthopedic sandals",
    1023: "Crocs kids rain boots yellow",
    1022: "Nike Air Max kids sneakers",
    1021: "Superfit kids winter boots",
    1020: "baby fleece sleepsuit"
}

shutil.rmtree('manual_review_en', ignore_errors=True)
os.makedirs('manual_review_en', exist_ok=True)

downloaded_images = []

for pid, q in QUERIES.items():
    print(f"Downloading image for: {q}")
    try:
        downloader.download(q, limit=1, output_dir='manual_review_en', adult_filter_off=False, force_replace=False, timeout=5, verbose=False)
        downloaded_dir = Path('manual_review_en') / q
        imgs = list(downloaded_dir.glob('*.jpg')) + list(downloaded_dir.glob('*.png')) + list(downloaded_dir.glob('*.jpeg')) + list(downloaded_dir.glob('*.webp'))
        if imgs:
            downloaded_images.append((pid, q, str(imgs[0])))
        else:
            downloaded_images.append((pid, q, None))
    except Exception as e:
        print(f"Error for {q}: {e}")
        downloaded_images.append((pid, q, None))

# Create grid
img_width = 300
img_height = 300
cols = 5
rows = 6
grid = Image.new('RGB', (cols * img_width, rows * img_height), color='white')

for idx, (p_id, p_name, img_path) in enumerate(downloaded_images):
    row = idx // cols
    col = idx % cols
    x = col * img_width
    y = row * img_height
    
    if img_path:
        try:
            img = Image.open(img_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img = img.resize((img_width, img_height - 30))
            grid.paste(img, (x, y))
        except Exception as e:
            print(f"Could not open {img_path}: {e}")
            
    draw = ImageDraw.Draw(grid)
    draw.text((x + 5, y + img_height - 25), f"ID:{p_id} {p_name[:25]}", fill="black")

grid.save("grid_review_en.jpg")
print("Saved grid_review_en.jpg")
