from django.db import models
from apps.users.models import User
from apps.products.models import Product


class Order(models.Model):
    STATUSES = [
        ('pending',   'Очікує оплати'),
        ('payment_held', 'Кошти зарезервовано (Очікує продавця)'),
        ('seller_pending', 'Очікує відправки (ТТН згенеровано)'),
        ('shipped',   'Відправлено (В дорозі)'),
        ('delivered', 'Доставлено у відділення'),
        ('completed', 'Угода завершена (Отримано)'),
        ('returned',  'Повернення (Покупець відмовився)'),
        ('cancelled', 'Скасовано'),
        ('cancelled_by_timeout', 'Скасовано (Продавець не відправив)'),
    ]

    buyer      = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name='orders', verbose_name='Покупець')
    status     = models.CharField(max_length=30, choices=STATUSES,
                                  default='pending', verbose_name='Статус')
    total      = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')
    address    = models.TextField(verbose_name='Адреса доставки')
    comment    = models.TextField(blank=True, verbose_name='Коментар')
    
    # Safe Deal / Delivery fields
    delivery_provider = models.CharField(max_length=50, blank=True, default='', verbose_name='Служба доставки')
    tracking_number   = models.CharField(max_length=100, blank=True, default='', verbose_name='ТТН')
    payment_hold_id   = models.CharField(max_length=255, blank=True, default='', verbose_name='ID холдування коштів')
    expires_at        = models.DateTimeField(blank=True, null=True, verbose_name='Дійсне до')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Замовлення'
        verbose_name_plural = 'Замовлення'
        ordering = ['-created_at']

    def __str__(self):
        return f'Замовлення #{self.pk} — {self.buyer}'


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE,
                                 related_name='items', verbose_name='Замовлення')
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL,
                                 null=True, verbose_name='Товар')
    quantity = models.PositiveIntegerField(verbose_name='Кількість')
    price    = models.DecimalField(max_digits=10, decimal_places=2,
                                   verbose_name='Ціна на момент замовлення')

    class Meta:
        verbose_name = 'Позиція замовлення'
        verbose_name_plural = 'Позиції замовлення'

    def __str__(self):
        return f'{self.product} × {self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
