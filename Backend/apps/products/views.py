from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product, ProductImage, Review
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductImageUploadSerializer, ReviewSerializer
)
from apps.users.permissions import IsSeller, IsOwnerOrReadOnly


class CategoryListView(generics.ListAPIView):
    """GET /api/v1/products/categories/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryCreateView(generics.CreateAPIView):
    """POST /api/v1/products/categories/create/ — тільки адмін"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Тільки адміністратор може створювати категорії')
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/products/categories/<id>/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE') and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Тільки адміністратор може редагувати категорії')


class ProductListView(generics.ListAPIView):
    """GET /api/v1/products/ — список з фільтрами та пошуком"""
    queryset = Product.objects.filter(is_active=True).select_related('seller', 'category')
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'seller']
    search_fields    = ['name', 'description']
    ordering_fields  = ['price', 'created_at']
    ordering         = ['-created_at']


class ProductCreateView(generics.CreateAPIView):
    """POST /api/v1/products/create/ — лише для продавців"""
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticated, IsSeller]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/products/<slug>/"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]


class MyProductsView(generics.ListAPIView):
    """GET /api/v1/products/my/ — товари поточного продавця"""
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)


class ProductImageUploadView(APIView):
    """POST /api/v1/products/<id>/images/ — завантаження фото"""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsSeller]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk, seller=request.user)
        serializer = ProductImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/v1/products/<slug>/reviews/"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs['slug'])
        serializer.save(buyer=self.request.user, product=product)
