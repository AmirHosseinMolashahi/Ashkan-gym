from rest_framework.pagination import PageNumberPagination


class AnnouncePagination(PageNumberPagination):
    page_size = 10