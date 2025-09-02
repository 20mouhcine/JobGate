from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Event, Talent, Participation, TimeSlot, User,Recruiter

# Register your models here.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [ 'email', 'first_name', 'last_name', 'role', 'is_active','phone']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'etablissement', 'filiere', 'avatar')}),
    )

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'end_date', 'location', 'is_timeSlot_enabled', 'is_online']
    list_filter = ['is_timeSlot_enabled', 'is_online', 'start_date']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']

@admin.register(Recruiter)
class RecruiterAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'company_name']
    search_fields = ['user_id__email', 'company_name']

@admin.register(Talent)
class TalentAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'etablissement', 'filiere']
    search_fields = ['first_name', 'last_name', 'email', 'etablissement', 'filiere']
    list_filter = ['etablissement', 'filiere']

@admin.register(Participation)
class ParticipationAdmin(admin.ModelAdmin):
    list_display = ['talent_id', 'event_id', 'has_attended', 'is_selected', 'date_inscription', 'rdv']
    list_filter = ['has_attended', 'is_selected', 'date_inscription']
    search_fields = ['talent_id__name', 'talent_id__email', 'event_id__title']
    date_hierarchy = 'date_inscription'
    ordering = ['-date_inscription']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['event', 'start_time', 'end_time', 'slot']
    list_filter = ['start_time', 'end_time']
    search_fields = ['event__title']