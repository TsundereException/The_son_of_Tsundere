import re
import json

with open(r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\.system_generated\steps\375\content.md", "r", encoding="utf-8") as f:
    content = f.read()

# Look for __NEXT_DATA__
match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', content, re.DOTALL)
if match:
    try:
        data = json.loads(match.group(1))
        print("Found __NEXT_DATA__")
        with open("olx_data.json", "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Failed to parse __NEXT_DATA__", e)
else:
    # Look for window.__INITIAL_STATE__
    match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});', content, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            print("Found window.__INITIAL_STATE__")
            with open("olx_data.json", "w", encoding="utf-8") as out:
                json.dump(data, out, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Failed to parse INITIAL_STATE", e)
    else:
        print("No state found.")
