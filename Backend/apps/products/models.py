from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


class Category(models.Model):
    name   = models.CharField(max_length=100, verbose_name='Назва')
    slug   = models.SlugField(unique=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='children'
    )

    class Meta:
        verbose_name = 'Категорія'
        verbose_name_plural = 'Категорії'

    def __str__(self):
        return self.name


class Product(models.Model):
    seller      = models.ForeignKey(User, on_delete=models.CASCADE,
                                    related_name='products', verbose_name='Продавець')
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                    null=True, related_name='products', verbose_name='Категорія')
    name        = models.CharField(max_length=200, verbose_name='Назва')
    slug        = models.SlugField(unique=True)
    description = models.TextField(verbose_name='Опис')
    attributes  = models.JSONField(default=dict, blank=True, verbose_name='Характеристики та атрибути')
    price       = models.DecimalField(max_digits=10, decimal_places=2,
                                      validators=[MinValueValidator(0)], verbose_name='Ціна')
    stock       = models.PositiveIntegerField(default=0, verbose_name='Кількість')
    is_active   = models.BooleanField(default=True, verbose_name='Активний')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товари'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def avg_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    @property
    def main_image(self):
        img = self.images.filter(is_main=True).first()
        return img.image.url if img else None


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE,
                                related_name='images', verbose_name='Товар')
    image   = models.ImageField(upload_to='products/', verbose_name='Зображення')
    is_main = models.BooleanField(default=False, verbose_name='Головне фото')

    class Meta:
        verbose_name = 'Фото товару'
        verbose_name_plural = 'Фото товарів'


class Review(models.Model):
    product    = models.ForeignKey(Product, on_delete=models.CASCADE,
                                   related_name='reviews', verbose_name='Товар')
    buyer      = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Покупець')
    rating     = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Рейтинг'
    )
    comment    = models.TextField(blank=True, verbose_name='Коментар')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Відгук'
        verbose_name_plural = 'Відгуки'
        unique_together = ('product', 'buyer')

    def __str__(self):
        return f'{self.buyer} → {self.product} ({self.rating}★)'
