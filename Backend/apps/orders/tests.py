from django.test import override_settings
from rest_framework.test import APITestCase

from apps.orders.models import Order
from apps.products.models import Category, Product
from apps.users.models import User


class OrderCreateSafetyTests(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', email='buyer@example.com', password='pass12345')
        self.seller = User.objects.create_user(username='seller', email='seller@example.com', password='pass12345')
        self.other_seller = User.objects.create_user(username='seller2', email='seller2@example.com', password='pass12345')
        self.category = Category.objects.create(name='Тест', slug='test')
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name='Тестовий товар',
            slug='test-product',
            description='Достатньо довгий опис',
            price='100.00',
            stock=1,
            is_active=True,
        )
        self.client.force_authenticate(self.buyer)

    def test_rejects_missing_product_id(self):
        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [{'quantity': 1}],
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_rejects_duplicate_items(self):
        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [
                {'product_id': self.product.id, 'quantity': 1},
                {'product_id': self.product.id, 'quantity': 1},
            ],
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_rejects_out_of_stock_and_keeps_stock(self):
        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [{'product_id': self.product.id, 'quantity': 2}],
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_create_decrements_stock_and_cancel_restores_once(self):
        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [{'product_id': self.product.id, 'quantity': 1}],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)

        cancel_response = self.client.post(f'/api/v1/orders/{response.data["id"]}/cancel/')
        self.assertEqual(cancel_response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

        second_cancel = self.client.post(f'/api/v1/orders/{response.data["id"]}/cancel/')
        self.assertEqual(second_cancel.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_rejects_own_product(self):
        own = Product.objects.create(
            seller=self.buyer,
            category=self.category,
            name='Свій товар',
            slug='own-product',
            description='Достатньо довгий опис',
            price='10.00',
            stock=1,
            is_active=True,
        )

        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [{'product_id': own.id, 'quantity': 1}],
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_rejects_mixed_sellers(self):
        other_product = Product.objects.create(
            seller=self.other_seller,
            category=self.category,
            name='Інший товар',
            slug='other-product',
            description='Достатньо довгий опис',
            price='20.00',
            stock=1,
            is_active=True,
        )

        response = self.client.post('/api/v1/orders/create/', {
            'address': 'Київ, відділення 1',
            'items': [
                {'product_id': self.product.id, 'quantity': 1},
                {'product_id': other_product.id, 'quantity': 1},
            ],
        }, format='json')

        self.assertEqual(response.status_code, 400)

    @override_settings(LOGISTICS_WEBHOOK_SECRET=None)
    def test_delivery_webhook_requires_configured_secret(self):
        order = Order.objects.create(
            buyer=self.buyer,
            status='seller_pending',
            total='100.00',
            address='Київ, відділення 1',
            tracking_number='2045000000001',
        )
        order.items.create(product=self.product, quantity=1, price=self.product.price)
        self.client.force_authenticate(user=None)

        response = self.client.post('/api/v1/orders/webhook/delivery/', {
            'tracking_number': order.tracking_number,
            'status': 'received',
        }, format='json')

        self.assertEqual(response.status_code, 403)
