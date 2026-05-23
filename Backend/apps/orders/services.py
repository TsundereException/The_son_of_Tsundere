import uuid
import secrets
import time

class PaymentService:
    """Симуляція платіжного шлюзу (заглушка)"""
    
    @staticmethod
    def hold_funds(card_number: str, amount: float) -> str:
        """
        Симулює резервування (холдування) коштів на картці.
        Повертає унікальний ID транзакції.
        """
        # Імітуємо затримку запиту до банку
        time.sleep(0.5)
        # Успішна транзакція
        hold_id = f"hold_{uuid.uuid4().hex[:12]}"
        print(f"[PaymentService] Зарезервовано {amount} ₴ з картки {card_number[-4:]}. Hold ID: {hold_id}")
        return hold_id

    @staticmethod
    def capture_funds(hold_id: str, payout_card: str, amount_to_seller: float, commission: float) -> bool:
        """
        Симулює переказ зарезервованих коштів продавцю та зняття комісії платформи.
        Викликається, коли покупець забрав посилку.
        """
        time.sleep(0.5)
        print(f"[PaymentService] Транзакцію {hold_id} завершено. Переказано {amount_to_seller} ₴ на картку {payout_card[-4:]}. Комісія платформи: {commission} ₴")
        return True

    @staticmethod
    def release_funds(hold_id: str) -> bool:
        """
        Симулює розморожування коштів і повернення їх покупцю.
        Викликається, коли продавець відмовився відправляти або покупець відмовився на пошті.
        """
        time.sleep(0.5)
        print(f"[PaymentService] Кошти розморожено (повернено покупцю). Hold ID: {hold_id}")
        return True


class LogisticsService:
    """Симуляція служби доставки (Нова Пошта / Укрпошта)"""
    
    @staticmethod
    def create_ttn(provider: str, sender_city: str, receiver_city: str, weight: float) -> str:
        """
        Симулює генерацію електронної накладної (ТТН).
        """
        time.sleep(0.5)
        prefix = "2045" if provider == 'nova_poshta' else "0500"
        # Використовуємо криптографічно безпечний генератор (замість random)
        ttn = f"{prefix}{1000000000 + secrets.randbelow(8999999999)}"
        print(f"[LogisticsService] Згенеровано ТТН {provider.upper()}: {ttn} (З {sender_city} в {receiver_city}, {weight} кг)")
        return ttn

    @staticmethod
    def get_tracking_status(ttn: str) -> str:
        """
        Симуляція перевірки статусу ТТН.
        У реальності ми б слухали Webhook від НП.
        """
        # Для тестів просто повертаємо якийсь статус
        statuses = ['pending', 'in_transit', 'arrived', 'received', 'refused']
        return secrets.choice(statuses)

