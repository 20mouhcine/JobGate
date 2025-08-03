from rest_framework.views import APIView
from .models import Event, Talent, Participation, TimeSlot
from .serializers import EventSerializer, TalentSerializer, ParticipationSerializer,TimeSlotSerializer
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import action
# Create your views here.


class EventView(APIView):

    def get(self, request):
        """
        List all events.
        """
        event = Event.objects.all()
        serializer = EventSerializer(event, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        Create a new event.
        """
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    
    
class EventDetailView(APIView):
    

    def get_object(self,pk):
        try:
            return Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response(status=404)
        
    """
    Retrieve an event instance.
    """ 
        
    def get(self, request, pk):
       event = self.get_object(pk)
       serializer = EventSerializer(event)
       return Response(serializer.data)
    

    """
    Update an event instance.
    """
    def put(self, request, pk):
        try:
            event = self.get_object(pk)
        except Event.DoesNotExist:
            return Response(status=404) 
        serializer = EventSerializer(event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    """
    Delete an event instance.
    """

    def delete(self,request,pk):
        event = self.get_object(pk)
        if event:
            event.delete()
            return Response(status=204)
        return Response(status=404)
    

    
class TalentView(APIView):
    def get(self,request):
        talents = Talent.objects.all()
        serializer = TalentSerializer(talents, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = TalentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
        
    


class TalentDetailView(APIView):
    
    def get_object(self,pk):
        try:
            return Talent.objects.get(pk=pk)
        except Talent.DoesNotExist:
            return Response(status=404)
        
    def get(self,request,pk):
        """
        Retrieve a talent instance.
        """
        talent = self.get_object(pk)
        serializer = TalentSerializer(talent)
        return Response(serializer.data)
    
class ParticipationView(APIView):
    
    def get(self, request):
        """
        List all participations.
        """
        participations = Participation.objects.all()
        serializer = ParticipationSerializer(participations, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        Create a new participation.
        """

        serializer = ParticipationSerializer(data=request.data)
        if serializer.is_valid():
            rdv = serializer.validated_data.get('rdv')
            if not serializer.validated_data.get('event_time_slot').start_time <rdv < serializer.validated_data.get('event_time_slot').end_time:
                return Response({'rdv': ['The rdv time must be within the event time slot.']}, status=400)
            
            event = serializer.validated_data.get('event')
            if rdv and event:
                time_slot = TimeSlot.objects.filter(event=event,rdv=rdv).first()
                if not time_slot:
                    return Response({'rdv': ['This time slot is already taken by another participant.']}, status=400)
        
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

    
class ParticipationDetailView(APIView):
    def get(self, request):
        """
        Retrieve a participation instance by event_id and talent_id from query params.
        Example: /participation-detail/?event_id=1&talent_id=2
        """
        event_id = request.query_params.get('event_id')
        talent_id = request.query_params.get('talent_id')

        
        if not event_id and not talent_id:
                return Response({'detail': 'please add at least one param'}, status=400) 
        
        try:
            if not event_id:
                participation = Participation.objects.get(talent_id=talent_id)
            elif not talent_id:
                participation = Participation.objects.get(event_id=event_id)   
            
            else:
                participation = Participation.objects.filter(event_id=event_id, talent_id=talent_id).first()
        except Participation.DoesNotExist:
            return Response({'detail': 'Participation not found.'}, status=404)
        serializer = ParticipationSerializer(participation)


        return Response(serializer.data)
    
    def put(self,request):

        event_id = request.query_params.get('event_id')
        talent_id = request.query_params.get('talent_id')
        if not event_id and not talent_id:
            return Response({'detail': 'Both event_id and talent_id are required'}, status=400)
        try:
            participation = Participation.objects.get(event_id=event_id, talent_id=talent_id)
        except Participation.DoesNotExist:
            return Response({'detail': 'Participation not found.'}, status=404)
        serializer = ParticipationSerializer(participation, data=request.data)
        if serializer.is_valid():
            rdv = serializer.validated_data.get('rdv')
            if not serializer.validated_data.get('event_time_slot').start_time < rdv < serializer.validated_data.get('event_time_slot').end_time:
                return Response({'rdv': ['The rdv time must be within the event time slot.']}, status=400)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def delete(self, request):
        event_id = request.query_params.get('event_id')
        talent_id = request.query_params.get('talent_id')
        if not event_id and not talent_id:
            return Response({'detail': 'Both event_id and talent_id are required'}, status=400)
        try:
            participation = Participation.objects.filter(event_id=event_id, talent_id=talent_id).first()
            participation.delete()
            return Response(status=204)
        except Participation.DoesNotExist:
            return Response({'detail': 'Participation not found.'}, status=404)     
    

class TimeSlotView(APIView):

    def get(self, request):
        """
        List all time slots.
        """
        event_id = request.query_params.get('event_id')
        if event_id:
            time_slots = TimeSlot.objects.filter(event_id=event_id)
        else:
            time_slots = TimeSlot.objects.all()

        serializer = TimeSlotSerializer(time_slots, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new time slot.
        """
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

    def delete(self,request):
        event_id = request.query_params.get('event_id')

        time_slot = TimeSlot.objects.filter(event_id=event_id).first()
        if time_slot:
            time_slot.delete()
            return Response(status=204)
        return Response({'detail': 'Time slot not found.'}, status=404)
    
