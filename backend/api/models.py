from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.


class Event(models.Model):
    title = models.CharField(max_length=200,null=True)
    description = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now=True)
    location = models.CharField(max_length=200)
    recruiterId = models.IntegerField(null=True, blank=True)
    is_timeSlot_enabled = models.BooleanField(default=False)

   
class Talent(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

class Participation(models.Model):
    talent = models.ForeignKey(Talent, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    is_attending = models.BooleanField(default=False)
    date_inscription = models.DateTimeField(auto_now_add=True)
    note = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    comment = models.TextField(null=True, blank=True)
    is_selected = models.BooleanField(default=False)
    rdv = models.TimeField(null=True, blank=True)
    event_time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = ('talent', 'event')

class TimeSlot(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot = models.IntegerField(default=10,null=True, blank=True)
    
    class Meta:
        unique_together = ('event', 'start_time', 'end_time')