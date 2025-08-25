from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from datetime import timedelta
from .models import Participation
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_rdv_reminders():
    """Periodic task to send RDV reminders for appointments in the next 24 hours"""
    now = timezone.now()
    reminder_window_start = now
    reminder_window_end = now + timedelta(hours=24)
    
    logger.info(f"🔍 Checking for RDVs between {reminder_window_start} and {reminder_window_end}")
    
    # Get participations with RDVs in the reminder window
    participations_with_rdv = Participation.objects.filter(
        rdv__gte=reminder_window_start,
        rdv__lte=reminder_window_end,
        talent_id__email__isnull=False
    ).select_related('talent_id', 'event_id')
    
    sent_count = 0
    failed_count = 0
    
    if not participations_with_rdv.exists():
        logger.info("ℹ️ No RDVs found in the next 24 hours")
        return {'sent_count': 0, 'failed_count': 0}
    
    logger.info(f"📧 Found {participations_with_rdv.count()} RDVs to remind")
    
    for participation in participations_with_rdv:
        try:
            success = send_reminder_email.delay(participation.id)
            if success:
                sent_count += 1
                logger.info(f'✅ Queued reminder for {participation.talent_id.email}')
            else:
                failed_count += 1
                logger.error(f'❌ Failed to queue reminder for {participation.talent_id.email}')
                
        except Exception as e:
            failed_count += 1
            logger.error(f'❌ Error processing reminder for {participation.talent_id.email}: {str(e)}')
    
    result_msg = f'📊 RDV reminder job completed. Queued: {sent_count}, Failed: {failed_count}'
    logger.info(result_msg)
    
    return {
        'sent_count': sent_count,
        'failed_count': failed_count
    }

