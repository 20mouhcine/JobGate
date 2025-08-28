import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Event, Participation, TimeSlot

print('=== RDV SCHEDULING VERIFICATION ===\n')

# Check events with time slots
events_with_slots = Event.objects.filter(is_timeSlot_enabled=True)
print(f'Events with time slots: {len(events_with_slots)}')

for event in events_with_slots:
    duration = (event.end_date.date() - event.start_date.date()).days + 1
    print(f'\nEvent: {event.title}')
    print(f'Duration: {duration} day(s)')
    print(f'Recruiters: {event.recruiters_number}')
    
    # Show RDVs for this event
    rdvs = Participation.objects.filter(
        event_id=event, 
        rdv__isnull=False
    ).select_related('event_time_slot', 'talent_id')
    
    print(f'RDVs scheduled: {len(rdvs)}')
    
    # Group by time slot
    slot_groups = {}
    for rdv in rdvs:
        if rdv.event_time_slot:
            slot_key = f'{rdv.event_time_slot.start_time}-{rdv.event_time_slot.end_time}'
            if slot_key not in slot_groups:
                slot_groups[slot_key] = []
            slot_groups[slot_key].append(rdv)
    
    for slot, appointments in slot_groups.items():
        print(f'  Slot {slot}: {len(appointments)} appointments')
        for appt in appointments[:3]:  # Show first 3
            print(f'    - {appt.talent_id.name}: {appt.rdv.strftime("%Y-%m-%d %H:%M")}')
        if len(appointments) > 3:
            print(f'    ... and {len(appointments) - 3} more')

print('\n=== Events WITHOUT Time Slots ===')
events_without_slots = Event.objects.filter(is_timeSlot_enabled=False)
for event in events_without_slots:
    rdvs = Participation.objects.filter(event_id=event, rdv__isnull=False)
    print(f'{event.title}: {len(rdvs)} follow-up RDVs')
