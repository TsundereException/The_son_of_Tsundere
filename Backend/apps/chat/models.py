from django.db import models
from apps.users.models import User
from apps.products.models import Product

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations', verbose_name='Учасники')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations', verbose_name='Товар')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Діалог'
        verbose_name_plural = 'Діалоги'
        ordering = ['-updated_at']

    def __str__(self):
        return f'Діалог #{self.pk}'

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', verbose_name='Діалог')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='Відправник')
    text = models.TextField(verbose_name='Текст')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    is_edited = models.BooleanField(default=False, verbose_name='Відредаговано')
    is_deleted = models.BooleanField(default=False, verbose_name='Видалено')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Повідомлення'
        verbose_name_plural = 'Повідомлення'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.text[:50]}'
