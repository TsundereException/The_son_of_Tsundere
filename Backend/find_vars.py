import re

with open(r"C:\Users\Admin\.gemini\antigravity\brain\e4bde1c0-9771-4b4d-aebf-277a13b6496b\.system_generated\steps\375\content.md", "r", encoding="utf-8") as f:
    content = f.read()

# Look for large window.X assignments
matches = re.findall(r'window\.([a-zA-Z0-9_]+)\s*=\s*({.*?});', content, re.DOTALL)
for var_name, value in matches:
    print(f"Found window.{var_name} of size {len(value)}")

matches2 = re.findall(r'<script id="([^"]+)" type="application/json">', content)
for m in matches2:
    print("Found script id:", m)
