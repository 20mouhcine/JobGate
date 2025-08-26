# Celery RDV Reminder System Setup Guide

## ✅ What's Been Configured

1. **Celery with Redis**: Full async task queue system
2. **Periodic Tasks**: Automatic RDV reminders every hour
3. **Email Templates**: Professional HTML and text emails
4. **Urgent Reminders**: For appointments within 4 hours
5. **Django Integration**: Seamless with your existing models

## 🚀 How to Start the System

### Step 1: Install and Start Redis Server
Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

### Step 2: Start Celery Worker (in Terminal 1)
```bash
cd C:\Users\mohsi\OneDrive\Bureau\JobGate\dev\backend
.\env\Scripts\activate
celery -A backend worker --loglevel=info
```

### Step 3: Start Celery Beat Scheduler (in Terminal 2)  
```bash
cd C:\Users\mohsi\OneDrive\Bureau\JobGate\dev\backend
.\env\Scripts\activate  
celery -A backend beat --loglevel=info
```

### Step 4: Start Django Server (in Terminal 3)
```bash
cd C:\Users\mohsi\OneDrive\Bureau\JobGate\dev\backend
.\env\Scripts\activate
python manage.py runserver
```

## 🔧 Available Tasks

### Manual Testing
```bash
python manage.py test_celery
```

### Send Immediate Reminders (via Django shell)
```python
from api.tasks import send_rdv_reminders, send_urgent_rdv_reminders

# Send normal reminders  
send_rdv_reminders.delay()

# Send urgent reminders
send_urgent_rdv_reminders.delay()
```

## ⚙️ Configuration

### Current Schedule (in settings.py):
- **Regular reminders**: Every hour
- **Urgent reminders**: Can be configured as needed

### To modify timing:
Edit `CELERY_BEAT_SCHEDULE` in `backend/settings.py`

## 📧 Email System

- **HTML Templates**: Professional responsive design
- **Plain Text Fallback**: For all email clients  
- **Personalized**: Uses talent name and event details
- **Automatic**: No manual intervention needed

## 🎯 Benefits of Celery vs Other Solutions

✅ **Scalable**: Handle thousands of reminders
✅ **Reliable**: Redis ensures no lost tasks
✅ **Async**: Non-blocking email sending
✅ **Monitoring**: Built-in task monitoring  
✅ **Flexible**: Easy to add new task types
✅ **Production Ready**: Used by major companies

## 🔍 Monitoring

- Check Django Admin for scheduled tasks
- View logs in terminal outputs
- Monitor Redis with Redis CLI
- Task results stored in Redis

Your automatic RDV reminder system is now ready! 🎉
