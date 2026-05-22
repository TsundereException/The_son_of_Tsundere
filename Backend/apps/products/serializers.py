from rest_framework import serializers
from .models import Category, Product, ProductImage, Review
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'children']
        read_only_fields = ['slug']

    def get_children(self, obj):
        kids = obj.children.all()
        return CategorySerializer(kids, many=True).data if kids else []

    def create(self, validated_data):
        from django.utils.text import slugify
        import uuid
        validated_data['slug'] = slugify(validated_data['name']) + '-' + str(uuid.uuid4())[:6]
        return super().create(validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']


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
    main_image = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()
    seller     = serializers.StringRelatedField()
    category   = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'stock',
                  'main_image', 'avg_rating', 'seller', 'category']


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

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'attributes', 'price', 'stock',
                  'is_active', 'seller', 'category', 'category_id',
                  'images', 'reviews', 'avg_rating', 'created_at', 'updated_at']
        read_only_fields = ['id', 'seller', 'slug', 'created_at', 'updated_at']

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
