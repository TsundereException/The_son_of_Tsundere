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
        user = self.context['request'].user
        seller_id = None
        
        for item in items:
            try:
                product = Product.objects.get(pk=item['product_id'], is_active=True)
                if product.seller == user:
                    raise serializers.ValidationError(f'Ви не можете замовити власний товар «{product.name}»')
                
                if seller_id is None:
                    seller_id = product.seller_id
                elif product.seller_id != seller_id:
                    raise serializers.ValidationError('Всі товари в одному замовленні повинні належати одному продавцю.')
                
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
        fields = ['id', 'status', 'total', 'address', 'comment', 'delivery_provider', 'tracking_number', 'expires_at',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total', 'created_at', 'updated_at', 'tracking_number', 'expires_at']


class OrderSafeCreateSerializer(OrderCreateSerializer):
    """Створення безпечного замовлення (Аналог OLX Доставка)"""
    delivery_provider = serializers.CharField()
    card_number = serializers.CharField(write_only=True)

    def validate_items(self, items):
        validated = super().validate_items(items)
        # Перевірка, чи всі товари підтримують безпечну угоду
        for item in validated:
            if not item['product'].is_safe_deal_enabled:
                raise serializers.ValidationError(f"Товар «{item['product'].name}» не підтримує безпечну доставку.")
        return validated

    def create(self, validated_data):
        from apps.orders.services import PaymentService
        from datetime import timedelta
        from django.utils import timezone

        buyer = self.context['request'].user
        items = validated_data['items']
        delivery_provider = validated_data['delivery_provider']
        card_number = validated_data.pop('card_number')

        total = sum(i['product'].price * i['quantity'] for i in items)

        # 1. Холдуємо кошти на картці покупця
        hold_id = PaymentService.hold_funds(card_number, float(total))

        # 2. Створюємо замовлення
        order = Order.objects.create(
            buyer=buyer,
            address=validated_data['address'],
            comment=validated_data.get('comment', ''),
            total=total,
            status='payment_held',
            delivery_provider=delivery_provider,
            payment_hold_id=hold_id,
            expires_at=timezone.now() + timedelta(hours=48)
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
