from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

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


class ProductListView(generics.ListAPIView):
    """GET /api/v1/products/ — список з фільтрами та пошуком"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields    = ['name', 'description']
    ordering_fields  = ['price', 'created_at']
    ordering         = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('seller', 'category')
        from apps.users.models import SiteSettings
        if SiteSettings.load().hide_generated_data:
            qs = qs.exclude(is_generated=True)
        return qs

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params

        queryset = self._filter_by_category(queryset, params)
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

    def _filter_by_price_and_photo(self, queryset, params):
        min_price = params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        has_photo = params.get('has_photo')
        if has_photo and has_photo.lower() == 'true':
            queryset = queryset.filter(images__isnull=False).distinct()
            
        return queryset

    def _filter_by_dynamic_attributes(self, queryset, params):
        for key, value in params.items():
            if key.startswith('attr_') and value:
                attr_name = key[5:]
                if attr_name.endswith('_min'):
                    attr_slug = attr_name[:-4]
                    queryset = queryset.filter(**{f"attributes__{attr_slug}__gte": value})
                elif attr_name.endswith('_max'):
                    attr_slug = attr_name[:-4]
                    queryset = queryset.filter(**{f"attributes__{attr_slug}__lte": value})
                else:
                    attr_slug = attr_name
                    values = value.split(',')
                    q_objects = Q()
                    for v in values:
                        q_objects |= Q(**{f"attributes__{attr_slug}": v})
                        q_objects |= Q(**{f"attributes__{attr_slug}__contains": v})
                    queryset = queryset.filter(q_objects)
        return queryset


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
        product = Product.objects.get(pk=pk, seller=request.user)
        
        if product.images.count() >= 10:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Максимальна кількість фотографій - 10'})
            
        serializer = ProductImageUploadSerializer(data=request.data)
        if serializer.is_valid():
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
