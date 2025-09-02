from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Recruiter

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a sample recruiter account for testing'

    def handle(self, *args, **options):
        # Sample recruiter data
        email = 'recruiter@test.com'
        first_name = 'John'
        last_name = 'Recruiter'
        company_name = 'TechCorp Inc.'
        phone = '+1234567890'
        password = 'recruiter123'

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists!'))
            existing_user = User.objects.get(email=email)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Existing recruiter: {existing_user.first_name} {existing_user.last_name} '
                    f'({existing_user.email}) - Role: {existing_user.role}'
                )
            )
            return

        try:
            # Create user
            user = User.objects.create_user(
                username=f"{first_name}_{last_name}",
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password,
                role='recruiter',
                phone=phone
            )

            # Create recruiter profile
            recruiter = Recruiter.objects.create(
                user_id=user,
                company_name=company_name
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created sample recruiter account!\n'
                    f'Email: {email}\n'
                    f'Password: {password}\n'
                    f'Name: {first_name} {last_name}\n'
                    f'Company: {company_name}\n'
                    f'Phone: {phone}'
                )
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating recruiter: {str(e)}'))
