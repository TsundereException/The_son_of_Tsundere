from django.urls import path
from .views import (
    CategoryListView, CategoryCreateView, CategoryDetailView,
    ProductListView, ProductCreateView, ProductDetailView,
    MyProductsView, ProductImageUploadView, ProductImageDeleteView, ReviewCreateView,
    FiltersConfigView, CitiesListView, FavoriteToggleView, FavoriteListView
)

urlpatterns = [
    # Категорії
    path('categories/',          CategoryListView.as_view(),   name='category-list'),
    path('categories/create/',   CategoryCreateView.as_view(), name='category-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # Фільтри
    path('filters-config/',      FiltersConfigView.as_view(),  name='filters-config'),

    # Міста
    path('cities/',              CitiesListView.as_view(),     name='cities-list'),

    # Товари
    path('',                     ProductListView.as_view(),        name='product-list'),
    path('favorites/',           FavoriteListView.as_view(),       name='favorite-list'),
    path('create/',              ProductCreateView.as_view(),      name='product-create'),
    path('my/',                  MyProductsView.as_view(),         name='my-products'),
    path('<int:pk>/favorite/',   FavoriteToggleView.as_view(),     name='favorite-toggle'),
    path('images/<int:pk>/',     ProductImageDeleteView.as_view(), name='product-image-delete'),
    path('<str:slug>/',          ProductDetailView.as_view(),      name='product-detail'),
    path('<int:pk>/images/',     ProductImageUploadView.as_view(), name='product-images'),
    path('<str:slug>/reviews/', ReviewCreateView.as_view(),       name='review-create'),
]