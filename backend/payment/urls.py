from django.urls import path

from .views import (
    CoachInvoiceListView,
    CoachInvoiceUpdateView,
    AthleteInvoiceListView,
    AthleteInvoiceDetailView,
)

urlpatterns = [
    # مربی
    path("coach/invoices/", CoachInvoiceListView.as_view(), name="coach-invoice-list"),
    path("coach/invoices/<int:invoice_id>/", CoachInvoiceUpdateView.as_view(), name="coach-invoice-update"),

    # ورزشکار
    path("me/invoices/", AthleteInvoiceListView.as_view(), name="athlete-invoice-list"),
    path("me/invoices/<int:invoice_id>/", AthleteInvoiceDetailView.as_view(), name="athlete-invoice-detail"),
]