from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer
from apps.products.serializers import ProductListSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'is_read', 'is_edited', 'is_deleted', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    product = ProductListSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'product', 'last_message', 'unread_count', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'text': "Повідомлення видалено" if last_msg.is_deleted else last_msg.text,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at,
                'is_deleted': last_msg.is_deleted
            }
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class ConversationDetailSerializer(ConversationListSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ConversationListSerializer.Meta):
        fields = ConversationListSerializer.Meta.fields + ['messages']


class SendMessageSerializer(serializers.Serializer):
    text = serializers.CharField(trim_whitespace=True, min_length=1, max_length=2000)
