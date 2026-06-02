import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Category

def build_tree(category, level=0):
    indent = "    " * level
    result = f"{indent}- {category.name}\n"
    for child in category.children.all().order_by('name'):
        result += build_tree(child, level + 1)
    return result

if __name__ == '__main__':
    tree_text = "Дерево категорій:\n===================\n\n"
    top_categories = Category.objects.filter(parent__isnull=True).order_by('name')
    for cat in top_categories:
        tree_text += build_tree(cat)
    
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'categories_tree.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(tree_text)
    
    print(f"Successfully wrote category tree to {output_path}")
