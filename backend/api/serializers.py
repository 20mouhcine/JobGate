from rest_framework import serializers
from .models import Event, Talent, Participation, TimeSlot

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_date','end_date', 'location', 'recruiterId','is_timeSlot_enabled']
        read_only_fields = ['id'] 

class TalentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talent
        fields = ['id', 'name', 'email', 'phone', 'resume']
        read_only_fields = ['id']  
       

class ParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = ['id', 'talent', 'event', 'is_attending', 'date_inscription', 'note', 'comment', 'is_selected', 'rdv','event_time_slot']
        read_only_fields = ['id', 'date_inscription']
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