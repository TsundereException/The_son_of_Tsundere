import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from rest_framework.test import APIClient
from apps.users.models import User
c = APIClient()
user = User.objects.get(email='admin@gmail.com')
c.force_authenticate(user=user)
resp = c.post('/api/v1/auth/admin/categories/', {'name': 'test', 'slug': 'test'}, format='json')
print('STATUS:', resp.status_code)
try:
    print('CONTENT JSON:', resp.json())
except Exception:
    pass
