from django.contrib import admin
from .models import Category, Product, ProductImage, Review, FilterAttribute, FilterOption

class FilterOptionInline(admin.TabularInline):
    model = FilterOption
    extra = 1

@admin.register(FilterAttribute)
class FilterAttributeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'type', 'order']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('categories',)
    inlines = [FilterOptionInline]

@admin.register(FilterOption)
class FilterOptionAdmin(admin.ModelAdmin):
    list_display = ['attribute', 'value', 'extra', 'order']
    list_filter = ['attribute']
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['name', 'seller', 'category', 'price', 'stock', 'is_active', 'created_at']
    list_filter   = ['is_active', 'category']
    search_fields = ['name', 'seller__username']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'buyer', 'rating', 'created_at']
    list_filter  = ['rating']
