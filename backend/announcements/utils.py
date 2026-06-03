from account.models import CustomUser

def get_recipients(announcement):
        if announcement.is_global:

            return CustomUser.objects.filter(
                is_active=True
            )

        users = CustomUser.objects.none()

        users = users | announcement.target_users.all()

        users = users | CustomUser.objects.filter(
            roles__in=announcement.target_roles.all()
        )

        users = users | CustomUser.objects.filter(
            enrollments__course__in=announcement.target_classes.all(),
            enrollments__status='active'
        )

        return users.distinct()