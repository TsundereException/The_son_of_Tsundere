from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Listing
from .serializers import ListingSerializer, ListingListSerializer
from apps.users.permissions import IsOwnerOrReadOnly


class ListingListView(generics.ListAPIView):
    """GET /api/v1/listings/ — всі активні оголошення"""
    serializer_class = ListingListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'seller']
    search_fields    = ['title', 'description']
    ordering_fields  = ['price', 'created_at']
    ordering         = ['-created_at']

    def get_queryset(self):
        return Listing.objects.filter(status='active').select_related('seller', 'category')


class ListingCreateView(generics.CreateAPIView):
    """POST /api/v1/listings/create/"""
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/listings/<id>/"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]


class MyListingsView(generics.ListAPIView):
    """GET /api/v1/listings/my/ — мої оголошення"""
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)


class ListingStatusUpdateView(APIView):
    """PATCH /api/v1/listings/<id>/status/ — змінити статус"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk, seller=request.user)
        except Listing.DoesNotExist:
            return Response({'detail': 'Оголошення не знайдено'}, status=404)

        new_status = request.data.get('status')
        if new_status not in dict(Listing.STATUS):
            return Response({'detail': 'Невірний статус'}, status=400)

        listing.status = new_status
        listing.save()
        return Response(ListingSerializer(listing).data)