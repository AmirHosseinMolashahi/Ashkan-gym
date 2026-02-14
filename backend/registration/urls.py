from django.urls import path
from .views import UploadRegistrationDocumentsView

app_name = 'registration'

urlpatterns = [
    path('documents/<int:id>/upload/', UploadRegistrationDocumentsView.as_view(), name='registration-documents-upload'),
]