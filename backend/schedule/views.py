from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Schedule
from .serializers import RemindersSerializers
# Create your views here.


class CreateReminders(CreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RemindersView(ListAPIView):
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Schedule.objects.filter(user=self.request.user).order_by("finished", "time", "created_at")

class RemindersDelete(DestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]
    lookup_field = 'id' 

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj

class RemindersUpdate(UpdateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = RemindersSerializers
    permission_classes = [IsAuthenticated]
    lookup_field = 'id' 

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این یادآور را ندارید")
        return obj