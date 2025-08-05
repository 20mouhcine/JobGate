from django.urls import path
from .views import EventView, EventDetailView, TalentView,TalentDetailView, ParticipationView, ParticipationDetailView, TimeSlotView, FileUploadView

urlpatterns = [
    path('events/', EventView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail-update'),
    path('talents/', TalentView.as_view(), name='talents-list-create'),
    path('talents/<int:pk>/', TalentDetailView.as_view(), name='talent-detail-update'),
    path('participations/', ParticipationView.as_view(), name='participation-list-create'),
    path('participations-details/', ParticipationDetailView.as_view(), name='participation-detail'),

    path('time-slots/', TimeSlotView.as_view(), name='time-slot-list-create'),

    path('upload/', FileUploadView.as_view(), name='file-upload'),



    ]