import urllib.request
import json

def fetch_categories():
    url = "https://www.olx.ua/api/v1/categories/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data.get('data', [])
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return []

def build_tree(categories):
    tree = {}
    for cat in categories:
        parent_id = cat.get('parent_id')
        if parent_id not in tree:
            tree[parent_id] = []
        tree[parent_id].append(cat)
    return tree

def print_tree(tree, node_id, level=0, file=None):
    if node_id not in tree:
        return
    for cat in sorted(tree[node_id], key=lambda x: x.get('id', 0)):
        name = cat.get('name', 'Unknown')
        indent = "  " * level
        line = f"{indent}- {name}"
        if file:
            file.write(line + "\n")
        else:
            print(line)
        print_tree(tree, cat.get('id'), level + 1, file)

def main():
    print("Fetching categories from OLX...")
    categories = fetch_categories()
    if not categories:
        print("No categories found.")
        return
    
    tree = build_tree(categories)
    
    # Root categories have parent_id as 0 or None, but let's check what it actually is in OLX API
    # Often it's parent_id = 0
    root_id = 0
    if root_id not in tree and None in tree:
        root_id = None
        
    print(f"Building category tree and saving to categories.txt...")
    with open("categories.txt", "w", encoding="utf-8") as f:
        print_tree(tree, root_id, 0, f)
    print("Done. Saved to categories.txt")

if __name__ == "__main__":
    main()
