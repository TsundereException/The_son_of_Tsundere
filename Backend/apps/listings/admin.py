from django.contrib import admin
from .models import Listing


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display  = ['title', 'seller', 'category', 'price', 'status', 'created_at']
    list_filter   = ['status', 'category']
    search_fields = ['title', 'seller__username']
    list_editable = ['status']