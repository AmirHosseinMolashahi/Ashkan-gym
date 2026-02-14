from django.shortcuts import render
from .models import RegistrationDocument, Registration
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsCoachOrManager
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .serializers import RegistrationDocumentBulkSerializer
from rest_framework.response import Response
from rest_framework import status
import json
from notifications.utils import create_and_send_notification
from account.models import CustomUser

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




# def post(self, request, id):
#         print(request.data)
#         registration = get_object_or_404(Registration, user_id=id)

#         serializer = RegistrationDocumentBulkSerializer(
#             data=request.data,
#             context={'registration': registration}
#         )
#         if serializer.is_valid():
#             serializer.save()
#             return Response(
#                 {"message": "مدارک با موفقیت آپلود شدند"},
#                 status=status.HTTP_201_CREATED
#             )
#         print(serializer.errors)
#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )