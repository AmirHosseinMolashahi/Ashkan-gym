# login
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, UpdateAPIView, ListAPIView, ListCreateAPIView, DestroyAPIView, RetrieveUpdateAPIView
from django.contrib.auth import authenticate
from rest_framework import status
from .models import CustomUser, Coach
from .serializers import userSerializers, RegisterSerializer, UserUpdateSerializer, coachSerializers, coachUpdateSerializers
from .permissions import IsManager

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            res = Response()
            res.set_cookie(
                key='access',
                value=str(refresh.access_token),
                httponly=True,
                samesite='Lax',
                secure=False,
                path='/')
            res.set_cookie(
                key='refresh',
                value=str(refresh),
                httponly=True,
                samesite='Lax',
                secure=False,
                path='/')
            res.data = {"success": True}
            return res
        return Response({'error': 'نام کاربری یا رمز عبور اشتباه است'}, status=401)

    
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
    
class UsersView(ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = userSerializers
    permission_classes = [IsAuthenticated, IsManager]

class RegisterView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]



class UpdateUserView(UpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer

    
    def get_object(self):
        return self.request.user 


class CoachView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            coach = Coach.objects.get(user=request.user)
            serializer = coachSerializers(coach)
            return Response(serializer.data)
        except Coach.DoesNotExist:
            return Response({"coach": None})

class CoachesView(ListCreateAPIView):
    queryset = Coach.objects.all()
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = coachSerializers

    def post(self, request):
        serializer = coachUpdateSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'کلاس با موفقیت ایجاد شد'}, status=status.HTTP_201_CREATED)
        print("⛔️ Validation Error:", serializer.errors)
        return Response({'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class CoachUpdateView(RetrieveUpdateAPIView):
    queryset = Coach.objects.all()
    serializer_class = coachUpdateSerializers
    lookup_field = 'id'  # از URL مقدار می‌گیره

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'مربی با موفقیت به‌روزرسانی شد'}, status=status.HTTP_200_OK)
        print("⛔️ Validation Error:", serializer.errors)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CoachDeleteView(DestroyAPIView):
    queryset = Coach.objects.all()
    serializer_class = coachUpdateSerializers
    permission_classes = [IsAuthenticated, IsManager]  # می‌تونی اینجا پرمیشن خاص بذاری
    lookup_field = 'id' 

