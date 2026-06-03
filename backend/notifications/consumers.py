from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
import json


def is_rate_limited(user_id):
    key = f"ws_conn:{user_id}"

    try:
        count = cache.get(key)

        if count is None:
            cache.set(key, 1, timeout=60)
            return False

        if count >= 20:
            return True

        cache.incr(key)
        return False

    except Exception:
        return False


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close()
            return

        # rate limit
        if is_rate_limited(user.id):
            await self.close()
            return

        self.user_id = user.id
        self.group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        notif = event.get("notif", {})

        if not isinstance(notif, dict):
            return

        await self.send(text_data=json.dumps(notif))