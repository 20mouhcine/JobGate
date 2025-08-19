from django.contrib import admin
from .models import Event, Talent, Participation, TimeSlot

# Register your models here.

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'end_date', 'location', 'is_timeSlot_enabled', 'is_online']
    list_filter = ['is_timeSlot_enabled', 'is_online', 'start_date']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']

@admin.register(Talent)
class TalentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'etablissement', 'filiere']
    search_fields = ['name', 'email', 'etablissement', 'filiere']
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
