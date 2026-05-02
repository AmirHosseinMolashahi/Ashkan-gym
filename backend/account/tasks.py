from celery import shared_task
from django.utils import timezone
from .models import CustomUser

@shared_task(max_retries=3, default_retry_delay=60)
def update_insurance_task():
    today = timezone.now().date()

    CustomUser.objects.filter(
        insurance=True,
        insurance_expiry_date__lt=today
    ).update(insurance=False)