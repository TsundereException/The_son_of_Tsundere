from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from apps.users.models import User, SiteSettings, Report
from apps.products.models import Product, Category, Review
from apps.orders.models import Order, OrderItem
from django.db.models import Sum
from rest_framework import serializers

class IsAdminUserOrRoleAdmin(BasePermission):
    """
    Дозволяє доступ користувачам, які є is_staff, is_superuser АБО мають role='admin'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser or request.user.role == 'admin'))

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'date_joined']

class AdminProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'is_active', 'created_at', 'seller', 'seller_name', 'category', 'category_name']

class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']

    def validate(self, attrs):
        parent = attrs.get('parent')
        instance = self.instance
        if instance and parent:
            if parent.pk == instance.pk:
                raise serializers.ValidationError({'parent': 'Категорія не може бути власним батьком'})
            current = parent
            while current:
                if current.pk == instance.pk:
                    raise serializers.ValidationError({'parent': 'Категорії не можуть утворювати цикл'})
                current = current.parent
        return attrs

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['maintenance_mode', 'platform_commission', 'support_email', 'hide_generated_data']

class AdminSettingsAPIView(APIView):
    permission_classes = [IsAdminUserOrRoleAdmin]

    def get(self, request):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminStatsAPIView(APIView):
    permission_classes = [IsAdminUserOrRoleAdmin]

    def get(self, request):
        total_users = User.objects.count()
        active_listings = Product.objects.filter(is_active=True).count()
        
        successful_orders = Order.objects.filter(status__in=['payment_held', 'seller_pending', 'shipped', 'delivered', 'completed'])
        total_sales = successful_orders.aggregate(Sum('total'))['total__sum'] or 0
        new_visitors = 42 
        
        recent_products = Product.objects.all().order_by('-created_at')[:10]
        recent_listings_data = []
        for p in recent_products:
            recent_listings_data.append({
                'id': p.id,
                'title': p.name,
                'user': p.seller.first_name or p.seller.username,
                'price': f"{p.price} ₴",
                'status': 'Активне' if p.is_active else 'Неактивне',
                'date': p.created_at.strftime("%d.%m.%Y")
            })

        users_by_role = [
            {"name": "Покупці", "value": User.objects.filter(role='buyer').count()},
            {"name": "Продавці", "value": User.objects.filter(role='seller').count()},
            {"name": "Адміни", "value": User.objects.filter(role='admin').count()},
        ]

        orders_by_status = [
            {"name": "Очікують", "value": Order.objects.filter(status='pending').count()},
            {"name": "Кошти зарезервовано", "value": Order.objects.filter(status='payment_held').count()},
            {"name": "Очікують відправки", "value": Order.objects.filter(status='seller_pending').count()},
            {"name": "Відправлені", "value": Order.objects.filter(status='shipped').count()},
            {"name": "Доставлені", "value": Order.objects.filter(status='delivered').count()},
            {"name": "Завершені", "value": Order.objects.filter(status='completed').count()},
            {"name": "Скасовані", "value": Order.objects.filter(status='cancelled').count()},
        ]

        return Response({
            'total_users': total_users,
            'active_listings': active_listings,
            'total_sales': int(total_sales),
            'new_visitors': new_visitors,
            'recent_listings': recent_listings_data,
            'users_by_role': users_by_role,
            'orders_by_status': orders_by_status
        })

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']

class AdminOrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    items = AdminOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_name', 'buyer_email', 'status', 'total', 'address', 'comment', 'created_at', 'items']

class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminCategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminReportSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    target_user_name = serializers.CharField(source='target_user.username', read_only=True)
    target_product_name = serializers.CharField(source='target_product.name', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'sender', 'sender_name', 'target_user', 'target_user_name', 'target_product', 'target_product_name', 'reason', 'status', 'created_at']

class AdminReportListView(generics.ListAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = AdminReportSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminReportDetailView(generics.RetrieveUpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'buyer', 'buyer_name', 'rating', 'comment', 'created_at']

class AdminReviewListView(generics.ListAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]

class AdminReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminUserOrRoleAdmin]