@shared_task
def send_reminder_email(participation_id):
    """Send individual reminder email for a specific participation"""
    try:
        participation = Participation.objects.select_related('talent_id', 'event_id').get(id=participation_id)
        
        talent = participation.talent_id
        event = participation.event_id
        rdv_time = participation.rdv
        
        # Format the RDV time
        rdv_formatted = rdv_time.strftime("%d/%m/%Y à %H:%M")
        
        subject = f"Rappel: RDV demain pour {event.title}"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .footer {{ padding: 15px; text-align: center; color: #666; font-size: 12px; }}
                .highlight {{ background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #2563eb; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔔 Rappel de Rendez-vous</h2>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{talent.first_name} {talent.last_name}</strong>,</p>
                    
                    <p>Nous vous rappelons que vous avez un rendez-vous prévu demain :</p>
                    
                    <div class="highlight">
                        <strong>📅 Événement:</strong> {event.title}<br>
                        <strong>🕒 Date et heure:</strong> {rdv_formatted}<br>
                        <strong>📍 Lieu:</strong> {event.location or 'À définir'}
                        {f'<br><strong>🔗 Lien de réunion:</strong> <a href="{event.meeting_link}">{event.meeting_link}</a>' if event.is_online and event.meeting_link else ''}
                    </div>
                    
                    <p>Merci de confirmer votre présence et de vous présenter à l'heure.</p>
                    
                    <p>Nous avons hâte de vous rencontrer !</p>
                    
                    <p>À bientôt,<br><strong>L'équipe JobGate</strong></p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par notre système de rappels.<br>
                    Merci de ne pas répondre à cet email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
Bonjour {talent.first_name} {talent.last_name},

Nous vous rappelons que vous avez un rendez-vous prévu demain :

📅 Événement: {event.title}
🕒 Date et heure: {rdv_formatted}
📍 Lieu: {event.location or 'À définir'}
{f'🔗 Lien de réunion: {event.meeting_link}' if event.is_online and event.meeting_link else ''}

Merci de confirmer votre présence et de vous présenter à l'heure.

Nous avons hâte de vous rencontrer !

À bientôt,
L'équipe JobGate

---
Cet email a été envoyé automatiquement par notre système de rappels.
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email='noreply@jobgate.com',
            to=[talent.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f'✅ Successfully sent reminder email to {talent.email}')
        return True
        
    except Participation.DoesNotExist:
        logger.error(f'❌ Participation with ID {participation_id} not found')
        return False
    except Exception as e:
        logger.error(f'❌ Error sending reminder email for participation {participation_id}: {str(e)}')
        return False

@shared_task
def send_urgent_rdv_reminders():
    """Send urgent reminders for appointments in the next 4 hours"""
    now = timezone.now()
    reminder_window_start = now
    reminder_window_end = now + timedelta(hours=4)
    
    logger.info(f"🚨 Checking for urgent RDVs between {reminder_window_start} and {reminder_window_end}")
    
    # Get participations with RDVs in the urgent window
    participations_with_rdv = Participation.objects.filter(
        rdv__gte=reminder_window_start,
        rdv__lte=reminder_window_end,
        talent_id__email__isnull=False
    ).select_related('talent_id', 'event_id')
    
    sent_count = 0
    failed_count = 0
    
    if not participations_with_rdv.exists():
        logger.info("ℹ️ No urgent RDVs found in the next 4 hours")
        return {'sent_count': 0, 'failed_count': 0}
    
    logger.info(f"🚨 Found {participations_with_rdv.count()} urgent RDVs to remind")
    
    for participation in participations_with_rdv:
        try:
            success = send_urgent_reminder_email.delay(participation.id)
            if success:
                sent_count += 1
                logger.info(f'🚨 Queued urgent reminder for {participation.talent_id.email}')
            else:
                failed_count += 1
                
        except Exception as e:
            failed_count += 1
            logger.error(f'❌ Error processing urgent reminder for {participation.talent_id.email}: {str(e)}')
    
    result_msg = f'🚨 Urgent RDV reminder job completed. Queued: {sent_count}, Failed: {failed_count}'
    logger.info(result_msg)
    
    return {
        'sent_count': sent_count,
        'failed_count': failed_count
    }

@shared_task
def send_urgent_reminder_email(participation_id):
    """Send urgent reminder email for a specific participation"""
    try:
        participation = Participation.objects.select_related('talent_id', 'event_id').get(id=participation_id)
        
        talent = participation.talent_id
        event = participation.event_id
        rdv_time = participation.rdv
        
        # Calculate time until RDV
        time_until_rdv = rdv_time - timezone.now()
        hours = int(time_until_rdv.total_seconds() // 3600)
        minutes = int((time_until_rdv.total_seconds() % 3600) // 60)
        
        if hours > 0:
            time_str = f"{hours} heure(s)"
        else:
            time_str = f"{minutes} minute(s)"
        
        rdv_formatted = rdv_time.strftime("%d/%m/%Y à %H:%M")
        
        subject = f"🚨 URGENT - Votre RDV dans {time_str} - {event.title}"
        
        # Urgent HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .footer {{ padding: 15px; text-align: center; color: #666; font-size: 12px; }}
                .urgent {{ background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #dc3545; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🚨 RAPPEL URGENT</h2>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Votre RDV dans {time_str}</p>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{talent.first_name} {talent.last_name}</strong>,</p>
                    
                    <p style="color: #dc3545; font-weight: 600; font-size: 18px;">
                        ⏰ Votre rendez-vous commence dans {time_str} !
                    </p>
                    
                    <div class="urgent">
                        <strong>📅 Événement:</strong> {event.title}<br>
                        <strong>🕒 Date et heure:</strong> {rdv_formatted}<br>
                        <strong>📍 Lieu:</strong> {event.location or 'À définir'}
                        {f'<br><strong>🔗 Lien de réunion:</strong> <a href="{event.meeting_link}">{event.meeting_link}</a>' if event.is_online and event.meeting_link else ''}
                    </div>
                    
                    <p><strong>Merci de vous préparer et de vous présenter à l'heure !</strong></p>
                    
                    <p>Bonne chance pour votre rendez-vous !</p>
                    
                    <p>L'équipe JobGate</p>
                </div>
                <div class="footer">
                    <p>Cet email urgent a été envoyé automatiquement.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
🚨 RAPPEL URGENT - Votre RDV dans {time_str}

Bonjour {talent.first_name} {talent.last_name},

⏰ Votre rendez-vous commence dans {time_str} !

📅 Événement: {event.title}
🕒 Date et heure: {rdv_formatted}
📍 Lieu: {event.location or 'À définir'}
{f'🔗 Lien de réunion: {event.meeting_link}' if event.is_online and event.meeting_link else ''}

Merci de vous préparer et de vous présenter à l'heure !

Bonne chance pour votre rendez-vous !

L'équipe JobGate
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email='noreply@jobgate.com',
            to=[talent.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f'🚨 Successfully sent urgent reminder email to {talent.email}')
        return True
        
    except Participation.DoesNotExist:
        logger.error(f'❌ Participation with ID {participation_id} not found')
        return False
    except Exception as e:
        logger.error(f'❌ Error sending urgent reminder email for participation {participation_id}: {str(e)}')
        return False