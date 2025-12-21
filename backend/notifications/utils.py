from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer

def send_notification(user_id, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "message": message
        }
    )

def create_and_send_notification(user, message, title=None, url=None, type='info', category=None):
    # 1) ذخیره در دیتابیس
    notif = Notification.objects.create(
        user=user,
        message=message,
        title=title,
        url=url,
        type=type,
        category=category
    )

    # 2) Serialize instance
    notif_data = NotificationSerializer(notif).data

    # 3) ارسال real-time از طریق WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}",
        {
            "type": "send_notification",
            "notif": notif_data  # تمام فیلدهای Serializer ارسال می‌شوند
        }
    )

    return notif
