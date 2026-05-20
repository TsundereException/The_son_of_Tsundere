from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal     = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price']


class OrderCreateSerializer(serializers.Serializer):
    """Створення замовлення: список товарів + адреса"""
    address = serializers.CharField()
    comment = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_items(self, items):
        validated = []
        for item in items:
            try:
                product = Product.objects.get(pk=item['product_id'], is_active=True)
                qty = int(item['quantity'])
                if qty <= 0:
                    raise serializers.ValidationError('Кількість має бути більше 0')
                if product.stock < qty:
                    raise serializers.ValidationError(
                        f'Недостатньо товару «{product.name}» на складі'
                    )
                validated.append({'product': product, 'quantity': qty})
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'Товар {item.get("product_id")} не знайдено')
        return validated

    def create(self, validated_data):
        buyer = self.context['request'].user
        items = validated_data['items']

        total = sum(i['product'].price * i['quantity'] for i in items)

        order = Order.objects.create(
            buyer=buyer,
            address=validated_data['address'],
            comment=validated_data.get('comment', ''),
            total=total,
        )

        for item in items:
            product = item['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price,
            )
            # Зменшуємо залишок на складі
            product.stock -= item['quantity']
            product.save()

        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'address', 'comment',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total', 'created_at', 'updated_at']
