from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderListView(generics.ListAPIView):
    """GET /api/v1/orders/ — мої замовлення або продажі"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role', 'buyer')
        if role == 'seller':
            return Order.objects.filter(items__product__seller=self.request.user).prefetch_related('items__product').distinct()
        return Order.objects.filter(buyer=self.request.user).prefetch_related('items__product')


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

        if order.status not in ('pending', 'paid'):
            return Response({'detail': 'Неможливо скасувати замовлення з таким статусом'}, status=400)

        order.status = 'cancelled'
        order.save()

        # Повертаємо товари на склад
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()

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

        if order.status != 'payment_held':
            return Response({'detail': 'Замовлення не в статусі очікування'}, status=400)

        # Генеруємо ТТН
        # В реальності потрібно брати міста відправника і отримувача
        ttn = LogisticsService.create_ttn(order.delivery_provider or 'nova_poshta', 'Київ', 'Львів', 1.0)
        
        order.tracking_number = ttn
        order.status = 'seller_pending'
        order.save()

        return Response(OrderSerializer(order).data)

class SellerOrderRejectView(APIView):
    """POST /api/v1/orders/<id>/reject/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, items__product__seller=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення не знайдено або ви не є продавцем'}, status=404)

        if order.status != 'payment_held':
            return Response({'detail': 'Замовлення не в статусі очікування'}, status=400)

        # Відміняємо холдування
        if order.payment_hold_id:
            PaymentService.release_funds(order.payment_hold_id)

        order.status = 'cancelled'
        order.save()

        # Повертаємо сток
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()

        return Response(OrderSerializer(order).data)

class DeliveryWebhookView(APIView):
    """POST /api/v1/orders/webhook/delivery/"""
    permission_classes = [AllowAny]

    def post(self, request):
        from django.conf import settings
        
        expected_secret = getattr(settings, 'LOGISTICS_WEBHOOK_SECRET', 'default-insecure-secret')
        provided_secret = request.headers.get('X-Webhook-Secret')

        if provided_secret != expected_secret:
            return Response({'detail': 'Invalid or missing webhook secret'}, status=status.HTTP_403_FORBIDDEN)

        ttn = request.data.get('tracking_number')
        new_status = request.data.get('status') # 'received' or 'refused'

        try:
            order = Order.objects.get(tracking_number=ttn)
        except Order.DoesNotExist:
            return Response({'detail': 'Замовлення з такою ТТН не знайдено'}, status=404)

        if new_status == 'received':
            order.status = 'completed'
            # Знімаємо кошти на користь продавця
            # Беремо картку продавця (перший товар, всі товари від одного продавця)
            seller = order.items.first().product.seller
            payout_card = seller.payout_card if seller.payout_card else "0000 0000 0000 0000"
            commission = float(order.total) * 0.05 # 5%
            amount_to_seller = float(order.total) - commission
            
            if order.payment_hold_id:
                PaymentService.capture_funds(order.payment_hold_id, payout_card, amount_to_seller, commission)
                
        elif new_status == 'refused':
            order.status = 'returned'
            if order.payment_hold_id:
                PaymentService.release_funds(order.payment_hold_id)
            
            # Повертаємо сток
            for item in order.items.all():
                item.product.stock += item.quantity
                item.product.save()

        order.save()
        return Response({'detail': 'Оновлено'})
