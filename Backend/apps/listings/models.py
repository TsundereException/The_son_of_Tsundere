from django.db import models
from apps.users.models import User
from apps.products.models import Category


class Listing(models.Model):
    STATUS = [
        ('active',   'Активне'),
        ('inactive', 'Неактивне'),
        ('sold',     'Продано'),
    ]

    seller      = models.ForeignKey(User, on_delete=models.CASCADE,
                                    related_name='listings', verbose_name='Продавець')
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                    null=True, related_name='listings', verbose_name='Категорія')
    title       = models.CharField(max_length=200, verbose_name='Назва')
    description = models.TextField(verbose_name='Опис')
    price       = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Ціна')
    city        = models.CharField(max_length=50, blank=True, verbose_name='Місто')
    photo       = models.CharField(max_length=255, blank=True, verbose_name='Фото')
    avatar      = models.CharField(max_length=255, blank=True, verbose_name='Аватар оголошення')
    status      = models.CharField(max_length=10, choices=STATUS,
                                   default='active', verbose_name='Статус')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Оголошення'
        verbose_name_plural = 'Оголошення'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — {self.seller}'