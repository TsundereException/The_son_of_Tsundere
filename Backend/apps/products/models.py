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
    icon_name = models.CharField(max_length=50, blank=True, null=True, help_text="Назва іконки з lucide-react (напр. 'Smartphone')")
    color = models.CharField(max_length=50, blank=True, null=True, help_text="Колір фону (напр. 'bg-blue-100 text-blue-600')")

    class Meta:
        verbose_name = 'Категорія'
        verbose_name_plural = 'Категорії'

    def __str__(self):
        return self.name


class FilterAttribute(models.Model):
    TYPE_CHOICES = (
        ('checkbox', 'Чекбокси (множинний вибір)'),
        ('radio', 'Радіо-кнопки (одиничний вибір)'),
        ('color', 'Кольори'),
        ('range', 'Діапазон (Від / До)'),
    )
    name = models.CharField(max_length=100, verbose_name='Назва фільтра (напр. Бренд)')
    slug = models.SlugField(unique=True, help_text='Англійською, без пробілів (напр. brand)')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='checkbox', verbose_name='Тип відображення')
    categories = models.ManyToManyField(
        Category, blank=True, related_name='filter_attributes',
        verbose_name='Категорії', help_text='До яких категорій належить цей фільтр'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортування')

    class Meta:
        verbose_name = 'Атрибут фільтра'
        verbose_name_plural = 'Атрибути фільтрів'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class FilterOption(models.Model):
    attribute = models.ForeignKey(FilterAttribute, on_delete=models.CASCADE, related_name='options', verbose_name='Атрибут')
    value = models.CharField(max_length=100, verbose_name='Значення (напр. Apple)')
    extra = models.CharField(max_length=50, blank=True, help_text='Наприклад, HEX код кольору (#000000)')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортування')

    class Meta:
        verbose_name = 'Опція фільтра'
        verbose_name_plural = 'Опції фільтрів'
        ordering = ['attribute', 'order', 'value']

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"
class Product(models.Model):
    seller      = models.ForeignKey(User, on_delete=models.CASCADE,
                                    related_name='products', verbose_name='Продавець')
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                    null=True, related_name='products', verbose_name='Категорія')
    name        = models.CharField(max_length=200, verbose_name='Назва')
    slug        = models.SlugField(unique=True)
    description = models.TextField(verbose_name='Опис')
    city        = models.CharField(max_length=50, blank=True, verbose_name='Місто')
    attributes  = models.JSONField(default=dict, blank=True, verbose_name='Характеристики та атрибути')
    price       = models.DecimalField(max_digits=10, decimal_places=2,
                                      validators=[MinValueValidator(0)], verbose_name='Ціна')
    is_negotiable = models.BooleanField(default=False, verbose_name='Договірна')
    is_free     = models.BooleanField(default=False, verbose_name='Безкоштовно')
    is_exchange = models.BooleanField(default=False, verbose_name='Обмін')
    is_safe_deal_enabled = models.BooleanField(default=True, verbose_name='Безпечна угода (Доставка)')
    stock       = models.PositiveIntegerField(default=1, verbose_name='Кількість')
    is_active   = models.BooleanField(default=True, verbose_name='Активний')
    is_generated = models.BooleanField(default=False, verbose_name='Тестове згенероване оголошення')
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
