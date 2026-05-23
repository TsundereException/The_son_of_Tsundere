from django.urls import path
from .views import (
    OrderListView, OrderCreateView, OrderDetailView, OrderCancelView,
    OrderSafeCreateView, SellerOrderApproveView, SellerOrderRejectView, DeliveryWebhookView
)

urlpatterns = [
    path('',              OrderListView.as_view(),   name='order-list'),
    path('create/',       OrderCreateView.as_view(),  name='order-create'),
    path('safe-buy/',     OrderSafeCreateView.as_view(), name='order-safe-buy'),
    path('<int:pk>/',     OrderDetailView.as_view(),  name='order-detail'),
    path('<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    
    path('<int:pk>/approve/', SellerOrderApproveView.as_view(), name='order-approve'),
    path('<int:pk>/reject/',  SellerOrderRejectView.as_view(),  name='order-reject'),
    
    path('webhook/delivery/', DeliveryWebhookView.as_view(), name='webhook-delivery'),
]
