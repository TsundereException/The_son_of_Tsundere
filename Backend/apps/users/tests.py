from rest_framework.test import APITestCase

from apps.users.models import User


class AuthSafetyTests(APITestCase):
    def test_register_rejects_duplicate_email_case_insensitive(self):
        User.objects.create_user(username='existing', email='test@example.com', password='pass12345')

        response = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser',
            'email': 'TEST@example.com',
            'password': 'pass12345Strong',
            'password2': 'pass12345Strong',
            'role': 'buyer',
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_register_rejects_admin_role(self):
        response = self.client.post('/api/v1/auth/register/', {
            'username': 'newadmin',
            'email': 'admin-request@example.com',
            'password': 'pass12345Strong',
            'password2': 'pass12345Strong',
            'role': 'admin',
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_profile_update_cannot_escalate_role_or_staff(self):
        user = User.objects.create_user(username='buyer', email='buyer@example.com', password='pass12345', role='buyer')
        self.client.force_authenticate(user)

        response = self.client.patch('/api/v1/auth/profile/', {
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'city': 'Київ',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.role, 'buyer')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.city, 'Київ')
