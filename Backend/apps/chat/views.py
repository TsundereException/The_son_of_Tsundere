from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    SendMessageSerializer
)
from apps.users.models import User
from apps.products.models import Product

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all().prefetch_related(
            'participants',
            'product',
            'messages'
        ).order_by('-updated_at')


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seller_id = request.data.get('seller_id')
        product_id = request.data.get('product_id')
        initial_message = request.data.get('initial_message')

        if not seller_id:
            return Response({'error': 'seller_id обовʼязковий'}, status=status.HTTP_400_BAD_REQUEST)

        seller = get_object_or_404(User, pk=seller_id)
        if seller == request.user:
            return Response({'error': 'Не можна створити діалог із самим собою'}, status=status.HTTP_400_BAD_REQUEST)

        product = None
        if product_id:
            product = get_object_or_404(Product, pk=product_id, is_active=True)
            if product.seller_id != seller.id:
                return Response({'error': 'Товар не належить обраному продавцю'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if conversation already exists
        conv = Conversation.objects.filter(participants=request.user).filter(participants=seller)
        if product:
            conv = conv.filter(product=product)
        
        conversation = conv.first()

        if not conversation:
            conversation = Conversation.objects.create(product=product)
            conversation.participants.add(request.user, seller)

        if initial_message:
            serializer = SendMessageSerializer(data={'text': initial_message})
            serializer.is_valid(raise_exception=True)
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                text=serializer.validated_data['text']
            )
            conversation.save() # update updated_at

        serializer = ConversationDetailSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if not conv else status.HTTP_200_OK)


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all()

    def get_object(self):
        obj = super().get_object()
        # Mark all messages from other users as read
        obj.messages.exclude(sender=self.request.user).update(is_read=True)
        return obj


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        conversation = get_object_or_404(request.user.conversations.all(), pk=pk)
        
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                text=serializer.validated_data['text']
            )
            conversation.save() # trigger updated_at
            # We can return the updated conversation or just the message
            return Response(ConversationDetailSerializer(conversation, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).count()
        
        return Response({'unread_count': count})


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Message, pk=pk, sender=user)

    def patch(self, request, pk):
        message = self.get_object(pk, request.user)
        if message.is_deleted:
            return Response({'error': 'Cannot edit deleted message'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            message.text = serializer.validated_data['text']
            message.is_edited = True
            message.save()
            
            message.conversation.save()
            return Response(ConversationDetailSerializer(message.conversation, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        message = self.get_object(pk, request.user)
        if not message.is_deleted:
            message.is_deleted = True
            message.save()
            message.conversation.save()
        
        return Response(ConversationDetailSerializer(message.conversation, context={'request': request}).data, status=status.HTTP_200_OK)
