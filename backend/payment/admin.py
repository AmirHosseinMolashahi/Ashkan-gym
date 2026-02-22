from django.contrib import admin
from .models import Invoice, Payment, OnlinePayment

# Register your models here.
class InvoiceAdmin(admin.ModelAdmin):
    model = Invoice
    list_display = ['enrollment', 'period_year', 'period_month', 'amount', 'status', 'due_date']

admin.site.register(Invoice, InvoiceAdmin)

class PaymentAdmin(admin.ModelAdmin):
    model = Payment
    list_display = ['invoice', 'user', 'amount', 'method', 'status', 'paid_at']

admin.site.register(Payment, PaymentAdmin)


class OnlinePaymentAdmin(admin.ModelAdmin):
    model = OnlinePayment
    list_display = ['payment', 'gateway', 'authority', 'ref_id', 'card_mask']
  
admin.site.register(OnlinePayment, OnlinePaymentAdmin)