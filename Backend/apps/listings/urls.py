from django.urls import path
from .views import (
    ListingListView, ListingCreateView, ListingDetailView,
    MyListingsView, ListingStatusUpdateView
)

urlpatterns = [
    path('',                ListingListView.as_view(),        name='listing-list'),
    path('create/',         ListingCreateView.as_view(),      name='listing-create'),
    path('my/',             MyListingsView.as_view(),          name='my-listings'),
    path('<int:pk>/',       ListingDetailView.as_view(),      name='listing-detail'),
    path('<int:pk>/status/', ListingStatusUpdateView.as_view(), name='listing-status'),
]