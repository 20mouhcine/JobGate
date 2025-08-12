from rest_framework.views import APIView
from .models import Event, Talent, Participation, TimeSlot
from .serializers import EventSerializer, TalentSerializer, ParticipationSerializer,TimeSlotSerializer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from datetime import timedelta, datetime



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
    
    def put(self, request, pk):
        """
        Update a talent instance.
        """
        try:
            talent = self.get_object(pk)
        except Talent.DoesNotExist:
            return Response(status=404) 
        serializer = TalentSerializer(talent, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
def generate_rdv_slots(start_time, end_time, recruiters_count, rdv_duration_minutes):
    slots = []
    base_date = datetime(2000, 1, 1)
    current_time = datetime.combine(base_date, start_time)
    end_time_dt = datetime.combine(base_date, end_time)

    while current_time < end_time_dt:
        for recruiter in range(recruiters_count):
            slots.append({
                "start": current_time.time(),
                "end": (current_time + timedelta(minutes=rdv_duration_minutes)).time(),
                "recruiter": recruiter + 1
            })
        current_time += timedelta(minutes=rdv_duration_minutes)

    return slots
    
class ParticipationView(APIView):
    
    def get(self, request):
        """
        List all participations.
        """
        participations = Participation.objects.all()
        serializer = ParticipationSerializer(participations, many=True)
        return Response(serializer.data)
    

    def post(self, request):
        talent_id = request.data.get('talent_id')
        event_id = request.data.get('event_id')
        
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=404)

        # Case 1: Existing talent
        if talent_id:
            try:
                talent = Talent.objects.get(id=talent_id)
            except Talent.DoesNotExist:
                return Response({'error': 'Talent not found'}, status=404)
        # Case 2: New talent
        else:
            talent_serializer = TalentSerializer(data=request.data)
            if not talent_serializer.is_valid():
                return Response(talent_serializer.errors, status=400)
            talent = talent_serializer.save()

        if Participation.objects.filter(talent_id=talent, event_id=event).exists():
            return Response({'error': 'Already registered for this event'}, status=400)

        participation_data = {
            'talent_id': talent,
            'event_id': event
        }

        if event.is_timeSlot_enabled:
            time_slot = TimeSlot.objects.filter(event=event).order_by('start_time').first()
            if not time_slot:
                return Response({'error': 'No time slots found for this event'}, status=400)

            rdv_slots = generate_rdv_slots(
                start_time=time_slot.start_time,
                end_time=time_slot.end_time,
                recruiters_count=event.recruiters_number,
                rdv_duration_minutes=time_slot.slot
            )

            taken_rdvs = Participation.objects.filter(
                event_id=event,
                event_time_slot=time_slot
            ).values_list('rdv', flat=True)

            available_slot = next(
                (slot for slot in rdv_slots if slot['start'] not in taken_rdvs),
                None
            )

            if not available_slot:
                return Response({'error': 'No available RDV slots'}, status=400)

            participation_data.update({
                'rdv': available_slot['start'],
                'event_time_slot': time_slot
            })

        participation = Participation.objects.create(**participation_data)

        return Response({
            'talent_id': TalentSerializer(talent).data,
            'participation': ParticipationSerializer(participation).data
        }, status=201)



    
# def generate_rdv_slots(start_time, end_time, recruiters_count, rdv_duration_minutes):
#     slots = []
#     current_time = start_time

#     while current_time < end_time:
#         for recruiter in range(recruiters_count):
#             slots.append({
#                 "start": current_time,
#                 "end": current_time + timedelta(minutes=rdv_duration_minutes),
#                 "recruiter": recruiter + 1  # recruiter ID or index
#             })
#         current_time += timedelta(minutes=rdv_duration_minutes)

#     return slots
    
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

        participation = None
        try:
            if event_id and talent_id:
                participation = Participation.objects.filter(event_id=event_id, talent_id=talent_id).first()
            
            elif talent_id:
                participation = Participation.objects.filter(talent_id=talent_id).first()

            if not participation:
                return Response({'detail': 'Participation not found.'})

        except Exception as e:
            return Response({'detail': str(e)}, status=400)

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
        if not event_id or not talent_id:
            return Response({'detail': 'Both event_id and talent_id are required'}, status=400)
        participation = Participation.objects.filter(event_id=event_id, talent_id=talent_id).first()
        participation_to_delete = Participation.objects.get(id=participation.id)
        if not participation_to_delete:
            return Response({'detail': 'Participation not found.'}, status=404)
        participation_to_delete.delete()
        return Response(status=204)
 

class ParticipationsEventView(APIView):

    def get(self, request, pk):
        """
        Retrieve all participations for a specific event.
        """
        participations = Participation.objects.filter(event_id=pk)
        serializer = ParticipationSerializer(participations, many=True)
        return Response(serializer.data)
    

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
    

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES['file']
        file_path = default_storage.save(f"uploads/{file_obj.name}", file_obj)
        file_url = request.build_absolute_uri(default_storage.url(file_path))
        return Response({"url": file_url})