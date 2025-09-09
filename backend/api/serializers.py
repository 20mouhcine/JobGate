from rest_framework import serializers
from .models import Event, Recruiter, Talent, Participation, TimeSlot, User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'image','caption','title', 'description', 'start_date','end_date', 'location', 'recruiterId','is_timeSlot_enabled','is_online','recruiters_number','meeting_link','is_archived']
        read_only_fields = ['id'] 

class TalentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talent
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'etablissement', 'filiere', 'resume']
        read_only_fields = ['id']  
       

class ParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = ['id', 'talent_id', 'event_id', 'has_attended', 'date_inscription', 'note', 'comment', 'is_selected', 'rdv','event_time_slot']
        read_only_fields = ['id', 'date_inscription','talent_id', 'event_id']
        depth = 1

    def to_internal_value(self, data):
        internal_data = data.copy()
        
        if 'talent' in internal_data and isinstance(internal_data['talent'], int):
            pass 
        
        if 'event' in internal_data and isinstance(internal_data['event'], int):
            pass  
        self.Meta.depth = 0
        result = super().to_internal_value(internal_data)
        self.Meta.depth = 1  
        
        return result
    
class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'event', 'start_time', 'end_time', 'slot']
        read_only_fields = ['id']
        depth = 1
    
    def to_internal_value(self, data):
        internal_data = data.copy()
        
        if 'event' in internal_data and isinstance(internal_data['event'], int):
            pass 
        
        self.Meta.depth = 0
        result = super().to_internal_value(internal_data)
        self.Meta.depth = 1  
        
        return result


class UserSerializer(serializers.ModelSerializer):
    etablissement = serializers.CharField(source='talent_profile.etablissement', read_only=True, required=False)
    filiere = serializers.CharField(source='talent_profile.filiere', read_only=True, required=False)
    company_name = serializers.CharField(source='recruiter_profile.company_name', read_only=True, required=False)
    talent_id = serializers.IntegerField(source='talent_profile.id', read_only=True, required=False)
    recruiter_id = serializers.IntegerField(source='recruiter_profile.id', read_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'etablissement', 'filiere', 'company_name', 'talent_id', 'recruiter_id']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    etablissement = serializers.CharField(required=False, allow_blank=True, write_only=True)
    filiere = serializers.CharField(required=False, allow_blank=True, write_only=True)
    resume = serializers.FileField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'password_confirm', 'role', 'phone', 'etablissement', 'filiere','resume']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Extract fields that don't belong to User model
        etablissement = validated_data.pop('etablissement', '')
        filiere = validated_data.pop('filiere', '')
        resume = validated_data.pop('resume', None)

        
        # Set username for AbstractUser compatibility
        validated_data['username'] = f"{validated_data['first_name']} {validated_data['last_name']}"
        
        user = User.objects.create_user(**validated_data)
        
        # Create talent profile if user is a talent
        if user.role == 'talent':
            Talent.objects.create(
                user_id=user,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                phone=user.phone,
                etablissement=etablissement,
                filiere=filiere,
                resume=resume
            )
        else:
            Recruiter.objects.create(
                user_id=user,
                company_name='',  # Default empty company name
            )

        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        searched_user = User.objects.filter(email=email).first()
        if not searched_user:
            raise serializers.ValidationError('User not found')
        username = searched_user.username

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs