from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # ابتدا بررسی header معمولی
        header_auth = super().authenticate(request)
        if header_auth is not None:
            return header_auth

        # اگر header نبود، از کوکی بخونه
        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            return None


        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
