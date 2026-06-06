from .models import Notification
from .serializers import NotificationSerializer
from .utils import create_and_send_notification
from .filters import NotificationFilter

from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from account.models import CustomUser
from training.paginations import CustomPagination

from django_filters.rest_framework import DjangoFilterBackend

class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    filter_backends = [
        DjangoFilterBackend
    ]
    filterset_class = NotificationFilter

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response.data['unread_count'] = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return response


class UnreadNotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        data = Notification.objects.filter(user=self.request.user).order_by("-created_at")[:4]
        return data


class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(id=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"message": "marked as read"})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class CreateNotificationView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        user_id = request.data.get("user_id")
        message = request.data.get("message")
        title = request.data.get("title")
        url = request.data.get("url")

        if not user_id or not message:
            return Response({"error": "user_id and message required"}, status=400)

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "user not found"}, status=404)

        notif = create_and_send_notification(user, message, title, url)
        return Response({"id": notif.id, "message": "sent"}, status=201)


class MarkAllAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.notifications.update(is_read=True)
        return Response({"message": "all notifications marked as read"})


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = request.user.notifications.filter(is_read=False).count()
        return Response({"unread": count})

class DeleteNotifView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
    lookup_field = 'id'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj