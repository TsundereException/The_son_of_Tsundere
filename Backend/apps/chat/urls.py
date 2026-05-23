from django.urls import path
from .views import (
    ConversationListView,
    StartConversationView,
    ConversationDetailView,
    SendMessageView,
    UnreadCountView
)

urlpatterns = [
    path('', ConversationListView.as_view(), name='conversation-list'),
    path('create/', StartConversationView.as_view(), name='start-conversation'),
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
    path('<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('<int:pk>/messages/', SendMessageView.as_view(), name='send-message'),
]
