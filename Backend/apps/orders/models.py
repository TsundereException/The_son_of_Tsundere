from django.db import models
from apps.users.models import User
from apps.products.models import Product


class Order(models.Model):
    STATUSES = [
        ('pending',   'Очікує оплати'),
        ('paid',      'Оплачено'),
        ('shipped',   'Відправлено'),
        ('delivered', 'Доставлено'),
        ('cancelled', 'Скасовано'),
    ]

    buyer      = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name='orders', verbose_name='Покупець')
    status     = models.CharField(max_length=20, choices=STATUSES,
                                  default='pending', verbose_name='Статус')
    total      = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сума')
    address    = models.TextField(verbose_name='Адреса доставки')
    comment    = models.TextField(blank=True, verbose_name='Коментар')
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
