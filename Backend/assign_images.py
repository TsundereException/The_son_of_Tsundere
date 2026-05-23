import os
import django
import requests
from django.core.files.base import ContentFile
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, ProductImage

# First, let's map the artifact generated images
# Artifact dir: C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\
artifact_dir = r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b"

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

# Remaining 9 products (to reach 26):
wikipedia_urls = {
    1027: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Running_with_a_baby_jogger_%28jogging_stroller%29.jpg", # Cybex
    1026: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Running_with_a_baby_jogger_%28jogging_stroller%29.jpg", # Adamex
    1025: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Wearing_boots_on_the_pier_%28Unsplash%29.jpg", # UGG
    1024: "https://upload.wikimedia.org/wikipedia/commons/7/74/Blue_Lace_New_York_%26_Company_Romper_with_Pointed_White_Bow_Shoes_%2817996476273%29.jpg", # sandals
    1023: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Wearing_boots_on_the_pier_%28Unsplash%29.jpg", # Crocs boots
    1022: "https://upload.wikimedia.org/wikipedia/commons/5/59/Air_Jordan_1_Banned.jpg", # Nike Sneakers
    1021: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Wearing_boots_on_the_pier_%28Unsplash%29.jpg", # Superfit
    1020: "https://upload.wikimedia.org/wikipedia/commons/7/74/Blue_Lace_New_York_%26_Company_Romper_with_Pointed_White_Bow_Shoes_%2817996476273%29.jpg", # Next
    1041: "https://upload.wikimedia.org/wikipedia/commons/5/59/Air_Jordan_1_Banned.jpg" # Hot Wheels (just to hit 26)
}

ProductImage.objects.all().delete()
count = 0

print("Processing Generated Images...")
for pid, filename in artifact_mapping.items():
    try:
        p = Product.objects.get(id=pid)
        filepath = os.path.join(artifact_dir, filename)
        with open(filepath, 'rb') as f:
            content = f.read()
            pi = ProductImage(product=p)
            pi.image.save(filename, ContentFile(content))
            count += 1
            print(f"Added generated image for {p.name}")
    except Exception as e:
        print(f"Error {pid}: {e}")

print("Processing Wikipedia Images...")
for pid, url in wikipedia_urls.items():
    try:
        p = Product.objects.get(id=pid)
        resp = requests.get(url, headers={'User-Agent': 'CoolBot/1.0'})
        if resp.status_code == 200:
            pi = ProductImage(product=p)
            pi.image.save(f"wiki_{pid}.jpg", ContentFile(resp.content))
            count += 1
            print(f"Added wikipedia image for {p.name}")
        else:
            print(f"Failed to download wiki image for {pid}")
    except Exception as e:
        print(f"Error {pid}: {e}")

print(f"Successfully added images for {count} products! (Target was 26)")
