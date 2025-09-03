from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Recruiter
import getpass

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a recruiter account'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email for the recruiter')
        parser.add_argument('--first_name', type=str, help='First name of the recruiter')
        parser.add_argument('--last_name', type=str, help='Last name of the recruiter')
        parser.add_argument('--company_name', type=str, help='Company name')
        parser.add_argument('--phone', type=str, help='Phone number')
        parser.add_argument('--password', type=str, help='Password (if not provided, will be prompted)')

    def handle(self, *args, **options):
        # Get user input
        email = options['email'] or input('Email: ')
        first_name = options['first_name'] or input('First name: ')
        last_name = options['last_name'] or input('Last name: ')
        company_name = options['company_name'] or input('Company name: ')
        phone = options['phone'] or input('Phone number: ')
        
        # Get password
        if options['password']:
            password = options['password']
        else:
            password = getpass.getpass('Password: ')
            password_confirm = getpass.getpass('Confirm password: ')
            if password != password_confirm:
                self.stdout.write(self.style.ERROR('Passwords do not match!'))
                return

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'User with email {email} already exists!'))
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
                    f'Successfully created recruiter account for {first_name} {last_name} '
                    f'({email}) at company {company_name}'
                )
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating recruiter: {str(e)}'))
