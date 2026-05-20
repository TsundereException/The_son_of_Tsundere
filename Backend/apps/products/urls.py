from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductCreateView,
    ProductDetailView, MyProductsView,
    ProductImageUploadView, ReviewCreateView
)

urlpatterns = [
    path('',                           ProductListView.as_view(),        name='product-list'),
    path('create/',                    ProductCreateView.as_view(),      name='product-create'),
    path('my/',                        MyProductsView.as_view(),         name='my-products'),
    path('categories/',                CategoryListView.as_view(),       name='category-list'),
    path('<slug:slug>/',               ProductDetailView.as_view(),      name='product-detail'),
    path('<int:pk>/images/',           ProductImageUploadView.as_view(), name='product-images'),
    path('<slug:slug>/reviews/',       ReviewCreateView.as_view(),       name='review-create'),
]
