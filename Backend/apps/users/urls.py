from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, ProfileView, ChangePasswordView
from .admin_views import (
    AdminStatsAPIView, AdminUserListView, AdminUserDetailView,
    AdminProductListView, AdminProductDetailView,
    AdminProductListView, AdminProductDetailView,
    AdminCategoryListView, AdminCategoryDetailView,
    AdminSettingsAPIView, AdminOrderListView, AdminOrderDetailView,
    AdminReportListView, AdminReportDetailView,
    AdminReviewListView, AdminReviewDetailView
)

urlpatterns = [
    path('register/',        RegisterView.as_view(),       name='register'),
    path('login/',           LoginView.as_view(),           name='login'),
    path('logout/',          LogoutView.as_view(),          name='logout'),
    path('token/refresh/',   TokenRefreshView.as_view(),    name='token-refresh'),
    path('profile/',         ProfileView.as_view(),         name='profile'),
    path('change-password/', ChangePasswordView.as_view(),  name='change-password'),
    path('admin/stats/',     AdminStatsAPIView.as_view(),   name='admin-stats'),
    path('admin/users/',     AdminUserListView.as_view(),   name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/products/',  AdminProductListView.as_view(), name='admin-products'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/categories/', AdminCategoryListView.as_view(), name='admin-categories'),
    path('admin/categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('admin/reports/<int:pk>/', AdminReportDetailView.as_view(), name='admin-report-detail'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-reviews'),
    path('admin/reviews/<int:pk>/', AdminReviewDetailView.as_view(), name='admin-review-detail'),
    path('admin/settings/', AdminSettingsAPIView.as_view(), name='admin-settings'),
]
