from rest_framework import serializers
from .models import Category, Product, ProductImage, Review, FilterOption, FilterAttribute
from apps.users.serializers import UserSerializer
from apps.users.cities import haversine_distance

class FilterOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterOption
        fields = ['id', 'value', 'extra']

class FilterAttributeSerializer(serializers.ModelSerializer):
    options = FilterOptionSerializer(many=True, read_only=True)

    class Meta:
        model = FilterAttribute
        fields = ['id', 'name', 'slug', 'type', 'options']
class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'children', 'icon_name', 'color', 'product_count']
        read_only_fields = ['slug']

    def get_children(self, obj):
        kids = obj.children.all()
        return CategorySerializer(kids, many=True).data if kids else []

    def get_product_count(self, obj):
        from apps.products.views import _get_category_descendants
        from apps.products.models import Product
        from apps.users.models import SiteSettings
        
        # Використовуємо контекст, якщо він є, для оптимізації, або робимо запит
        all_ids = _get_category_descendants(obj.id)
        qs = Product.objects.filter(category_id__in=all_ids, is_active=True)
        if SiteSettings.load().hide_generated_data:
            qs = qs.exclude(is_generated=True)
        return qs.count()

    def create(self, validated_data):
        from django.utils.text import slugify
        import uuid
        validated_data['slug'] = slugify(validated_data['name']) + '-' + str(uuid.uuid4())[:6]
        return super().create(validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'buyer', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'buyer', 'created_at']

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    """Короткий варіант для списку товарів"""
    main_image = serializers.SerializerMethodField()
    avg_rating = serializers.ReadOnlyField()
    seller     = serializers.StringRelatedField()
    category   = CategorySerializer(read_only=True)
    distance   = serializers.SerializerMethodField()
    is_favorite= serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'is_negotiable', 'is_free', 'is_exchange', 'stock',
                  'main_image', 'avg_rating', 'seller', 'category', 'city', 'distance', 'is_favorite']

    def get_main_image(self, obj):
        request = self.context.get('request')
        url = obj.main_image
        if url and request:
            return request.build_absolute_uri(url)
        return url

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.city and obj.city:
            return haversine_distance(request.user.city, obj.city)
        return None

    def get_is_favorite(self, obj):
        if hasattr(obj, 'is_favorite_annotated'):
            return obj.is_favorite_annotated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Не оптимізований варіант (фолбек)
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class ProductDetailSerializer(serializers.ModelSerializer):
    """Повний варіант для сторінки товару"""
    images     = ProductImageSerializer(many=True, read_only=True)
    reviews    = ReviewSerializer(many=True, read_only=True)
    seller     = UserSerializer(read_only=True)
    category   = CategorySerializer(read_only=True)
    avg_rating = serializers.ReadOnlyField()
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    distance   = serializers.SerializerMethodField()
    is_favorite= serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'attributes', 'price', 'is_negotiable', 'is_free', 'is_exchange', 'stock',
                  'is_active', 'seller', 'category', 'category_id',
                  'images', 'reviews', 'avg_rating', 'created_at', 'updated_at', 'city', 'distance', 'is_favorite']
        read_only_fields = ['id', 'seller', 'slug', 'created_at', 'updated_at']

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.city and obj.city:
            return haversine_distance(request.user.city, obj.city)
        return None

    def get_is_favorite(self, obj):
        if hasattr(obj, 'is_favorite_annotated'):
            return obj.is_favorite_annotated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        # Авто-генерація slug
        from django.utils.text import slugify
        import uuid
        validated_data['slug'] = slugify(validated_data['name']) + '-' + str(uuid.uuid4())[:8]
        return super().create(validated_data)


class ProductImageUploadSerializer(serializers.ModelSerializer):
    """Завантаження фото до товару"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']
