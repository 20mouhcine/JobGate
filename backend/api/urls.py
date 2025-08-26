from django.urls import path
from .views import EventView, EventDetailView, TalentView,TalentDetailView, ParticipationView, ParticipationDetailView, TimeSlotView, FileUploadView,ParticipationsEventView, EventStatisticsView, RDVReminderView, SendSelectionEmailView

urlpatterns = [
    path('events/', EventView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail-update'),
    path('events/<int:event_id>/statistics/', EventStatisticsView.as_view(), name='event-statistics'),
    path('events/<int:event_id>/send-selection-email/', SendSelectionEmailView.as_view(), name='send-selection-email'),
    path('talents/', TalentView.as_view(), name='talents-list-create'),
    path('talents/<int:pk>/', TalentDetailView.as_view(), name='talent-detail-update'),

    path('participations/', ParticipationView.as_view(), name='participation-list-create'),
    
    path('participations-details/', ParticipationDetailView.as_view(), name='participation-detail'),
    path('participations/<int:pk>/', ParticipationsEventView.as_view(), name='participation-detail-by-event_id'),

    path('time-slots/', TimeSlotView.as_view(), name='time-slot-list-create'),

    path('send-rdv-reminders/', RDVReminderView.as_view(), name='send-rdv-reminders'),

    path('upload/', FileUploadView.as_view(), name='file-upload'),



    ]