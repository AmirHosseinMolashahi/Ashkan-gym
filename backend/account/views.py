# login
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, UpdateAPIView, ListAPIView, ListCreateAPIView, DestroyAPIView, RetrieveUpdateAPIView
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count

from .models import CustomUser, LoginHistory
from .serializers import (
    userSerializers,
    RegisterSerializer,
    UserUpdateSerializer,
    ManagerUserUpdateSerializer,
)

from .permissions import IsManager, IsCoachOrManager
from .utils import get_client_ip
from .models import CustomUser, LoginHistory

from registration.models import Registration
from notifications.utils import create_and_send_notification

from datetime import timedelta

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

        # === 3) چک کردن active بودن کاربر ===
        if user_obj.is_active != True:
            return Response(
                {'error': 'حساب شما غیر فعال شده است'},
                status=status.HTTP_401_UNAUTHORIZED
            )



        # === 4) اگر هر دو صحیح، authenticate کنید ===
        user = authenticate(
            request,
            national_id=national_id,
            password=password
        )

        user.previous_login = user.last_login
        user.last_login = timezone.now()
        user.save(update_fields=["previous_login", "last_login"])

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
            qs = qs.filter(roles__name=role)

        return qs



class UsersWithoutInsuranceView(ListAPIView):
    serializer_class = userSerializers
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def get_queryset(self):
        return CustomUser.objects.filter(
            insurance=False,
            is_active=True
        ).order_by("-date_joined").only(
            "id", "first_name", "last_name", "national_id"
        )
    def get_queryset(self):
        user = self.request.user

        base_queryset = CustomUser.objects.filter(
            insurance=False,
            is_active=True
        )

        # اگر منیجر بود → همه رو ببینه
        if user.roles.filter(name="manager").exists():
            return base_queryset.order_by("-date_joined").only(
                "id", "first_name", "last_name", "national_id"
            )

        # اگر coach بود → فقط یوزرهایی که در کورس‌های خودش enrollment دارن
        if user.roles.filter(name="coach").exists():
            return base_queryset.filter(
                enrollments__course__coach=user,
                enrollments__status="active"
            ).distinct().order_by("-date_joined").only(
                "id", "first_name", "last_name", "national_id"
            )

        # در صورت نیاز برای بقیه رول‌ها
        return CustomUser.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "users_without_insurance_number": queryset.count(),
            "users_without_insurance_list": serializer.data
        })



class AllUsersPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class UsersManagementView(ListAPIView):
    serializer_class = userSerializers
    permission_classes = [IsAuthenticated]
    pagination_class = AllUsersPagination

    def get_base_queryset(self):
        user = self.request.user
        roles = set(user.roles.values_list("name", flat=True))

        qs = CustomUser.objects.all()

        # اگر manager بود → full access
        if "manager" in roles:
            return qs

        # اگر coach بود → محدود
        if "coach" in roles:
            return qs.filter(
                enrollments__course__coach=user,
                enrollments__status="active"
            ).distinct()

        return CustomUser.objects.none()

    def filter_queryset_custom(self, qs):
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        insurance = self.request.query_params.get("insurance")
        search = self.request.query_params.get("search")

        if role and role != "all":
            qs = qs.filter(roles__name=role)

        if is_active in ["true", "false"]:
            qs = qs.filter(is_active=(is_active == "true"))

        if insurance in ["true", "false"]:
            qs = qs.filter(insurance=(insurance == "true"))

        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(national_id__icontains=search)
                | Q(phone_number__icontains=search)
                | Q(email__icontains=search)
            )

        return qs

    def get_queryset(self):
        qs = self.get_base_queryset()
        qs = self.filter_queryset_custom(qs)
        return qs.order_by("-date_joined")

    def get_summary(self, qs):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        prev_month_end = month_start - timedelta(microseconds=1)
        prev_month_start = prev_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_users = qs.count()
        inactive_users = qs.filter(is_active=False).count()

        new_this_month = qs.filter(date_joined__gte=month_start).count()
        new_prev_month = qs.filter(
            date_joined__gte=prev_month_start,
            date_joined__lte=prev_month_end
        ).count()

        # ⚠️ مهم: فقط لاگ‌های مربوط به همین queryset
        active_today = LoginHistory.objects.filter(
            login_time__gte=today_start,
            user__in=qs
        ).values("user_id").distinct().count()

        return {
            "total_users": total_users,
            "active_today": active_today,
            "new_this_month": new_this_month,
            "new_prev_month": new_prev_month,
            "inactive_users": inactive_users,
        }

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # pagination
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)

        summary = self.get_summary(queryset)

        return self.get_paginated_response({
            "summary": summary,
            "users": serializer.data
        })


class UserManagementDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    lookup_url_kwarg = 'user_id'

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return userSerializers
        return ManagerUserUpdateSerializer
    
    def get_queryset(self):
        user = self.request.user

        # 👨‍💼 مدیر → همه
        if user.is_superuser or user.roles.filter(name="manager").exists():
            return CustomUser.objects.all()

        # 👨‍🏫 مربی → فقط شاگردهای خودش
        if user.roles.filter(name="coach").exists():
            return CustomUser.objects.filter(
                enrollments__course__coach=user
            ).distinct()

        return CustomUser.objects.none()


class ManagerDeleteUserView(DestroyAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated, IsManager]
    lookup_url_kwarg = "user_id"

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # مدیر نتونه خودش رو حذف کنه
        if user.id == request.user.id:
            return Response(
                {"detail": "شما نمی‌توانید حساب خودتان را حذف کنید."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(
            {"detail": "کاربر با موفقیت حذف شد."},
            status=status.HTTP_200_OK,
        )



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