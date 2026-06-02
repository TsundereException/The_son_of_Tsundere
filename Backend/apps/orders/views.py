from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import F

from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.products.models import Product


def _restore_order_stock(order):
    for item in order.items.select_related('product').all():
        if item.product_id:
            Product.objects.filter(pk=item.product_id).update(stock=F('stock') + item.quantity)


class OrderListView(generics.ListAPIView):
    """GET /api/v1/orders/ — мої замовлення або продажі"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role', 'buyer')
        if role == 'seller':
            return Order.objects.filter(items__product__seller=self.request.user).select_related('buyer').prefetch_related('items__product__seller').distinct()
        return Order.objects.filter(buyer=self.request.user).select_related('buyer').prefetch_related('items__product__seller')


class OrderCreateView(APIView):
    """POST /api/v1/orders/create/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/v1/orders/<id>/"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)


class OrderCancelView(APIView):
    """POST /api/v1/orders/<id>/cancel/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення не знайдено'}, status=404)

        if order.status != 'pending':
            return Response({'detail': 'Неможливо скасувати замовлення з таким статусом'}, status=400)

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status != 'pending':
                return Response({'detail': 'Неможливо скасувати замовлення з таким статусом'}, status=400)
            order.status = 'cancelled'
            order.save(update_fields=['status', 'updated_at'])
            _restore_order_stock(order)

        return Response(OrderSerializer(order).data)

from .serializers import OrderSafeCreateSerializer
from apps.orders.services import PaymentService, LogisticsService
from rest_framework.permissions import AllowAny

class OrderSafeCreateView(APIView):
    """POST /api/v1/orders/safe-buy/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSafeCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerOrderApproveView(APIView):
    """POST /api/v1/orders/<id>/approve/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            # Тільки продавець може підтвердити
            order = Order.objects.get(pk=pk, items__product__seller=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення не знайдено або ви не є продавцем'}, status=404)

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status != 'payment_held':
                return Response({'detail': 'Замовлення не в статусі очікування'}, status=400)

            # В реальності потрібно брати міста відправника і отримувача
            ttn = LogisticsService.create_ttn(order.delivery_provider or 'nova_poshta', 'Київ', 'Львів', 1.0)
            order.tracking_number = ttn
            order.status = 'seller_pending'
            order.save(update_fields=['tracking_number', 'status', 'updated_at'])

        return Response(OrderSerializer(order).data)

class SellerOrderRejectView(APIView):
    """POST /api/v1/orders/<id>/reject/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, items__product__seller=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення не знайдено або ви не є продавцем'}, status=404)

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status != 'payment_held':
                return Response({'detail': 'Замовлення не в статусі очікування'}, status=400)

            if order.payment_hold_id:
                PaymentService.release_funds(order.payment_hold_id)

            order.status = 'cancelled'
            order.save(update_fields=['status', 'updated_at'])
            _restore_order_stock(order)

        return Response(OrderSerializer(order).data)

class DeliveryWebhookView(APIView):
    """POST /api/v1/orders/webhook/delivery/"""
    permission_classes = [AllowAny]

    def post(self, request):
        from django.conf import settings
        
        expected_secret = getattr(settings, 'LOGISTICS_WEBHOOK_SECRET', None)
        provided_secret = request.headers.get('X-Webhook-Secret')

        if not expected_secret or provided_secret != expected_secret:
            return Response({'detail': 'Invalid or missing webhook secret'}, status=status.HTTP_403_FORBIDDEN)

        ttn = request.data.get('tracking_number')
        new_status = request.data.get('status') # 'received' or 'refused'

        if new_status not in ('received', 'refused'):
            return Response({'detail': 'Невідомий статус доставки'}, status=400)

        try:
            order = Order.objects.get(tracking_number=ttn)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення з такою ТТН не знайдено'}, status=404)

        if order.status not in ('seller_pending', 'shipped', 'delivered'):
            return Response({'detail': 'Неможливо змінити доставку для поточного статусу'}, status=400)

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status not in ('seller_pending', 'shipped', 'delivered'):
                return Response({'detail': 'Неможливо змінити доставку для поточного статусу'}, status=400)

            if new_status == 'received':
                order.status = 'completed'
                seller = order.items.select_related('product__seller').first().product.seller
                payout_card = seller.payout_card if seller.payout_card else "0000 0000 0000 0000"
                commission = float(order.total) * 0.05
                amount_to_seller = float(order.total) - commission

                if order.payment_hold_id:
                    PaymentService.capture_funds(order.payment_hold_id, payout_card, amount_to_seller, commission)

            elif new_status == 'refused':
                order.status = 'returned'
                if order.payment_hold_id:
                    PaymentService.release_funds(order.payment_hold_id)
                _restore_order_stock(order)

            order.save(update_fields=['status', 'updated_at'])
        return Response({'detail': 'Оновлено'})
