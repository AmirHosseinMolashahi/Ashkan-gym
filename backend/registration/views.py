from django.shortcuts import render
from django.shortcuts import get_object_or_404

import json

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView

from account.permissions import IsCoachOrManager
from notifications.utils import create_and_send_notification

from .models import RegistrationDocument, Registration
from .serializers import RegistrationDocumentBulkSerializer, RegistrationDocumentSerializer
from account.models import CustomUser
from account.permissions import IsManager

# Create your views here.

class UploadRegistrationDocumentsView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def post(self, request, id):
        registration = get_object_or_404(Registration, user_id=id)

        # JSON آرایه‌ی documents رو تبدیل به پایتون دیکشنری می‌کنیم
        try:
            documents_data = json.loads(request.data.get('documents', '[]'))
        except json.JSONDecodeError:
            return Response({"error": "Invalid documents JSON"}, status=status.HTTP_400_BAD_REQUEST)

        # حالا هر آیتم documents شامل file واقعی میشه
        prepared_docs = []
        for item in documents_data:
            file_field_name = item.get('file_field_name')
            file_obj = request.FILES.get(file_field_name)
            if not file_obj:
                return Response({"error": f"File {file_field_name} not found"}, status=status.HTTP_400_BAD_REQUEST)
            prepared_docs.append({
                'doc_type': item['doc_type'],
                'file': file_obj
            })

        serializer = RegistrationDocumentBulkSerializer(
            data={'documents': prepared_docs},
            context={'registration': registration}
        )
        if serializer.is_valid():
            serializer.save()

            if registration:
                registration.current_step = 3
                registration.status = 'completed'
                registration.save()

                create_and_send_notification(
                    user=CustomUser.objects.get(id=id),
                    title=f"مدارک شما با موفقیت بارگذاری شد!.",
                    message=f"مدارک شما با موفقیت بارگذاری شد. برای دیدن مدارک به صفحه پروفایل مراجعه شود.",
                    type="info",
                    category="registration",
                )
            return Response({"message": "مدارک با موفقیت آپلود شدند"}, status=status.HTTP_201_CREATED)
        
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# برای هر کاربر، لیست مدارکی که بارگذاری کرده رو نشون میده
class UserDocsListView(ListAPIView):
    serializer_class = RegistrationDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return RegistrationDocument.objects.filter(
            registration__user=user
        )
    

#ویو برای مدیر که مدارک یک کاربر رو ببینه و اضافه کنه
class ManagerAddDocsView(ListCreateAPIView):
    serializer_class = RegistrationDocumentSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        user_id = self.kwargs['user_id']  # از url parameter می‌گیریم
        return RegistrationDocument.objects.filter(
            registration__user__id=user_id
        )

    def perform_create(self, serializer):
        user_id = self.kwargs['user_id']
        registration = Registration.objects.get(user__id=user_id)  # ثبت‌نام کاربر
        serializer.save(registration=registration)


# ویو برای مدیر که کمدارک رو آپدیت یا حذف کنه
class ManagerUpdateDocsView(RetrieveUpdateDestroyAPIView):
    serializer_class = RegistrationDocumentSerializer
    permission_classes = [IsManager]
    queryset = RegistrationDocument.objects.all()

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return RegistrationDocument.objects.filter(
            registration__user__id=user_id
        )