from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.


class Event(models.Model):
    title = models.CharField(max_length=200,null=True)
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    caption = models.CharField(max_length=500, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    start_date = models.DateTimeField(blank=True)
    end_date = models.DateTimeField(blank=True)
    location = models.CharField(max_length=200,null=True, blank=True)
    recruiterId = models.IntegerField(null=True, blank=True)
    is_timeSlot_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    recruiters_number = models.IntegerField(default=1, null=True, blank=True)
    meeting_link = models.CharField(null=True, blank=True)

   
class Talent(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    etablissement = models.CharField(max_length=100,null=True, blank=True)
    filiere = models.CharField(max_length=200, null=True,blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

class Participation(models.Model):
    talent_id = models.ForeignKey(Talent, on_delete=models.CASCADE)
    event_id = models.ForeignKey(Event, on_delete=models.CASCADE)
    has_attended = models.BooleanField(default=False)
    date_inscription = models.DateTimeField(auto_now_add=True)
    note = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    comment = models.TextField(default="",null=True, blank=True)
    is_selected = models.BooleanField(default=False)
    rdv = models.TimeField(null=True, blank=True)
    event_time_slot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = ('talent_id', 'event_id')

class TimeSlot(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot = models.IntegerField(default=10,null=True, blank=True)
    
    class Meta:
        unique_together = ('event', 'start_time', 'end_time')