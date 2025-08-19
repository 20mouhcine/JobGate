from rest_framework.views import APIView
from .models import Event, Talent, Participation, TimeSlot
from .serializers import EventSerializer, TalentSerializer, ParticipationSerializer,TimeSlotSerializer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from datetime import timedelta, datetime
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from rest_framework.generics import ListAPIView
from rest_framework import filters
from django.db.models import Q
from django.utils import timezone






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



    def delete(self, request, pk):
        try:
            event = self.get_object(pk)
            participations = Participation.objects.filter(event_id=pk)
            
            if participations.exists():
                recipient_list = [
                    participation.talent_id.email 
                    for participation in participations 
                    if participation.talent_id and participation.talent_id.email
                ]
                
                # Remove duplicates
                recipient_list = list(set(recipient_list))
                
                if recipient_list:
                    """
                    Send professional HTML email to talents notifying them of event cancellation
                    """
                    subject = "Notification: Annulation de l'événement"
                    
                    # Professional HTML email template
                    html_message = f"""
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Annulation d'événement</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="padding: 20px 0;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                                    📅 Notification Importante
                                                </h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                                                    Bonjour,
                                                </h2>
                                                
                                                <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                                    Nous sommes désolés de vous informer que l'événement suivant a été <strong>annulé</strong> :
                                                </p>
                                                
                                                <!-- Event Details Box -->
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
                                                    <tr>
                                                        <td style="padding: 20px;">
                                                            <h3 style="color: #dc3545; margin: 0 0 10px 0; font-size: 18px;">
                                                                🎯 {event.title}
                                                            </h3>
                                                            <p style="color: #666666; margin: 0; font-size: 14px;">
                                                                <strong>Lieu:</strong> {getattr(event, 'location', 'Non spécifié')}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <p style="color: #555555; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                                    Nous nous excusons sincèrement pour ce désagrément et comprenons que cette annulation puisse causer des inconvénients.
                                                </p>
                                                
                                                <p style="color: #555555; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                                    Nous travaillons activement à reprogrammer cet événement et vous tiendrons informé(e) dès que de nouvelles dates seront disponibles.
                                                </p>
                                                
                                                <!-- CTA Button (optional) -->
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                                                    <tr>
                                                        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                                                            <a href="#" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                                                📞 Nous Contacter
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                                <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">
                                                    <strong>Merci de votre compréhension</strong>
                                                </p>
                                                <p style="color: #888888; margin: 0; font-size: 12px;">
                                                    Cordialement,<br>
                                                    L'équipe organisatrice
                                                </p>
                                                <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
                                                <p style="color: #999999; margin: 0; font-size: 11px;">
                                                    Cet email a été envoyé automatiquement. Merci de ne pas répondre à cette adresse.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """
                    
                    # Plain text fallback
                    plain_message = f"""
                    Bonjour,

                    Nous sommes désolés de vous informer que l'événement suivant a été annulé :

                    Événement : {event.title}
                    Date : {getattr(event, 'date', 'Non spécifiée')}
                    Lieu : {getattr(event, 'location', 'Non spécifié')}

                    Nous nous excusons sincèrement pour ce désagrément et vous remercions de votre compréhension.

                    Cordialement,
                    L'équipe organisatrice
                    """
                    
                    try:
                        email = EmailMultiAlternatives(
                            subject=subject,
                            body=plain_message,  # Plain text version
                            from_email='mohsinelatiris57@mail.com',
                            to=recipient_list
                        )
                        email.attach_alternative(html_message, "text/html")
                        email.send()
                        
            
                        
                    except Exception as e:
                        print(f"Error sending email: {e}")
                        # Continue with deletion even if email fails
            
            # Delete the event (this should happen regardless of email sending)
            event.delete()
            
            # Return success response
            return Response(status=204)
            
        except Exception as e:
            # Handle any errors (event not found, etc.)
            return Response(
                {"error": "Event not found or could not be deleted"}, 
                status=404
            )

    
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
    
