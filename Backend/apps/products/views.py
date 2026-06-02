from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db import transaction

from django.db.models import Q, Max
from .models import Category, Product, ProductImage, Review, FilterAttribute
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductImageUploadSerializer, ReviewSerializer, FilterAttributeSerializer
)
from apps.users.permissions import IsOwnerOrReadOnly


class FiltersConfigView(APIView):
    """GET /api/v1/products/filters-config/ — конфігурація динамічних фільтрів
    
    Параметри:
    - ?category=<id> — повернути атрибути, прив'язані до цієї категорії (та її батьків)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Повертаємо тільки кореневі категорії (parent=None) з дочірніми через серіалізатор
        root_categories = Category.objects.filter(parent=None).prefetch_related('children')
        
        # Якщо передано category — повертаємо тільки відповідні атрибути
        category_id = request.query_params.get('category')
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                # Збираємо ID цієї категорії + всіх батьків (щоб наслідувати атрибути)
                category_ids = [category.id]
                parent = category.parent
                while parent:
                    category_ids.append(parent.id)
                    parent = parent.parent
                attributes = FilterAttribute.objects.filter(
                    categories__id__in=category_ids
                ).prefetch_related('options').distinct()
            except Category.DoesNotExist:
                attributes = FilterAttribute.objects.none()
        else:
            # Без категорії — не повертаємо специфічні атрибути
            attributes = FilterAttribute.objects.none()
        
        # Отримуємо максимальну ціну
        max_price_aggr = Product.objects.filter(is_active=True).aggregate(max_price=Max('price'))
        max_price = max_price_aggr['max_price'] or 0

        return Response({
            'categories': CategorySerializer(root_categories, many=True).data,
            'attributes': FilterAttributeSerializer(attributes, many=True).data,
            'price_range': {
                'min': 0,
                'max': float(max_price)
            }
        })


class CategoryListView(generics.ListAPIView):
    """GET /api/v1/products/categories/"""
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryCreateView(generics.CreateAPIView):
    """POST /api/v1/products/categories/create/ — тільки адмін"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Тільки адміністратор може створювати категорії')
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/products/categories/<id>/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE') and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Тільки адміністратор може редагувати категорії')


def _get_category_descendants(category_id):
    """Рекурсивно збирає ID категорії та всіх її нащадків."""
    ids = [category_id]
    children = Category.objects.filter(parent_id=category_id).values_list('id', flat=True)
    for child_id in children:
        ids.extend(_get_category_descendants(child_id))
    return ids

CATEGORY_BOOK = 'книга'

