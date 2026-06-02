from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from .models import Listing
from apps.users.serializers import UserSerializer
from apps.products.serializers import CategorySerializer
from apps.users.cities import haversine_distance
from apps.products.models import Category

class ListingSerializer(serializers.ModelSerializer):
    seller   = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price',
            'photo', 'avatar', 'status',
            'seller', 'category', 'category_id',
            'city', 'distance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']

    def validate_title(self, value):
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

    def validate_price(self, value):
        try:
            if Decimal(value) < 0:
                raise serializers.ValidationError('Ціна не може бути відʼємною')
        except (InvalidOperation, TypeError):
            raise serializers.ValidationError('Некоректна ціна')
        return value

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.city and obj.city:
            return haversine_distance(request.user.city, obj.city)
        return None

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class ListingListSerializer(serializers.ModelSerializer):
    """Короткий варіант для списку"""
    seller_name  = serializers.CharField(source='seller.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = ['id', 'title', 'price', 'photo', 'avatar',
                  'status', 'seller_name', 'category_name', 'city', 'distance', 'created_at']

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.city and obj.city:
            return haversine_distance(request.user.city, obj.city)
        return None
