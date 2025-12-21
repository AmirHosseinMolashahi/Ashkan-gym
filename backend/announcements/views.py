from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Announcements, AnnouncementRecipient
from .serializers import AnnounceCreateSerializer,AnnounceSerializer, AnnounceLimitedSerializer, AnnounceUpdateSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from notifications.utils import create_and_send_notification
from .pagination import AnnouncePagination
# Create your views here.


class AnnounceCreate(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnounceCreateSerializer
    queryset = Announcements.objects.all()

    def perform_create(self, serializer):
        announcement = serializer.save(user=self.request.user)

        for recipient in announcement.recipients.all():
            create_and_send_notification(
                user=recipient,
                title=f"اطلاعیه‌ی جدید: {announcement.title}",
                message=announcement.descriptions,
                type="info",  # یا می‌تونی type="announcement" اضافه کنی
                category="announcements",
            )


class AnnounceList(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = AnnouncePagination
    
    def get_serializer_class(self):
        user = self.request.user

        if user.role == 'manager':
            return AnnounceSerializer  # همهٔ فیلدها
        return AnnounceLimitedSerializer  # فقط فیلدهای محدود

    def get_queryset(self):
        user = self.request.user

        if user.role == 'manager':
            return Announcements.objects.all().order_by("-created_at")

        return Announcements.objects.filter(status='p',recipients=user).order_by("-created_at")
    

class MarkAnnouncementReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            announcement = Announcements.objects.get(pk=pk)
            recipient = AnnouncementRecipient.objects.get(announcement=announcement, user=request.user)
            recipient.is_read = True
            recipient.save()
            return Response({'status': 'ok'})
        except AnnouncementRecipient.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class AnnouncementsDelete(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Announcements.objects.all()
    lookup_field = 'id'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj

class AnnounceUpdate(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Announcements.objects.all()
    serializer_class = AnnounceUpdateSerializer
    lookup_field = 'id'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj



# class AnnounceUpdate(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, id):
#         data = Announcements.objects.get(id=id)
#         serializer = AnnounceUpdateSerializer(data)
#         return Response(serializer.data)

#     def put(self, request, id):
#         print(request.data)
#         serializer = AnnounceUpdateSerializer(
#             instance=request.user,
#             data=request.data,
#             partial=True
#         )

#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=200)

#         print("Errors:", serializer.errors)
#         return Response(serializer.errors, status=400)
