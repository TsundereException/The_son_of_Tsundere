import re

with open(r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\.system_generated\steps\375\content.md", "r", encoding="utf-8") as f:
    content = f.read()

urls = re.findall(r'https://www\.olx\.ua/api/[^"\']+', content)
print("Found URLs:", set(urls))
