from django.urls import path

from .views import (
    CoachInvoiceListView,
    CoachInvoiceUpdateView,
    AthleteInvoiceListView,
    AthleteInvoiceDetailView,
    AthletePaymentListView,
    InvoiceManualUpdateView,
    CoachPaymentDashboardView,
    DiscountUpdateView,
    DeletePricingRuleView,
)


urlpatterns = [
    # مربی
    path("coach/invoices/", CoachInvoiceListView.as_view(), name="coach-invoice-list"),
    path("coach/invoices/dashboard/", CoachPaymentDashboardView.as_view(), name="coach-payment-dashboard"),
    path("coach/invoices/<int:invoice_id>/", CoachInvoiceUpdateView.as_view(), name="coach-invoice-update"),
    path("coach/invoices/<int:invoice_id>/manual-update/", InvoiceManualUpdateView.as_view(), name="coach-invoice-manual-update"),
    path("coach/discount/<int:id>/update/", DiscountUpdateView.as_view(), name='disount-update'),
    path("coach/discount/<int:enrollment_id>/delete/",DeletePricingRuleView.as_view()),

    # ورزشکار
    path("me/invoices/", AthleteInvoiceListView.as_view(), name="athlete-invoice-list"),
    path("me/invoices/<int:invoice_id>/", AthleteInvoiceDetailView.as_view(), name="athlete-invoice-detail"),
    path("me/payments/", AthletePaymentListView.as_view(), name="athlete-payment-list"),
]