SURZHYK_DICT = {
    # Міста
    'ровне': 'рівне', 'ровно': 'рівне', 'киев': 'київ', 'одесса': 'одеса',
    'харьков': 'харків', 'днепр': 'дніпро', 'львов': 'львів', 'запорожье': 'запоріжжя',
    'николаев': 'миколаїв', 'винница': 'вінниця', 'чернигов': 'чернігів', 'сумы': 'суми',
    'хмельницкий': 'хмельницький', 'черновцы': 'чернівці', 'ужгород': 'ужгород', 'луцк': 'луцьк',
    'тернополь': 'тернопіль', 'франковск': 'івано-франківськ', 'бровары': 'бровари',

    # Загальні слова (стан, умови)
    'бу': 'б/в', 'б/у': 'б/в', 'состояние': 'стан', 'бесплатно': 'безкоштовно',
    'даром': 'безкоштовно', 'срочно': 'терміново', 'дешево': 'дешево', 'торг': 'торг',
    'обмен': 'обмін', 'оригинал': 'оригінал', 'копия': 'копія', 'новый': 'новий',
    'новая': 'нова', 'отдам': 'віддам', 'продам': 'продам', 'куплю': 'куплю',
    'рабочий': 'робочий', 'поломанный': 'зламаний', 'сломанный': 'зламаний',
    'грязный': 'брудний', 'чистый': 'чистий', 'большой': 'великий', 'маленький': 'маленький',
    'красивый': 'гарний', 'классный': 'класний', 'хороший': 'хороший',
    'зимний': 'зимовий', 'летний': 'літній', 'осенний': 'осінній', 'весенний': 'весняний',

    # Кольори
    'красный': 'червоний', 'белый': 'білий', 'черный': 'чорний', 'чёрный': 'чорний',
    'желтый': 'жовтий', 'жёлтый': 'жовтий', 'синий': 'синій', 'голубой': 'блакитний',
    'зеленый': 'зелений', 'зелёный': 'зелений', 'серый': 'сірий', 'розовый': 'рожевий',
    'оранжевый': 'помаранчевий', 'коричневый': 'коричневий', 'фиолетовый': 'фіолетовий',

    # Матеріали
    'кожа': 'шкіра', 'дерево': 'дерево', 'стекло': 'скло', 'железо': 'залізо',
    'пластик': 'пластик', 'резина': 'гума', 'металл': 'метал', 'золото': 'золото',
    'серебро': 'срібло', 'бумага': 'папір', 'ткань': 'тканина', 'шерсть': 'вовна',
    'хлопок': 'бавовна', 'шелк': 'шовк', 'картон': 'картон',

    # Транспорт
    'велик': 'велосипед', 'самокат': 'самокат', 'машина': 'авто', 'тачка': 'авто',
    'мопед': 'мопед', 'мотик': 'мотоцикл', 'покрышки': 'шини', 'колеса': 'колеса',
    'диски': 'диски', 'мотор': 'двигун', 'движок': 'двигун', 'запаска': 'запасне колесо',
    'руль': 'кермо', 'акум': 'акумулятор', 'аккумулятор': 'акумулятор', 'сидушка': 'сидіння',
    'фары': 'фари', 'бампер': 'бампер', 'капот': 'капот', 'багажник': 'багажник',
    'дворники': 'двірники', 'коврики': 'килимки', 'магнитола': 'магнітола', 'чехлы': 'чохли',
    'сиденья': 'сидіння', 'автобус': 'автобус', 'грузовик': 'вантажівка', 'прицеп': 'причіп',
    'лодка': 'човен', 'яхта': 'яхта',

    # Електроніка та Комп'ютери
    'ноут': 'ноутбук', 'комп': 'комп\'ютер', 'мобила': 'телефон', 'смартфон': 'телефон',
    'телик': 'телевізор', 'телевизор': 'телевізор', 'приставка': 'ігрова приставка',
    'зарядка': 'зарядний пристрій', 'флешка': 'флешка', 'колонка': 'акустика',
    'наушники': 'навушники', 'часы': 'годинник', 'утюг': 'праска', 'пылесос': 'пилосос',
    'стиралка': 'пральна машина', 'холодильник': 'холодильник', 'микроволновка': 'мікрохвильова піч',
    'духовка': 'духова шафа', 'обогреватель': 'обігрівач', 'кондиционер': 'кондиціонер',
    'камера': 'камера', 'фотик': 'фотоапарат', 'принтер': 'принтер', 'мышка': 'миша',
    'мышь': 'миша', 'клава': 'клавіатура', 'клавиатура': 'клавіатура', 'монитор': 'монітор',
    'системник': 'системний блок', 'видюха': 'відеокарта', 'мать': 'материнська плата',
    'материнка': 'материнська плата', 'проц': 'процесор', 'жесткий': 'жорсткий',
    'чехол': 'чохол', 'пленка': 'плівка', 'кабель': 'кабель', 'провод': 'дріт',
    'переходник': 'перехідник', 'блендер': 'блендер', 'мясорубка': 'м\'ясорубка',
    'соковыжималка': 'соковижималка', 'вытяжка': 'витяжка', 'печка': 'піч',
    'посудомойка': 'посудомийна машина', 'чайник': 'чайник',

    # Меблі, Дім, Побут
    'кровать': 'ліжко', 'стул': 'стілець', 'стол': 'стіл', 'шкаф': 'шафа',
    'ковер': 'килим', 'ковёр': 'килим', 'диван': 'диван', 'кресло': 'крісло',
    'тумбочка': 'тумба', 'зеркало': 'дзеркало', 'окно': 'вікно', 'дверь': 'двері',
    'обои': 'шпалери', 'плитка': 'плитка', 'котел': 'котел', 'батарея': 'радіатор',
    'посуда': 'посуд', 'сковородка': 'сковорідка', 'кастрюля': 'каструля', 'вилка': 'виделка',
    'ложка': 'ложка', 'нож': 'ніж', 'чашка': 'чашка', 'стакан': 'склянка',
    'веник': 'віник', 'швабра': 'швабра', 'ведро': 'відро', 'тряпка': 'ганчірка',
    'мусорка': 'смітник', 'полка': 'полиця', 'комод': 'комод', 'матрас': 'матрац',
    'подушка': 'подушка', 'одеяло': 'ковдра', 'постельное': 'постільна білизна',
    'полотенце': 'рушник', 'коврик': 'килимок',

    # Одяг, Взуття, Аксесуари
    'обувь': 'взуття', 'одежда': 'одяг', 'платье': 'сукня', 'юбка': 'спідниця',
    'брюки': 'штани', 'рубашка': 'сорочка', 'кофта': 'кофта', 'куртка': 'куртка',
    'кроссовки': 'кросівки', 'кросы': 'кросівки', 'ботинки': 'черевики', 'туфли': 'туфлі',
    'сапоги': 'чоботи', 'футболка': 'футболка', 'майка': 'майка', 'носки': 'шкарпетки',
    'трусы': 'труси', 'шапка': 'шапка', 'перчатки': 'рукавички', 'сумка': 'сумка',
    'рюкзак': 'рюкзак', 'кошелек': 'гаманець', 'свитер': 'светр', 'шорты': 'шорти',
    'лифчик': 'бюстгальтер', 'зонтик': 'парасоля', 'очки': 'окуляри', 'кольцо': 'каблучка',
    'серьги': 'сережки', 'цепь': 'ланцюжок', 'духи': 'парфуми', 'галстук': 'краватка',
    'бабочка': 'метелик', 'ремень': 'ремінь', 'шарф': 'шарф', 'кепка': 'кепка',
    'шлепки': 'капці', 'тапки': 'капці', 'пальто': 'пальто', 'пуховик': 'пуховик',
    'колготки': 'колготки',

    # Краса та Догляд
    'мыло': 'мило', 'бритва': 'бритва', 'ножницы': 'ножиці', 'утюжок': 'випрямляч',
    'шампунь': 'шампунь', 'фен': 'фен', 'плойка': 'плойка', 'помада': 'помада',

    # Канцелярія та Школа
    'карандаш': 'олівець', 'линейка': 'лінійка', 'тетрадь': 'зошит', 'дневник': 'щоденник',
    'ластик': 'гумка', 'резинка': 'гумка', 'краски': 'фарби', 'кисточка': 'пензлик',
    'клей': 'клей', 'скотч': 'скотч', 'ручка': 'ручка',

    # Дитячі товари та Іграшки
    'игрушка': 'іграшка', 'коляска': 'візок', 'книжка': CATEGORY_BOOK, 'памперсы': 'підгузки',
    'соска': 'пустушка', 'бутылочка': 'пляшечка', 'кроватка': 'ліжечко', 'кукла': 'лялька',
    'конструктор': 'конструктор', 'пазлы': 'пазли', 'настолка': 'настільна гра', 'кубики': 'кубики',

    # Хобі, Музика, Спорт
    'мяч': 'м\'яч', 'коньки': 'ковзани', 'ролики': 'ролики', 'палатка': 'намет',
    'удочка': 'вудка', CATEGORY_BOOK: CATEGORY_BOOK, 'картина': 'картина', 'гитара': 'гітара',
    'пианино': 'піаніно', 'барабаны': 'барабани', 'скрипка': 'скрипка',

    # Сад і Город
    'грабли': 'граблі', 'семена': 'насіння', 'удобрения': 'добрива', 'саженцы': 'саджанці',
    'трактор': 'трактор', 'косилка': 'косарка', 'пила': 'пилка', 'шланг': 'шланг',
    'лопата': 'лопата',

    # Їжа
    'картошка': 'картопля', 'сахар': 'цукор', 'масло': 'масло', 'молоко': 'молоко',
    'мясо': 'м\'ясо', 'яйца': 'яйця', 'хлеб': 'хліб', 'вода': 'вода', 'колбаса': 'ковбаса',
    'сыр': 'сир', 'водка': 'горілка', 'сок': 'сік', 'конфеты': 'цукерки', 'печенье': 'печиво',
    'пиво': 'пиво', 'вино': 'вино', 'торт': 'торт',

    # Будівництво та Інструменти
    'дрель': 'дриль', 'болгарка': 'шліфмашина', 'шуруповерт': 'шуруповерт',
    'перфоратор': 'перфоратор', 'молоток': 'молоток', 'топор': 'сокира',
    'сварка': 'зварювальний апарат', 'кирпич': 'цегла', 'песок': 'пісок',
    'гвозди': 'цвяхи', 'саморезы': 'саморізи', 'шурупы': 'шурупи', 'краска': 'фарба',
    'кисть': 'пензель', 'плоскогубцы': 'пасатижі', 'отвертка': 'викрутка', 'ключ': 'ключ',

    # Тварини та товари для них
    'собака': 'собака', 'щенок': 'цуценя', 'кот': 'кіт', 'кошка': 'кішка',
    'котенок': 'кошеня', 'попугай': 'папуга', 'аквариум': 'акваріум', 'клетка': 'клітка',
    'свинья': 'свиня', 'корова': 'корова', 'лошадь': 'кінь', 'корм': 'корм',
    'лоток': 'лоток', 'наполнитель': 'наповнювач', 'поводок': 'повідець', 'ошейник': 'нашийник',

    # Нерухомість
    'квартира': 'квартира', 'хата': 'будинок', 'дом': 'будинок', 'комната': 'кімната',
    'участок': 'ділянка', 'аренда': 'оренда', 'сдам': 'здам', 'сниму': 'зніму',
    'гараж': 'гараж', 'офис': 'офіс', 'склад': 'склад',

    # Послуги
    'ремонт': 'ремонт', 'уборка': 'прибирання', 'грузчики': 'вантажники', 'перевозки': 'перевезення',
}

