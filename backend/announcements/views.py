from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Announcement, AnnouncementRead
from .utils import get_recipients
from .serializers import AnnounceCreateSerializer,AnnounceSerializer, AnnounceLimitedSerializer, AnnouncementUpdateSerializer

from training.paginations import CustomPagination
from account.models import CustomUser
from notifications.utils import create_and_send_notification
from account.permissions import IsManager
# Create your views here.


class AnnounceCreate(CreateAPIView):

    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = AnnounceCreateSerializer
    queryset = Announcement.objects.all()

    def perform_create(self, serializer):

        announcement = serializer.save(
            user=self.request.user
        )

        recipients = self.get_recipients(announcement)

        if announcement.status == 'p':
            for recipient in recipients:

                create_and_send_notification(
                    user=recipient,
                    title=f"اطلاعیه جدید!",
                    message=announcement.title,
                    type="info",
                    category="announcements",
                )

    def get_recipients(self, announcement):
        return get_recipients(announcement)


class AnnounceList(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    filter_backends = [
        DjangoFilterBackend,
    ]

    filterset_fields = ['status']
    
    def get_serializer_class(self):
        user = self.request.user

        if user.roles.filter(name='manager').exists():
            return AnnounceSerializer  # همهٔ فیلدها
        return AnnounceLimitedSerializer  # فقط فیلدهای محدود

    def get_queryset(self):
        user = self.request.user

        if user.roles.filter(name='manager').exists():
            return Announcement.objects.all().order_by("-created_at")

        return Announcement.objects.filter(
            status='p'
        ).filter(
            Q(is_global=True) |
            Q(target_users=user) |
            Q(target_roles__in=user.roles.all()) |
            Q(target_classes__enrollments__student=user, target_classes__enrollments__status='active')
        ).prefetch_related(
            Prefetch(
                'read_logs',
                queryset=AnnouncementRead.objects.filter(user=user),
                to_attr='user_read_logs'
            )
        ).distinct().order_by("-created_at")
    

class MarkAnnouncementRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        announcement = get_object_or_404(
            Announcement,
            id=id,
            status='p'
        )
        _, created = AnnouncementRead.objects.get_or_create(
            announcement=announcement,
            user=request.user
        )
        return Response(
            {'detail': 'خوانده شد' if created else 'قبلاً خوانده شده'},
            status=status.HTTP_200_OK
        )

class AnnouncementsDelete(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsManager]
    queryset = Announcement.objects.all()
    lookup_field = 'id'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این اطلاعیه را ندارید!")
        return obj

class AnnounceUpdate(RetrieveUpdateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementUpdateSerializer
    permission_classes = [IsAuthenticated, IsManager]
    http_method_names = ['get', 'patch']  # put رو بستیم، فقط patch
    lookup_field = 'id'

    def get_object(self):
        obj = super().get_object()
        # فقط سازنده بتونه ویرایش کنه
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه ویرایش این اطلاعیه را ندارید.")
        return obj
    
    def perform_update(self, serializer):
        old_status = self.get_object().status  # قبل از آپدیت وضعیت قبلی رو نگه میداریم
        announcement = serializer.save()
        
        # فقط اگه تازه منتشر شده (قبلاً p نبوده، الان p شده)
        if old_status != 'p' and announcement.status == 'p':
            recipients = get_recipients(announcement)
            for recipient in recipients:
                create_and_send_notification(
                    user=recipient,
                    title="اطلاعیه جدید!",
                    message=announcement.title,
                    type="info",
                    category="announcements",
                )
