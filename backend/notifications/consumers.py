from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope["user"]

        if user.is_anonymous:
            await self.close()
            return

        self.user_id = user.id
        self.group_name = f"user_{self.user_id}"

        print("User connected:", self.user_id)

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

    # این متدی است که پیام گروه به آن ارسال می‌شود
    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["notif"]))

