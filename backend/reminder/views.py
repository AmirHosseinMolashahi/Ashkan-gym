from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Reminder
from .serializers import RemindersSerializers, CreateReminderSerializers
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from training.paginations import CustomPagination
# Create your views here.


class CreateReminders(CreateAPIView):
    queryset = Reminder.objects.all()
    serializer_class = CreateReminderSerializers
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReminderView(RetrieveAPIView):
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Reminder.objects.filter(
            user=self.request.user
        )

class RemindersView(ListAPIView):
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter]

    filterset_fields = ['finished', 'priority']
    search_fields = ['title']

    pagination_class = CustomPagination

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).order_by("finished", "date", "time", "created_at")

class RemindersDelete(DestroyAPIView):
    queryset = Reminder.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'id' 

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj

class RemindersUpdate(UpdateAPIView):
    queryset = Reminder.objects.all()
    serializer_class = CreateReminderSerializers
    permission_classes = [IsAuthenticated]
    lookup_field = 'id' 

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه تغییر این یادآور را ندارید.")
        
        obj.finished = False
        obj.save()
        return obj
    
class ReminderFinishView(UpdateAPIView):
    queryset = Reminder.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def patch(self, request, *args, **kwargs):
        reminder = self.get_object()
        reminder.finished = True
        reminder.save()

        return Response({"message": "یادآور تکمیل شد"})