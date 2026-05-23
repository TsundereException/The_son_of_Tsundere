import re

with open(r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\.system_generated\steps\375\content.md", "r", encoding="utf-8") as f:
    content = f.read()

# The category links usually have class like 'css-1jczs6p' or href="/uk/dityachiy-svit/"
matches = re.findall(r'<a[^>]*href="/uk/([^/"]+)/"[^>]*>(.*?)</a>', content)
categories = []
for slug, text in matches:
    # clean up text inside tags
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if clean_text:
        categories.append((slug, clean_text))

print(f"Found {len(categories)} categories")
for slug, name in set(categories):
    print(slug, "-", name)
