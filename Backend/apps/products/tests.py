from rest_framework.test import APITestCase

from apps.products.models import Category, Product
from apps.users.models import User


class ProductSafetyTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='seller', email='seller@example.com', password='pass12345')
        self.category = Category.objects.create(name='Тест', slug='product-test')
        self.client.force_authenticate(self.user)

    def test_rejects_invalid_product_payload(self):
        response = self.client.post('/api/v1/products/create/', {
            'name': 'ab',
            'category_id': self.category.id,
            'description': 'short',
            'price': -1,
            'stock': 1,
            'attributes': [],
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_free_product_normalizes_price(self):
        response = self.client.post('/api/v1/products/create/', {
            'name': 'Безкоштовний товар',
            'category_id': self.category.id,
            'description': 'Достатньо довгий опис товару',
            'price': 100,
            'stock': 1,
            'is_free': True,
            'attributes': {},
        }, format='json')

        self.assertEqual(response.status_code, 201)
        product = Product.objects.get(pk=response.data['id'])
        self.assertEqual(product.price, 0)
        self.assertFalse(product.is_negotiable)

    def test_rejects_category_cycle(self):
        parent = Category.objects.create(name='Parent', slug='parent')
        child = Category.objects.create(name='Child', slug='child', parent=parent)
        self.user.role = 'admin'
        self.user.save(update_fields=['role'])

        response = self.client.patch(f'/api/v1/products/categories/{parent.id}/', {
            'parent': child.id,
        }, format='json')

        self.assertEqual(response.status_code, 400)
