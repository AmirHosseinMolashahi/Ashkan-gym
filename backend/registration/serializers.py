from rest_framework import serializers
from .models import RegistrationDocument
from django.db import transaction

class RegistrationDocumentItemSerializer(serializers.Serializer):
    file = serializers.FileField()
    doc_type = serializers.ChoiceField(choices=RegistrationDocument._meta.get_field("doc_type").choices)


class RegistrationDocumentBulkSerializer(serializers.Serializer):
    documents = RegistrationDocumentItemSerializer(many=True)

    def create(self, validated_data):
        registration = self.context['registration']
        documents = validated_data['documents']

        with transaction.atomic():
            objs = [
                RegistrationDocument(
                    registration=registration,
                    document=doc['file'],
                    doc_type=doc['doc_type']
                )
                for doc in documents
            ]

            RegistrationDocument.objects.bulk_create(objs)

        return objs