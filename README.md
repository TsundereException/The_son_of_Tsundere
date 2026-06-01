# Tsundere (E-commerce Platform)

## 📖 Короткий опис
Tsundere — це сучасна веб-платформа для електронної комерції (маркетплейс/дошка оголошень). Проєкт складається з потужного API на базі Django REST Framework та швидкого інтерактивного клієнтського інтерфейсу, побудованого з використанням React та Vite. Система підтримує публікацію оголошень, управління товарами, кошик/замовлення, автентифікацію користувачів та внутрішній чат.

## ✨ Основний функціонал
- **Автентифікація та авторизація:** Безпечний вхід та реєстрація за допомогою JWT токенів.
- **Оголошення та товари (Listings & Products):** Перегляд, створення та фільтрація товарів/оголошень за категоріями.
- **Замовлення (Orders):** Оформлення замовлень та управління їхніми статусами.
- **Внутрішній чат (Chat):** Можливість обміну повідомленнями між покупцями та продавцями.
- **Панель адміністратора:** Стандартна адмінка Django для управління контентом.
- **UI Компоненти:** Ізольована розробка та тестування інтерфейсу за допомогою Storybook.

## 🛠 Стек технологій

**Backend:**
- Python 3
- Django 5.0+
- Django REST Framework (DRF)
- JWT Authentication (djangorestframework-simplejwt)
- База даних: SQLite (за замовчуванням)
- django-cors-headers, django-filter

**Frontend:**
- React 19
- Vite (збірник)
- Tailwind CSS v4 (стилізація)
- React Router DOM (маршрутизація)
- React Query & Axios (робота з API)
- Storybook (UI документація)
- Vitest & Playwright (тестування)

---

## ⚙️ Вимоги
Для розгортання проєкту локально у вас мають бути встановлені:
- [Python](https://www.python.org/downloads/) (версії 3.10 або вище)
- [Node.js](https://nodejs.org/) (версії 18+ або 20+)
- Git

---

## 🚀 Інструкція зі встановлення та запуску

### 1. Клонування репозиторію
```bash
git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/The_son_of_Tsundere.git
cd The_son_of_Tsundere
```

### 2. Налаштування Backend (Серверна частина)
Відкрийте новий термінал та перейдіть у папку `Backend`:
```bash
cd Backend
```

**Створіть та активуйте віртуальне середовище:**
- Для Windows:
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```
- Для macOS / Linux:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

**Встановіть залежності:**
```bash
pip install -r requirements.txt
```

**Налаштуйте змінні середовища:**
Створіть файл `.env` у папці `Backend` (якщо він відсутній) і додайте базові налаштування:
```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Застосуйте міграції та завантажте початкові дані (якщо є):**
```bash
python manage.py migrate
# Якщо ви додали initial_data.json в репозиторій:
python manage.py loaddata initial_data.json
```

**Запустіть сервер розробки:**
```bash
python manage.py runserver
```
*API буде доступне за адресою: http://127.0.0.1:8000/*

---

### 3. Налаштування Frontend (Клієнтська частина)
Відкрийте іншу вкладку термінала та перейдіть у папку `Frontend`:
```bash
cd Frontend
```

**Встановіть залежності:**
```bash
npm install
```

**Запустіть клієнтський сервер:**
```bash
npm run dev
```
*Frontend буде доступний за адресою (зазвичай): http://localhost:5173/*

---

## 💡 Приклади використання та додаткові команди

### Робота з Frontend
- **Запуск Storybook** (для перегляду компонентів):
  ```bash
  npm run storybook
  ```
- **Запуск тестів (Vitest)**:
  ```bash
  npm run test
  ```
- **Перевірка коду лінтером (ESLint)**:
  ```bash
  npm run lint
  ```

### Робота з Backend
- **Створення суперкористувача (Адміністратора):**
  ```bash
  python manage.py createsuperuser
  ```
- **Скрипти для заповнення бази (Seed):**
  У проєкті присутні скрипти для автоматичної генерації даних, наприклад:
  ```bash
  python seed_data.py
  # або
  python seed_all_categories.py
  ```

---
*Документація створена автоматично. Якщо у вас виникли питання, звертайтеся до розробників проєкту.*