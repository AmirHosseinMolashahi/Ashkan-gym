from django.urls import path
from .views import CreateReminders, RemindersView, RemindersDelete, RemindersUpdate


app_name = 'schedule'

urlpatterns = [
    path('lists/', RemindersView.as_view(), name='reminders-list'),
    path('create/', CreateReminders.as_view(), name='create-reminders'),
    path('delete/<int:id>/', RemindersDelete.as_view(), name='delete-reminders'),
    path('update/<int:id>/', RemindersUpdate.as_view(), name='update-reminders'),
]