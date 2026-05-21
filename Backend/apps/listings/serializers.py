from rest_framework import serializers
from .models import Listing
from apps.users.serializers import UserSerializer
from apps.products.serializers import CategorySerializer


class ListingSerializer(serializers.ModelSerializer):
    seller   = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.products.models', fromlist=['Category']).Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price',
            'photo', 'avatar', 'status',
            'seller', 'category', 'category_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class ListingListSerializer(serializers.ModelSerializer):
    """Короткий варіант для списку"""
    seller_name  = serializers.CharField(source='seller.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Listing
        fields = ['id', 'title', 'price', 'photo', 'avatar',
                  'status', 'seller_name', 'category_name', 'created_at']