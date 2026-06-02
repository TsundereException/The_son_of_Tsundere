from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product
from apps.users.serializers import UserSerializer


ALLOWED_DELIVERY_PROVIDERS = {'nova_poshta', 'ukrposhta'}


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal     = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price']


class OrderCreateSerializer(serializers.Serializer):
    """Створення замовлення: список товарів + адреса"""
    address = serializers.CharField(trim_whitespace=True, min_length=5, max_length=500)
    comment = serializers.CharField(required=False, allow_blank=True, trim_whitespace=True, max_length=1000)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_items(self, items):
        validated = []
        user = self.context['request'].user
        seller_id = None
        seen_product_ids = set()
        
        for item in items:
            product_id = item.get('product_id')
            if product_id in (None, ''):
                raise serializers.ValidationError('product_id обовʼязковий для кожної позиції')
            if product_id in seen_product_ids:
                raise serializers.ValidationError('Один товар не можна дублювати в одному замовленні')
            seen_product_ids.add(product_id)

            try:
                qty = int(item.get('quantity'))
            except (TypeError, ValueError):
                raise serializers.ValidationError('Кількість має бути цілим числом')

            if qty <= 0:
                raise serializers.ValidationError('Кількість має бути більше 0')

            try:
                product = Product.objects.get(pk=product_id, is_active=True)
                if product.seller == user:
                    raise serializers.ValidationError(f'Ви не можете замовити власний товар «{product.name}»')
                
                if seller_id is None:
                    seller_id = product.seller_id
                elif product.seller_id != seller_id:
                    raise serializers.ValidationError('Всі товари в одному замовленні повинні належати одному продавцю.')
                
                if product.stock < qty:
                    raise serializers.ValidationError(
                        f'Недостатньо товару «{product.name}» на складі'
                    )
                validated.append({'product': product, 'quantity': qty})
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'Товар {product_id} не знайдено')
        return validated

    def _create_order(self, validated_data, **order_kwargs):
        buyer = self.context['request'].user
        product_ids = [item['product'].id for item in validated_data['items']]
        locked_products = Product.objects.select_for_update().filter(
            id__in=product_ids,
            is_active=True,
        ).in_bulk()
        items = []

        for item in validated_data['items']:
            product = locked_products.get(item['product'].id)
            if not product:
                raise serializers.ValidationError({'items': f'Товар {item["product"].id} не знайдено'})
            if product.stock < item['quantity']:
                raise serializers.ValidationError({'items': f'Недостатньо товару «{product.name}» на складі'})
            items.append({'product': product, 'quantity': item['quantity']})

        total = sum(i['product'].price * i['quantity'] for i in items)
        order = Order.objects.create(
            buyer=buyer,
            address=validated_data['address'],
            comment=validated_data.get('comment', ''),
            total=total,
            **order_kwargs,
        )

        for item in items:
            product = item['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price,
            )
            Product.objects.filter(pk=product.pk).update(stock=F('stock') - item['quantity'])

        return order

    def create(self, validated_data):
        with transaction.atomic():
            return self._create_order(validated_data)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer = UserSerializer(read_only=True)
    seller = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'seller', 'status', 'total', 'address', 'comment', 'delivery_provider', 'tracking_number', 'expires_at',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total', 'created_at', 'updated_at', 'tracking_number', 'expires_at']

    def get_seller(self, obj):
        first_item = obj.items.select_related('product__seller').first()
        if not first_item or not first_item.product:
            return None
        return UserSerializer(first_item.product.seller).data


class OrderSafeCreateSerializer(OrderCreateSerializer):
    """Створення безпечного замовлення (Аналог OLX Доставка)"""
    delivery_provider = serializers.CharField(trim_whitespace=True, max_length=50)
    card_number = serializers.CharField(write_only=True, trim_whitespace=True, min_length=12, max_length=19)

    def validate_delivery_provider(self, value):
        if value not in ALLOWED_DELIVERY_PROVIDERS:
            raise serializers.ValidationError('Невідома служба доставки')
        return value

    def validate_card_number(self, value):
        digits = ''.join(ch for ch in value if ch.isdigit())
        if len(digits) < 12 or len(digits) > 19:
            raise serializers.ValidationError('Номер картки має містити від 12 до 19 цифр')
        return digits

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

        delivery_provider = validated_data['delivery_provider']
        card_number = validated_data.pop('card_number')

        total = sum(i['product'].price * i['quantity'] for i in validated_data['items'])

        # 1. Холдуємо кошти на картці покупця
        hold_id = PaymentService.hold_funds(card_number, float(total))

        try:
            with transaction.atomic():
                return self._create_order(
                    validated_data,
                    status='payment_held',
                    delivery_provider=delivery_provider,
                    payment_hold_id=hold_id,
                    expires_at=timezone.now() + timedelta(hours=48),
                )
        except Exception:
            PaymentService.release_funds(hold_id)
            raise
