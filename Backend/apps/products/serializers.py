from rest_framework import serializers
from decimal import Decimal, InvalidOperation
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

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Назва категорії занадто коротка')
        return value

    def validate(self, attrs):
        parent = attrs.get('parent')
        instance = self.instance
        if instance and parent:
            if parent.pk == instance.pk:
                raise serializers.ValidationError({'parent': 'Категорія не може бути власним батьком'})
            current = parent
            while current:
                if current.pk == instance.pk:
                    raise serializers.ValidationError({'parent': 'Категорії не можуть утворювати цикл'})
                current = current.parent
        return attrs

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
                  'is_active', 'is_safe_deal_enabled', 'seller', 'category', 'category_id',
                  'images', 'reviews', 'avg_rating', 'created_at', 'updated_at', 'city', 'distance', 'is_favorite']
        read_only_fields = ['id', 'seller', 'slug', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Назва має містити щонайменше 3 символи')
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Опис має містити щонайменше 10 символів')
        if len(value) > 5000:
            raise serializers.ValidationError('Опис занадто довгий')
        return value

    def validate_city(self, value):
        value = (value or '').strip()
        if len(value) > 50:
            raise serializers.ValidationError('Назва міста занадто довга')
        return value

    def validate_attributes(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Характеристики мають бути обʼєктом')
        if len(value) > 50:
            raise serializers.ValidationError('Забагато характеристик')
        for key, attr_value in value.items():
            if not isinstance(key, str) or not key.replace('_', '').replace('-', '').isalnum():
                raise serializers.ValidationError('Некоректна назва характеристики')
            if isinstance(attr_value, list):
                if len(attr_value) > 20:
                    raise serializers.ValidationError('Забагато значень характеристики')
                if any(len(str(v)) > 100 for v in attr_value):
                    raise serializers.ValidationError('Значення характеристики занадто довге')
            elif len(str(attr_value)) > 100:
                raise serializers.ValidationError('Значення характеристики занадто довге')
        return value

    def validate(self, attrs):
        is_free = attrs.get('is_free', getattr(self.instance, 'is_free', False))
        is_exchange = attrs.get('is_exchange', getattr(self.instance, 'is_exchange', False))
        stock = attrs.get('stock', getattr(self.instance, 'stock', 1))
        price = attrs.get('price', getattr(self.instance, 'price', Decimal('0')))

        if stock < 0:
            raise serializers.ValidationError({'stock': 'Кількість не може бути відʼємною'})
        if is_free and is_exchange:
            raise serializers.ValidationError({'is_exchange': 'Товар не може бути одночасно безкоштовним і на обмін'})
        if is_free or is_exchange:
            attrs['price'] = Decimal('0')
            attrs['is_negotiable'] = False
        else:
            try:
                if Decimal(price) < 0:
                    raise serializers.ValidationError({'price': 'Ціна не може бути відʼємною'})
            except (InvalidOperation, TypeError):
                raise serializers.ValidationError({'price': 'Некоректна ціна'})
        return attrs

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

    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Фото має бути не більше 5MB')
        content_type = getattr(value, 'content_type', '')
        if content_type and content_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif'):
            raise serializers.ValidationError('Дозволені тільки JPEG, PNG, WEBP або GIF')
        return value
