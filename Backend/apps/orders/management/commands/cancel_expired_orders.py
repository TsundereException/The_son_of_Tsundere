from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.orders.models import Order
from apps.orders.services import PaymentService

class Command(BaseCommand):
    help = 'Скасовує замовлення Безпечної угоди, термін яких минув (48 годин без підтвердження)'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        
        # Шукаємо замовлення, які очікують підтвердження від продавця, і час яких вийшов
        expired_orders = Order.objects.filter(
            status='payment_held',
            expires_at__lt=now
        )
        
        count = 0
        for order in expired_orders:
            # 1. Повертаємо гроші покупцю
            if order.payment_hold_id:
                try:
                    PaymentService.release_funds(order.payment_hold_id)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Помилка повернення коштів для замовлення #{order.id}: {str(e)}'))
                    continue # Якщо не вдалося повернути кошти, не скасовуємо (потребує ручного втручання)

            # 2. Змінюємо статус
            order.status = 'cancelled'
            order.save()
            
            # 3. Повертаємо товар на склад
            for item in order.items.all():
                item.product.stock += item.quantity
                item.product.save()
                
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Успішно скасовано {count} прострочених замовлень.'))
