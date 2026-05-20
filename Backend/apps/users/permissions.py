from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    """Дозволяє доступ лише продавцям"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'seller'


class IsOwnerOrReadOnly(BasePermission):
    """Редагування дозволено лише власнику обʼєкта"""
    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return obj == request.user or getattr(obj, 'seller', None) == request.user