def translate_surzhyk(text):
    if not text:
        return text
    words = text.split()
    translated_words = []
    for w in words:
        lower_w = w.lower()
        if lower_w in SURZHYK_DICT:
            trans = SURZHYK_DICT[lower_w]
            if w[0].isupper():
                trans = trans.capitalize()
            translated_words.append(trans)
        else:
            translated_words.append(w)
    return " ".join(translated_words)

class SurzhykSearchFilter(SearchFilter):
    def get_search_terms(self, request):
        params = request.query_params.get(self.search_param, '')
        params = params.replace('\x00', '')  # strip null characters
        params = params[:200]
        params = translate_surzhyk(params)
        return params.replace(',', ' ').split()

class ProductListView(generics.ListAPIView):
    """GET /api/v1/products/ — список з фільтрами та пошуком"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SurzhykSearchFilter, OrderingFilter]
    search_fields    = ['name', 'description']
    ordering_fields  = ['price', 'created_at']
    ordering         = ['-created_at']

    def get_queryset(self):
        from django.db.models import Exists, OuterRef
        from .models import Favorite
        
        qs = Product.objects.filter(is_active=True).select_related('seller', 'category')
        from apps.users.models import SiteSettings
        if SiteSettings.load().hide_generated_data:
            qs = qs.exclude(is_generated=True)
            
        user = self.request.user
        if user.is_authenticated:
            qs = qs.annotate(
                is_favorite_annotated=Exists(
                    Favorite.objects.filter(product=OuterRef('pk'), user=user)
                )
            )
        return qs

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params

        queryset = self._filter_by_category(queryset, params)
        queryset = self._filter_by_city(queryset, params)
        queryset = self._filter_by_price_and_photo(queryset, params)
        queryset = self._filter_by_dynamic_attributes(queryset, params)

        return queryset

    def _filter_by_category(self, queryset, params):
        category_id = params.get('category')
        if category_id:
            try:
                all_ids = _get_category_descendants(int(category_id))
                return queryset.filter(category_id__in=all_ids)
            except (ValueError, TypeError):
                pass
        return queryset

    def _filter_by_city(self, queryset, params):
        city = params.get('city')
        if city:
            city = city.strip()[:50]
            city_translated = translate_surzhyk(city)
            
            q_objects = Q(city__icontains=city)
            if city_translated != city:
                q_objects |= Q(city__icontains=city_translated)
                
            # Додатковий пошук по префіксам для суржику (наприклад, "дне" -> "дніпро")
            city_lower = city.lower().strip()
            if city_lower:
                for surzhyk, correct in SURZHYK_DICT.items():
                    if surzhyk.startswith(city_lower):
                        q_objects |= Q(city__icontains=correct)
                        
            return queryset.filter(q_objects)
        return queryset

    def _filter_by_price_and_photo(self, queryset, params):
        min_price = params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (TypeError, ValueError):
                pass
            
        max_price = params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (TypeError, ValueError):
                pass

        has_photo = params.get('has_photo')
        if has_photo and has_photo.lower() == 'true':
            queryset = queryset.filter(images__isnull=False).distinct()
            
        return queryset

    def _filter_by_dynamic_attributes(self, queryset, params):
        for key, value in params.items():
            if key.startswith('attr_') and value:
                attr_name = key[5:]
                value = str(value)[:200]
                if attr_name.endswith('_min'):
                    attr_slug = attr_name[:-4]
                    if not attr_slug.replace('_', '').replace('-', '').isalnum():
                        continue
                    queryset = queryset.filter(**{f"attributes__{attr_slug}__gte": value})
                elif attr_name.endswith('_max'):
                    attr_slug = attr_name[:-4]
                    if not attr_slug.replace('_', '').replace('-', '').isalnum():
                        continue
                    queryset = queryset.filter(**{f"attributes__{attr_slug}__lte": value})
                else:
                    attr_slug = attr_name
                    if not attr_slug.replace('_', '').replace('-', '').isalnum():
                        continue
                    values = value.split(',')
                    q_objects = Q()
                    for v in values:
                        q_objects |= Q(**{f"attributes__{attr_slug}": v})
                        q_objects |= Q(**{f"attributes__{attr_slug}__contains": v})
                    queryset = queryset.filter(q_objects)
        return queryset


class CitiesListView(APIView):
    """GET /api/v1/products/cities/ — список унікальних міст, де є товари + основні міста України"""
    permission_classes = [AllowAny]

    def get(self, request):
        db_cities = Product.objects.filter(is_active=True).exclude(city__exact='').values_list('city', flat=True)
        
        # Очищуємо від дублікатів і зайвих пробілів
        cleaned_cities = set()
        for c in db_cities:
            if c:
                cleaned = c.strip().title()
                if cleaned:
                    cleaned_cities.add(cleaned)
                    
        # Додаємо список найбільших міст України для зручності
        major_cities = {
            "Київ", "Харків", "Одеса", "Дніпро", "Запоріжжя", 
            "Львів", "Кривий Ріг", "Миколаїв", "Вінниця", 
            "Херсон", "Полтава", "Чернігів", "Черкаси", "Житомир", "Суми", 
            "Хмельницький", "Чернівці", "Рівне", "Кам'янське", "Кропивницький", 
            "Івано-Франківськ", "Тернопіль", "Луцьк", "Біла Церква", "Ужгород"
        }
        
        all_cities = cleaned_cities.union(major_cities)
        return Response(sorted(list(all_cities)))


class ProductCreateView(generics.CreateAPIView):
    """POST /api/v1/products/create/ — для всіх авторизованих користувачів"""
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticated]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/products/<slug>/"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]


class MyProductsView(generics.ListAPIView):
    """GET /api/v1/products/my/ — товари поточного користувача"""
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)


class ProductImageUploadView(APIView):
    """POST /api/v1/products/<id>/images/ — завантаження фото"""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, seller=request.user)
        
        if product.images.count() >= 10:
            raise ValidationError({'detail': 'Максимальна кількість фотографій - 10'})
            
        serializer = ProductImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                if serializer.validated_data.get('is_main'):
                    product.images.update(is_main=False)
                elif not product.images.exists():
                    serializer.validated_data['is_main'] = True
                serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductImageDeleteView(generics.DestroyAPIView):
    """DELETE /api/v1/products/images/<id>/"""
    queryset = ProductImage.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.product.seller != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Ви не можете видаляти фото чужого товару")
        instance.delete()


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/v1/products/<slug>/reviews/"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs['slug'])
        if product.seller == self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Ви не можете залишати відгуки на власні товари")
        serializer.save(buyer=self.request.user, product=product)

class FavoriteToggleView(APIView):
    """POST /api/v1/products/<id>/favorite/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from .models import Favorite
        from django.shortcuts import get_object_or_404
        product = get_object_or_404(Product, pk=pk)
        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if not created:
            favorite.delete()
            return Response({'status': 'removed'})
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)

class FavoriteListView(generics.ListAPIView):
    """GET /api/v1/products/favorites/"""
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Exists, OuterRef
        from .models import Favorite
        qs = Product.objects.filter(favorited_by__user=self.request.user, is_active=True).select_related('seller', 'category')
        qs = qs.annotate(
            is_favorite_annotated=Exists(
                Favorite.objects.filter(product=OuterRef('pk'), user=self.request.user)
            )
        )
        return qs
