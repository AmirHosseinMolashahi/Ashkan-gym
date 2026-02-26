import json

from django.contrib.auth import get_user_model

from .constants import AUDIT_METHODS, AUDIT_RULES, ROLE_ALIASES
from .services import log_activity_async


class ActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method not in AUDIT_METHODS:
            return response
        if not (200 <= response.status_code < 400):
            return response

        resolver = getattr(request, "resolver_match", None)
        view_name = getattr(resolver, "view_name", "") if resolver else ""
        path = (request.path or "").lower()

        rule = self._match_rule(request.method, view_name, path, request)
        if not rule:
            return response

        actor, role = self._resolve_actor_and_role(request, rule)
        if not role:
            return response

        action = rule["actions_by_role"].get(role)
        if not action:
            return response

        description = rule["descriptions_by_role"].get(role, str(action))

        log_activity_async(
            actor=actor,
            verb=action,
            description=description,
            request=request,
            status_code=response.status_code,
            metadata={
                "role": role,
                "rule_id": rule.get("id"),
                "view_name": view_name,
            },
        )
        return response

    def _match_rule(self, method, view_name, path, request):
        view_name_l = (view_name or "").lower()

        for rule in AUDIT_RULES:
            if method not in rule["methods"]:
                continue

            names = {v.lower() for v in rule.get("view_names", set())}
            keywords = {k.lower() for k in rule.get("path_keywords", set())}

            by_view_name = bool(view_name_l and view_name_l in names)
            by_path = bool(keywords and all(k in path for k in keywords if k.startswith("/")))

            # اگر rule برای path کلیدی غیر / داشت (مثل verify/callback)
            extra_keywords = [k for k in keywords if not k.startswith("/")]
            if extra_keywords:
                by_path = by_path and all(k in path for k in extra_keywords)

            if not (by_view_name or by_path):
                continue

            condition = rule.get("condition")
            if condition == "password_change" and not self._is_password_change_request(request):
                continue

            return rule

        return None

    def _resolve_actor_and_role(self, request, rule):
        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False):
            role = self._normalize_role(getattr(user, "role", ""))
            if not role and (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
                role = "manager"
            return user, role

        # برای login که کاربر هنوز authenticate نشده
        if rule.get("id") == "login":
            national_id = self._extract_national_id(request)
            if national_id:
                User = get_user_model()
                actor = User.objects.filter(national_id=national_id).first()
                if actor:
                    return actor, self._normalize_role(getattr(actor, "role", ""))

        return None, None

    def _normalize_role(self, role):
        role = str(role or "").strip().lower()
        return ROLE_ALIASES.get(role)

    def _extract_national_id(self, request):
        data = self._parse_request_data(request)
        if not data:
            return None
        return data.get("national_id")

    def _is_password_change_request(self, request):
        data = self._parse_request_data(request)
        if not data:
            return False
        password_fields = {"password", "new_password", "old_password", "confirm_password"}
        return any(field in data for field in password_fields)

    def _parse_request_data(self, request):
        # برای DRF (اگر data قبلا parse شده باشد)
        data_attr = getattr(request, "data", None)
        if isinstance(data_attr, dict):
            return data_attr

        # fallback برای json body
        try:
            body = request.body.decode("utf-8") if request.body else ""
            if not body:
                return {}
            parsed = json.loads(body)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}
