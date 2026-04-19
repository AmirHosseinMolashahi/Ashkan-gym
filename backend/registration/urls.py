from django.urls import path
from .views import UploadRegistrationDocumentsView, UserDocsListView, ManagerAddDocsView, ManagerUpdateDocsView

app_name = 'registration'

urlpatterns = [
    path('documents/<int:id>/upload/', UploadRegistrationDocumentsView.as_view(), name='registration-documents-upload'),
    path('documents/list/', UserDocsListView.as_view(), name='registration-documents-list'),
    path('<int:user_id>/manager/upload/', ManagerAddDocsView.as_view(), name='manager-add-docs'),
    path('<int:user_id>/documents/<int:pk>/', ManagerUpdateDocsView.as_view(), name='manager-update-docs'),
]