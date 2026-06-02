from rest_framework.test import APITestCase

from apps.products.models import Category, Product
from apps.users.models import User


class ChatSafetyTests(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', email='buyer@example.com', password='pass12345')
        self.seller = User.objects.create_user(username='seller', email='seller@example.com', password='pass12345')
        self.other_seller = User.objects.create_user(username='seller2', email='seller2@example.com', password='pass12345')
        self.category = Category.objects.create(name='Тест', slug='chat-test')
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name='Тестовий товар',
            slug='chat-product',
            description='Достатньо довгий опис',
            price='100.00',
            stock=1,
            is_active=True,
        )
        self.client.force_authenticate(self.buyer)

    def test_rejects_self_conversation(self):
        response = self.client.post('/api/v1/chat/create/', {
            'seller_id': self.buyer.id,
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_rejects_product_seller_mismatch(self):
        response = self.client.post('/api/v1/chat/create/', {
            'seller_id': self.other_seller.id,
            'product_id': self.product.id,
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_rejects_blank_initial_message(self):
        response = self.client.post('/api/v1/chat/create/', {
            'seller_id': self.seller.id,
            'product_id': self.product.id,
            'initial_message': '   ',
        }, format='json')

        self.assertEqual(response.status_code, 400)
