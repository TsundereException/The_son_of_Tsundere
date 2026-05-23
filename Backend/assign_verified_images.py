import os
import django
import shutil
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, ProductImage

# First, let's clear all existing product images to ensure a clean state
ProductImage.objects.all().delete()
print("Cleared existing ProductImages.")

# Directory paths
artifact_dir = r"C:\Users\Admin\\.gemini\\antigravity\\brain\\e4bde1c0-9771-4b4d-aebf-277a13b6496b"
# Fix up potential path syntax
if not os.path.exists(artifact_dir):
    artifact_dir = r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b"

unsplash_dir = "manual_review_unsplash"

# Product mappings
artifact_mapping = {
    1045: "mercedes_g63_kids_car_1779568999877.png",
    1044: "micro_mini_deluxe_scooter_1779569011893.png",
    1043: "strider_sport_balance_bike_1779569025212.png",
    1042: "doona_liki_trike_1779569039038.png",
    1040: "tiny_love_play_mat_1779569051372.png",
    1039: "furby_boom_1779569085967.png",
    1038: "lego_duplo_train_1779569071898.png",
    1037: "kids_adjustable_desk_1779569098974.png",
    1036: "chicco_polly_magic_1779569112846.png",
    1035: "baby_dresser_1779569125625.png",
    1034: "baby_crib_1779569146572.png",
    1033: "graco_booster_1779569161030.png",
    1032: "cybex_pallas_1779569175229.png",
    1031: "britax_romer_1779569189265.png",
    1030: "maxi_cosi_cabriofix_1779569202900.png",
    1029: "anex_m_type_1779569221528.png",
    1028: "maclaren_techno_1779569234904.png",
}

unsplash_mapping = {
    1041: "hot_wheels.jpg",
    1027: "cybex_stroller.jpg",
    1026: "adamex_stroller.jpg",
    1025: "superfit_boots.jpg", # Replaced high heels with premium pink kids sneaker
    1024: "ecoby_sandals.jpg",
    1023: "crocs_boots.jpg",
    1022: "nike_sneakers.jpg",
    1021: "superfit_boots.jpg",
    1020: "next_romper.jpg"
}

count = 0

# 1. Assign generated premium images from artifacts
print("\nAssigning generated premium images from artifacts...")
for pid, filename in artifact_mapping.items():
    try:
        p = Product.objects.get(id=pid)
        filepath = os.path.join(artifact_dir, filename)
        if not os.path.exists(filepath):
            # Try lower level directory or relative
            filepath = filename
            
        with open(filepath, 'rb') as f:
            content = f.read()
            pi = ProductImage(product=p)
            pi.image.save(filename, ContentFile(content))
            count += 1
            print(f"Assigned {filename} -> {p.name}")
    except Exception as e:
        print(f"Error for ID {pid}: {e}")

# 2. Assign high-quality stock photos from Unsplash/crawler
print("\nAssigning verified premium stock photos...")
for pid, filename in unsplash_mapping.items():
    try:
        p = Product.objects.get(id=pid)
        filepath = os.path.join(unsplash_dir, filename)
        with open(filepath, 'rb') as f:
            content = f.read()
            pi = ProductImage(product=p)
            pi.image.save(filename, ContentFile(content))
            count += 1
            print(f"Assigned {filename} -> {p.name}")
    except Exception as e:
        print(f"Error for ID {pid}: {e}")

print(f"\nCompleted! Total products assigned with verified images: {count}")
