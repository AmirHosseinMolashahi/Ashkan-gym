from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from http.cookies import SimpleCookie

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        validated = UntypedToken(token)
        user_id = validated['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return None

class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware برای خواندن JWT از کوکی و ست کردن scope['user']
    مناسب لوکال با ws:// و کوکی غیر HttpOnly
    """
    async def __call__(self, scope, receive, send):
        # اگر cookies در scope نباشد، از header ها استخراج می‌کنیم
        cookies = scope.get("cookies", {})

        # fallback: اگر cookies None است، header ها را بررسی کن
        if not cookies and b'cookie' in dict(scope.get('headers', [])):
            headers = dict(scope['headers'])
            raw_cookie = headers.get(b'cookie', b'').decode()
            simple_cookie = SimpleCookie()
            simple_cookie.load(raw_cookie)
            cookies = {key: morsel.value for key, morsel in simple_cookie.items()}

        token = cookies.get("access")  # نام کوکی JWT
        print("COOKIES:", cookies)

        if token is None:
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        user = await get_user_from_token(token)
        scope["user"] = user or AnonymousUser()

        return await super().__call__(scope, receive, send)
