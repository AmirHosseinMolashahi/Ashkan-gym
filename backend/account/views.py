# login
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, UpdateAPIView, ListAPIView, ListCreateAPIView, DestroyAPIView, RetrieveUpdateAPIView
from django.contrib.auth import authenticate
from rest_framework import status
from .models import CustomUser, LoginHistory
from .serializers import userSerializers, RegisterSerializer, UserUpdateSerializer
from .permissions import IsManager, IsCoachOrManager
from django.contrib.auth.models import update_last_login
from .utils import get_client_ip
from django.utils import timezone
from django.shortcuts import get_object_or_404
from registration.models import Registration
from notifications.utils import create_and_send_notification

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        national_id = request.data.get('national_id')
        password = request.data.get('password')

        # === 1) بررسی اینکه کاربر با این کدملی وجود دارد ===
        try:
            user_obj = CustomUser.objects.get(national_id=national_id)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'کد ملی وارد شده ثبت نشده است'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # === 2) چک کردن صحت رمز عبور ===
        if not user_obj.check_password(password):
            return Response(
                {'error': 'رمز عبور اشتباه است'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # === 3) اگر هر دو صحیح، authenticate کنید ===
        user = authenticate(
            request,
            national_id=national_id,
            password=password
        )

        user.previous_login = user.last_login
        user.last_login = timezone.now()
        user.save()

        ip = get_client_ip(request)
        LoginHistory.objects.create(
            user=user,
            ip_address=ip,  # تابع get_client_ip خودت
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        refresh = RefreshToken.for_user(user)
        res = Response()

        res.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=False,
            samesite='Lax',
            secure=False,
            path='/'
        )
        res.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            samesite='Lax',
            secure=False,
            path='/'
        )

        res.data = {"success": True}
        return res

    
class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'error': 'رفرش توکن پیدا نشد'}, status=401)
        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token

            res = Response()
            res.set_cookie('access', str(access_token), httponly=True)
            res.data = {"success": True}
            return res
        except Exception as e:
            return Response({'error': 'توکن نامعتبر'}, status=403)


class LogoutView(APIView):
    def post(self, request):
        res = Response({"message": "خروج موفقیت‌آمیز"}, status=200)
        res.delete_cookie('access', path='/', samesite='Lax')
        res.delete_cookie('refresh', path='/', samesite='Lax')

        return res


class userView(RetrieveUpdateDestroyAPIView):
    serializer_class = userSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class CompleteProfileView(RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    lookup_url_kwarg = 'user_id'

    def get_queryset(self):
        return CustomUser.objects.all()

    def perform_update(self, serializer):
        user = serializer.save()

        # آپدیت مرحله ثبت نام
        registration = Registration.objects.filter(user=user).first()
        if registration:
            registration.current_step = 2
            registration.save()
        
        # ارسال نوتیف
        create_and_send_notification(
                user=user,
                title=f"اطلاعات تکمیلی شما ثبت شد.",
                message=f"اطلاعات تکمیلی شما ثبت شد. با رفتن با بخش پروفایل میتوانید تغییرات مدنظر خود را اعمال کنید.",
                type="info",
                category="registration",
            )


class UsersView(ListAPIView):
    serializer_class = userSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CustomUser.objects.all()

        role = self.request.GET.get('role')

        if role:
            qs = qs.filter(role=role)

        return qs


class RegisterView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated,IsCoachOrManager]

    def perform_create(self, serializer):
        serializer.save()



class UpdateUserView(UpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer

    def get_object(self):
        # برمی‌گرداند کاربر فعلی
        return self.request.user