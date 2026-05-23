import os
import django
import random
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product

def fix_attributes():
    products = Product.objects.all()
    updated_count = 0

    for p in products:
        subcat = p.category.name.lower()
        maincat = p.category.parent.name if p.category.parent else "Unknown"
        
        # Start with fresh attributes
        attr = {}
        
        # Add basic state for physical items
        if maincat in ["Авто", "Електроніка", "Дім і сад", "Мода і стиль", "Хобі, відпочинок і спорт", "Запчастини"]:
            attr["Стан"] = random.choice(["Нове", "Вживане", "Ідеальний", "Хороший"])
            
        # НЕРУХОМІСТЬ
        if maincat == "Нерухомість":
            if "квартири" in subcat:
                attr["Загальна площа"] = f"{random.randint(30, 120)} м²"
                attr["Поверх"] = str(random.randint(1, 15))
                attr["Поверховість"] = str(random.randint(int(attr["Поверх"]), 25))
                attr["Кількість кімнат"] = str(random.randint(1, 4))
                attr["Тип стін"] = random.choice(["Цегляний", "Панельний", "Монолітний", "Газоблок"])
            elif "будинки" in subcat:
                attr["Загальна площа"] = f"{random.randint(60, 300)} м²"
                attr["Поверховість"] = str(random.randint(1, 3))
                attr["Площа ділянки"] = f"{random.randint(4, 20)} соток"
                attr["Кількість кімнат"] = str(random.randint(2, 6))
                attr["Тип стін"] = random.choice(["Цегляний", "Дерев'яний", "Газоблок", "Ракушняк"])
            elif "земля" in subcat:
                attr["Площа ділянки"] = f"{random.randint(5, 100)} соток"
                attr["Призначення"] = random.choice(["Під забудову", "Сільгосппризначення", "Комерційне"])
            elif "кімнати" in subcat:
                attr["Площа кімнати"] = f"{random.randint(10, 25)} м²"
                attr["Поверх"] = str(random.randint(1, 9))
            else:
                attr["Загальна площа"] = f"{random.randint(20, 500)} м²"

        # АВТО
        elif maincat == "Авто":
            attr["Рік випуску"] = str(random.randint(2005, 2023))
            attr["Пробіг"] = f"{random.randint(10, 350)} тис. км"
            attr["Колір"] = random.choice(["Чорний", "Білий", "Сріблястий", "Синій", "Червоний", "Сірий"])
            
            if "легкові" in subcat:
                attr["Тип кузова"] = random.choice(["Седан", "Хетчбек", "Універсал", "Позашляховик", "Кросовер"])
                attr["Коробка передач"] = random.choice(["Автомат", "Механіка", "Робот", "Варіатор"])
                attr["Паливо"] = random.choice(["Бензин", "Дизель", "Газ/Бензин", "Електро", "Гібрид"])
            elif "вантажні" in subcat:
                attr["Вантажопідйомність"] = f"{random.randint(2, 20)} т"
                attr["Паливо"] = "Дизель"
            elif "мото" in subcat:
                attr["Об'єм двигуна"] = f"{random.choice([125, 250, 600, 1000])} см³"

        # ЕЛЕКТРОНІКА
        elif maincat == "Електроніка":
            if "телефони" in subcat:
                attr["Вбудована пам'ять"] = random.choice(["64 ГБ", "128 ГБ", "256 ГБ", "512 ГБ"])
                attr["Оперативна пам'ять"] = random.choice(["4 ГБ", "6 ГБ", "8 ГБ", "12 ГБ"])
                attr["Діагональ екрану"] = random.choice(["6.1\"", "6.5\"", "6.7\""])
            elif "комп'ютери" in subcat or "ноутбуки" in subcat:
                attr["Процесор"] = random.choice(["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"])
                attr["Оперативна пам'ять"] = random.choice(["8 ГБ", "16 ГБ", "32 ГБ"])
                attr["Накопичувач"] = random.choice(["SSD 256 ГБ", "SSD 512 ГБ", "SSD 1 ТБ"])
            elif "тб" in subcat or "відеотехніка" in subcat:
                attr["Діагональ екрану"] = random.choice(["32\"", "43\"", "50\"", "55\"", "65\""])
                attr["Роздільна здатність"] = random.choice(["4K UHD", "Full HD"])

        # МОДА І СТИЛЬ
        elif maincat == "Мода і стиль":
            if "взуття" in subcat:
                attr["Розмір"] = str(random.randint(36, 45))
                attr["Матеріал"] = random.choice(["Шкіра", "Замша", "Текстиль", "Штучна шкіра"])
            elif "одяг" in subcat:
                attr["Розмір"] = random.choice(["XS", "S", "M", "L", "XL", "XXL"])
                attr["Сезон"] = random.choice(["Літо", "Зима", "Демісезон", "Всесезонний"])

        # ТВАРИНИ
        elif maincat == "Тварини":
            attr["Вік"] = random.choice(["2 місяці", "6 місяців", "1 рік", "2 роки", "Дорослий"])
            if "собаки" in subcat or "коти" in subcat:
                attr["Вакцинація"] = random.choice(["Так", "Ні"])
                attr["Чип"] = random.choice(["Є", "Немає"])

        # РОБОТА
        elif maincat == "Робота":
            attr["Тип зайнятості"] = random.choice(["Повна зайнятість", "Неповна зайнятість", "Віддалена робота"])
            attr["Досвід роботи"] = random.choice(["Без досвіду", "Від 1 року", "Від 2 років", "Понад 5 років"])
            attr["Графік"] = random.choice(["Гнучкий", "Змінний", "5/2"])

        # ДИТЯЧИЙ СВІТ (якщо потрібно оновити і його, хоча там могли бути нормальні дані)
        elif maincat == "Дитячий світ":
            # Just keep existing attributes if they are already populated
            if p.attributes and isinstance(p.attributes, dict) and len(p.attributes) > 0:
                attr = p.attributes

        # If it's empty, give it something generic
        if not attr and maincat != "Дитячий світ":
            attr["Додатково"] = "Деталі уточнюйте по телефону"

        # Update only if not "Дитячий світ" or if it was overridden
        if maincat != "Дитячий світ" or not p.attributes:
            p.attributes = attr
            p.save(update_fields=['attributes'])
            updated_count += 1

    print(f"Successfully fixed attributes for {updated_count} products.")

if __name__ == '__main__':
    fix_attributes()
