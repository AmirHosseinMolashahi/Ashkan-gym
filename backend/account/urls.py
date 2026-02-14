from .views import userView, LoginView, RefreshTokenView, RegisterView, LogoutView, UpdateUserView, UsersView, CompleteProfileView
from django.urls import path

app_name = 'account'

urlpatterns = [
    path('user/', userView.as_view(), name='user'),
    path('users/', UsersView.as_view(), name='users'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('register/complete-profile/<int:user_id>/', CompleteProfileView.as_view(), name='complete-profile'),
    path('logout/', LogoutView.as_view(), name='logou'),
    path('update/', UpdateUserView.as_view(), name='update-user'),
    # path('coach/', CoachView.as_view(), name='coach'),
    # path('coach/<int:id>/delete/', CoachDeleteView.as_view(), name='coach-delete'),
    # path('coach/<int:id>/update/', CoachUpdateView.as_view(), name='coach-update'),
    # path('coach-list/', CoachesView.as_view(), name='coach-list'),
]
