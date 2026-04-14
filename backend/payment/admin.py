from django.contrib import admin, messages
from .models import Invoice, Payment, OnlinePayment
from .utils import generate_shamsi_month_invoices
from django.urls import path
from django.shortcuts import redirect

# Register your models here.
class InvoiceAdmin(admin.ModelAdmin):
    model = Invoice
    list_display = ['enrollment', 'period_year', 'period_month', 'amount', 'status', 'due_date']


    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'generate_shamsi_invoices/',
                self.admin_site.admin_view(self.generate_shamsi_invoices),
                name='generate_shamsi_invoices',
            )
        ]
        return custom_urls + urls

    def generate_shamsi_invoices(self, request):
        created_count = generate_shamsi_month_invoices()

        self.message_user(
            request,
            f'{created_count} صورتحساب برای این ماه ساخته شد ✅',
            messages.SUCCESS
        )
        return redirect('..')

admin.site.register(Invoice, InvoiceAdmin)

class PaymentAdmin(admin.ModelAdmin):
    model = Payment
    list_display = ['invoice', 'user', 'amount', 'method', 'status', 'paid_at']

admin.site.register(Payment, PaymentAdmin)


class OnlinePaymentAdmin(admin.ModelAdmin):
    model = OnlinePayment
    list_display = ['payment', 'gateway', 'authority', 'ref_id', 'card_mask']
  
admin.site.register(OnlinePayment, OnlinePaymentAdmin)