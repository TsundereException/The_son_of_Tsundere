import os, django, requests, re, urllib.parse, time
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from apps.products.models import Product

def download_images():
    products = Product.objects.all()
    os.makedirs('temp_images', exist_ok=True)
    
    for p in products:
        query = urllib.parse.quote(p.name)
        url = f"https://www.bing.com/images/search?q={query}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        try:
            res = requests.get(url, headers=headers, timeout=10)
            murls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', res.text)
            
            count = 0
            for i, murl in enumerate(murls):
                if count >= 3:
                    break
                # Only use typical image extensions
                if not any(ext in murl.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    continue
                try:
                    img_res = requests.get(murl, headers=headers, timeout=5)
                    if img_res.status_code == 200:
                        content_type = img_res.headers.get('content-type', '')
                        if 'image' in content_type:
                            ext = '.jpg'
                            if 'png' in content_type: ext = '.png'
                            elif 'webp' in content_type: ext = '.webp'
                            
                            filepath = f"temp_images/{p.id}_{count + 1}{ext}"
                            with open(filepath, 'wb') as f:
                                f.write(img_res.content)
                            print(f"Downloaded {filepath} for product {p.id}")
                            count += 1
                except Exception as e:
                    pass
        except Exception as e:
            print(f"Failed to fetch for product {p.id}: {e}")
        time.sleep(1)

if __name__ == '__main__':
    download_images()
