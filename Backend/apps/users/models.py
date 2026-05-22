from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLES = [
        ('buyer',  'Покупець'),
        ('seller', 'Продавець'),
        ('admin',  'Адміністратор'),
    ]

    role       = models.CharField(max_length=10, choices=ROLES, default='buyer')
    phone      = models.CharField(max_length=20, blank=True)
    avatar     = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio        = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Користувач'
        verbose_name_plural = 'Користувачі'

    def __str__(self):
        return self.email or self.username

    @property
    def is_seller(self):
        return self.role == 'seller'

    @property
    def is_buyer(self):
        return self.role == 'buyer'

class SiteSettings(models.Model):
    maintenance_mode = models.BooleanField(default=False, verbose_name="Режим обслуговування")
    platform_commission = models.DecimalField(max_digits=5, decimal_places=2, default=5.00, verbose_name="Комісія платформи (%)")
    support_email = models.EmailField(default="support@tsundere.com", verbose_name="Email підтримки")
    
    class Meta:
        verbose_name = "Налаштування сайту"
        verbose_name_plural = "Налаштування сайту"

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SiteSettings, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass


class Report(models.Model):
    STATUS_CHOICES = (
        ('new', 'Нова'),
        ('resolved', 'Вирішена'),
        ('rejected', 'Відхилена'),
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_sent')
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_received')
    target_product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(verbose_name="Причина скарги")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Скарга"
        verbose_name_plural = "Скарги"
        ordering = ['-created_at']

    def __str__(self):
        return f"Скарга від {self.sender} ({self.status})"