def generate_rdv_slots(start_time, end_time, recruiters_count, rdv_duration_minutes, event_date):
    slots = []
    # Use the event's start date as the base date
    base_date = event_date.date() if hasattr(event_date, 'date') else event_date
    current_time = datetime.combine(base_date, start_time)
    end_time_dt = datetime.combine(base_date, end_time)
    
    # Make datetime objects timezone-aware
    current_time = timezone.make_aware(current_time)
    end_time_dt = timezone.make_aware(end_time_dt)

    while current_time < end_time_dt:
        for recruiter in range(recruiters_count):
            end_datetime = current_time + timedelta(minutes=rdv_duration_minutes)
            slots.append({
                "start": current_time,  # Now returns datetime instead of time
                "end": end_datetime,    # Now returns datetime instead of time
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
                rdv_duration_minutes=time_slot.slot,
                event_date=event.start_date
            )

            # Get all taken RDV slots with their recruiter assignments
            taken_rdvs = Participation.objects.filter(
                event_id=event,
                event_time_slot=time_slot
            ).values_list('rdv', flat=True)

            # Count how many times each time slot is taken
            rdv_counts = {}
            for rdv_datetime in taken_rdvs:
                if rdv_datetime:
                    rdv_counts[rdv_datetime] = rdv_counts.get(rdv_datetime, 0) + 1

            # Find an available slot (time slot with less than recruiters_number appointments)
            available_slot = None
            for slot in rdv_slots:
                slot_datetime = slot['start']
                current_count = rdv_counts.get(slot_datetime, 0)
                if current_count < event.recruiters_number:
                    available_slot = slot
                    break

            if not available_slot:
                return Response({'error': 'No available RDV slots'}, status=400)

            participation_data.update({
                'rdv': available_slot['start'],
                'event_time_slot': time_slot
            })

        participation = Participation.objects.create(**participation_data)
        # Send confirmation email
        subject = "Confirmation de votre inscription à l'événement"

        # Professional HTML email template
        html_message = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation d'inscription</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                        ✅ Inscription Confirmée
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                                        Bonjour {talent.name},
                                    </h2>
                                    
                                    <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                        Félicitations ! Vous avez été <strong>inscrit avec succès</strong> à l'événement suivant :
                                    </p>
                                    
                                    <!-- Event Details Box -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">
                                                    🎯 {event.title}
                                                </h3>
                                                <p style="color: #666666; margin: 0 0 8px 0; font-size: 14px;">
                                                    <strong>📅 Date :</strong> {event.start_date.strftime('%d/%m/%Y à %H:%M')}
                                                </p>
                                                <p style="color: #666666; margin: 0 0 8px 0; font-size: 14px;">
                                                    <strong>📍 {"En ligne" if event.is_online else "Lieu"} :</strong> 
                                                    {"Réunion virtuelle" if event.is_online else event.location}
                                                </p>
                                                {f'<p style="color: #666666; margin: 0; font-size: 14px;"><strong>🕐 Votre RDV :</strong> {participation.rdv.strftime("%d/%m/%Y à %H:%M")}</p>' if event.is_timeSlot_enabled and participation.rdv else ''}
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {'''
                                    <!-- Meeting Link Section (if online) -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e7f3ff; border-radius: 6px; border-left: 4px solid #007bff; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <h4 style="color: #007bff; margin: 0 0 10px 0; font-size: 16px;">
                                                    🔗 Lien de la réunion
                                                </h4>
                                                <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">
                                                    Cliquez sur le lien ci-dessous pour rejoindre l'événement :
                                                </p>''' + 
                                                (f'''
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                    <tr>
                                                        <td style="border-radius: 6px; background: #007bff;">
                                                            <a href="{event.meeting_link}" style="display: inline-block; padding: 10px 20px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">
                                                                🎥 Rejoindre la réunion
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>''' if event.meeting_link else '''
                                                <p style="color: #dc3545; font-size: 14px; margin: 10px 0;">
                                                    Le lien de la réunion sera communiqué prochainement.
                                                </p>''') + '''
                                            </td>
                                        </tr>
                                    </table>
                                    ''' if event.is_online else ''}
                                    
                                    <p style="color: #555555; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                        Nous avons hâte de vous voir participer à cet événement ! N'hésitez pas à vous préparer en conséquence.
                                    </p>
                                    
                                    <p style="color: #555555; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                                        Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="border-radius: 6px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); text-align: center;">
                                                <a href="#" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                                    📞 Nous Contacter
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">
                                        <strong>À bientôt lors de l'événement !</strong>
                                    </p>
                                    <p style="color: #888888; margin: 0; font-size: 12px;">
                                        Cordialement,<br>
                                        L'équipe organisatrice
                                    </p>
                                    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
                                    <p style="color: #999999; margin: 0; font-size: 11px;">
                                        Cet email a été envoyé automatiquement. Merci de ne pas répondre à cette adresse.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        # Plain text fallback
        plain_message = f"""
        Bonjour {talent.name},

        Félicitations ! Vous avez été inscrit avec succès à l'événement suivant :

        Événement : {event.title}
        Date : {event.start_date.strftime('%d/%m/%Y à %H:%M')}
        {f'Mode : En ligne' if event.is_online else f'Lieu : {event.location}'}
        {f'Lien de réunion : {event.meeting_link}' if event.is_online and event.meeting_link else ''}
        {f'Votre RDV : {participation.rdv.strftime("%d/%m/%Y à %H:%M")}' if event.is_timeSlot_enabled and participation.rdv else ''}

        Nous avons hâte de vous voir participer à cet événement !

        Si vous avez des questions, n'hésitez pas à nous contacter.

        Cordialement,
        L'équipe organisatrice
        """

        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,  # Plain text version
                from_email='mohsinelatiris57@mail.com',
                to=[talent.email]
            )
            email.attach_alternative(html_message, "text/html")
            email.send()
            
            
        except Exception as e:
            # Fallback to simple email if HTML email fails
            send_mail(
                subject,
                plain_message,
                'mohsinelatiris57@mail.com',
                [talent.email],
                fail_silently=False
            )
        return Response({
            'talent_id': TalentSerializer(talent).data,
            'participation': ParticipationSerializer(participation).data
        }, status=201)




    
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
 

class ParticipationsEventView(ListAPIView):
    serializer_class = ParticipationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    # Define searchable fields
    search_fields = [
        'talent_id__name',
        'talent_id__email', 
        'talent_id__etablissement',
        'talent_id__filiere',
        'talent_id__phone'
    ]
    
    ordering = ['date_inscription']

    def get_queryset(self):
        """
        Retrieve all participations for a specific event with search capability.
        """
        pk = self.kwargs.get('pk')
        queryset = Participation.objects.filter(event_id=pk).select_related('talent_id', 'event_id')
        return queryset
    

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