from django.urls import path
from .views import CreateReminders, RemindersView, RemindersDelete, RemindersUpdate, ReminderFinishView, ReminderView


app_name = 'reminder'

urlpatterns = [
    path('<int:id>/', ReminderView.as_view(), name='reminder'),
    path('list/', RemindersView.as_view(), name='reminders-list'),
    path('create/', CreateReminders.as_view(), name='create-reminder'),
    path('<int:id>/delete/', RemindersDelete.as_view(), name='delete-reminder'),
    path('<int:id>/update/', RemindersUpdate.as_view(), name='update-reminder'),
    path('<int:id>/finish/', ReminderFinishView.as_view(), name='finish-reminder'),
]