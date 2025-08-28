from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta, time
from api.models import Event, Talent, Participation, TimeSlot
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import random
import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont
import io

# Try to import reportlab, use fallback if not available
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            TimeSlot.objects.all().delete()
            Participation.objects.all().delete()
            Event.objects.all().delete()
            Talent.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write(self.style.SUCCESS('Starting database population...'))
        
        # Create Events
        self.create_events()
        
        # Create Talents
        self.create_talents()
        
        # Create TimeSlots for events that have them enabled
        self.create_time_slots()
        
        # Create Participations
        self.create_participations()
        
        self.stdout.write(self.style.SUCCESS('Database population completed!'))

    def create_placeholder_image(self, width=800, height=400, color='#6B7280', text=''):
        """Create a placeholder image for events with text overlay"""
        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError:
            # Fallback to simple colored rectangle if PIL is not available
            img = Image.new('RGB', (width, height), color=color)
            img_io = io.BytesIO()
            img.save(img_io, 'JPEG', quality=85)
            img_io.seek(0)
            return ContentFile(img_io.getvalue())
        
        # Convert hex color to RGB
        if color.startswith('#'):
            color = color[1:]
        rgb_color = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        
        # Create gradient background
        img = Image.new('RGB', (width, height), rgb_color)
        draw = ImageDraw.Draw(img)
        
        # Add gradient effect
        for i in range(height):
            alpha = i / height
            r = int(rgb_color[0] * (1 - alpha * 0.3))
            g = int(rgb_color[1] * (1 - alpha * 0.3))
            b = int(rgb_color[2] * (1 - alpha * 0.3))
            draw.line([(0, i), (width, i)], fill=(r, g, b))
        
        # Add text overlay if provided
        if text:
            try:
                # Try to use a system font
                font_size = 60
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                # Fallback to default font
                font = ImageFont.load_default()
            
            # Calculate text position (centered)
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            
            # Add shadow
            draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 128))
            # Add main text
            draw.text((x, y), text, font=font, fill=(255, 255, 255))
        
        # Add decorative elements
        # Add some geometric shapes for visual interest
        overlay = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Add circles
        for _ in range(3):
            x = random.randint(0, width)
            y = random.randint(0, height)
            radius = random.randint(50, 150)
            overlay_draw.ellipse(
                [x - radius, y - radius, x + radius, y + radius],
                fill=(255, 255, 255, 30)
            )
        
        # Composite the overlay
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        
        # Convert to bytes
        img_io = io.BytesIO()
        img.save(img_io, 'JPEG', quality=85)
        img_io.seek(0)
        
        return ContentFile(img_io.getvalue())

    def create_sample_resume(self, talent_name, etablissement, filiere, email, phone):
        """Create a sample PDF resume for a talent"""
        if REPORTLAB_AVAILABLE:
            try:
                buffer = io.BytesIO()
                p = canvas.Canvas(buffer, pagesize=letter)
                width, height = letter
                
                # Header
                p.setFont("Helvetica-Bold", 20)
                p.drawString(50, height - 50, talent_name)
                
                p.setFont("Helvetica", 12)
                p.drawString(50, height - 80, f"Email: {email}")
                p.drawString(50, height - 100, f"Phone: {phone}")
                
                # Education Section
                p.setFont("Helvetica-Bold", 16)
                p.drawString(50, height - 140, "EDUCATION")
                
                p.setFont("Helvetica", 12)
                p.drawString(50, height - 170, f"Institution: {etablissement}")
                p.drawString(50, height - 190, f"Field of Study: {filiere}")
                p.drawString(50, height - 210, "Graduation Year: 2025")
                
                # Skills Section
                p.setFont("Helvetica-Bold", 16)
                p.drawString(50, height - 250, "SKILLS")
                
                # Sample skills based on field
                skills = self.get_skills_by_field(filiere)
                p.setFont("Helvetica", 12)
                y_pos = height - 280
                for skill in skills:
                    p.drawString(70, y_pos, f"• {skill}")
                    y_pos -= 20
                
                # Experience Section
                p.setFont("Helvetica-Bold", 16)
                p.drawString(50, y_pos - 30, "EXPERIENCE")
                
                p.setFont("Helvetica", 12)
                p.drawString(50, y_pos - 60, "Intern - Summer 2024")
                p.drawString(50, y_pos - 80, "Relevant internship experience in the field")
                p.drawString(50, y_pos - 100, "• Worked on real-world projects")
                p.drawString(50, y_pos - 120, "• Collaborated with team members")
                p.drawString(50, y_pos - 140, "• Gained practical experience")
                
                # Languages Section
                p.setFont("Helvetica-Bold", 16)
                p.drawString(50, y_pos - 180, "LANGUAGES")
                
                p.setFont("Helvetica", 12)
                p.drawString(50, y_pos - 210, "• Arabic (Native)")
                p.drawString(50, y_pos - 230, "• French (Fluent)")
                p.drawString(50, y_pos - 250, "• English (Advanced)")
                
                p.showPage()
                p.save()
                
                pdf_content = buffer.getvalue()
                buffer.close()
                
                return ContentFile(pdf_content)
                
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'PDF generation failed for {talent_name}, using text fallback: {e}'))
        
        # Fallback: create a simple text file
        content = f"""RESUME - {talent_name}

Contact Information:
Email: {email}
Phone: {phone}

Education:
Institution: {etablissement}
Field of Study: {filiere}
Graduation Year: 2025

Skills:
{chr(10).join(f"• {skill}" for skill in self.get_skills_by_field(filiere))}

Experience:
Intern - Summer 2024
Relevant internship experience in the field
• Worked on real-world projects
• Collaborated with team members
• Gained practical experience

Languages:
• Arabic (Native)
• French (Fluent)  
• English (Advanced)
"""
        return ContentFile(content.encode('utf-8'))

    def get_skills_by_field(self, filiere):
        """Return relevant skills based on the field of study"""
        skills_map = {
            'Génie Informatique': ['Python', 'Java', 'JavaScript', 'SQL', 'Git', 'Linux'],
            'Finance et Comptabilité': ['Excel', 'Financial Analysis', 'Accounting', 'SAP', 'Bloomberg'],
            'Génie Électrique': ['Circuit Design', 'MATLAB', 'AutoCAD', 'PLC Programming', 'Power Systems'],
            'Médecine Générale': ['Patient Care', 'Diagnosis', 'Medical Research', 'Clinical Skills'],
            'Génie Civil': ['AutoCAD', 'Project Management', 'Structural Analysis', 'Construction'],
            'Marketing Digital': ['Google Analytics', 'Social Media', 'SEO', 'Content Marketing'],
            'Génie Logiciel': ['Software Development', 'Agile', 'Testing', 'DevOps', 'Databases'],
            'Droit des Affaires': ['Legal Research', 'Contract Law', 'Corporate Law', 'Litigation'],
            'Génie Mécanique': ['SolidWorks', 'Thermodynamics', 'Manufacturing', 'CAD Design'],
            'Biologie Moléculaire': ['Laboratory Techniques', 'PCR', 'Cell Culture', 'Data Analysis'],
            'Gestion des Ressources Humaines': ['Recruitment', 'Employee Relations', 'HR Policies'],
            'Génie Industriel': ['Process Optimization', 'Quality Control', 'Lean Manufacturing'],
            'Informatique et Télécommunications': ['Networking', 'Cybersecurity', 'Cloud Computing'],
            'Management International': ['Strategic Planning', 'Cross-cultural Communication', 'Leadership'],
            'Génie des Procédés': ['Process Design', 'Chemical Engineering', 'Safety Management'],
        }
        
        return skills_map.get(filiere, ['Problem Solving', 'Communication', 'Teamwork', 'Leadership'])

    def create_events(self):
        self.stdout.write('Creating events...')
        
        event_data = [
            {
                'title': 'Job Fair Tech 2025',
                'caption': 'Discover exciting opportunities in technology',
                'description': 'Join us for the biggest tech job fair of the year. Meet top companies, network with professionals, and find your dream job in technology.',
                'location': 'Casablanca Convention Center',
                'is_online': False,
                'is_timeSlot_enabled': True,
                'recruiters_number': 15,
                'image_color': '#4F46E5',  # Indigo
            },
            {
                'title': 'Virtual Startup Recruitment',
                'caption': 'Connect with innovative startups',
                'description': 'An online event connecting talented individuals with fast-growing startups. Explore opportunities in a dynamic environment.',
                'location': None,
                'is_online': True,
                'is_timeSlot_enabled': True,
                'recruiters_number': 8,
                'meeting_link': 'https://zoom.us/j/1234567890',
                'image_color': '#10B981',  # Emerald
            },
            {
                'title': 'Banking & Finance Career Day',
                'caption': 'Explore careers in financial services',
                'description': 'Meet representatives from major banks and financial institutions. Learn about various career paths in finance.',
                'location': 'Rabat Business District',
                'is_online': False,
                'is_timeSlot_enabled': False,
                'recruiters_number': 12,
                'image_color': '#F59E0B',  # Amber
            },
            {
                'title': 'Healthcare Professionals Expo',
                'caption': 'Healthcare career opportunities',
                'description': 'Connect with hospitals, clinics, and healthcare organizations. Find opportunities for medical professionals.',
                'location': 'Marrakech Medical Center',
                'is_online': False,
                'is_timeSlot_enabled': True,
                'recruiters_number': 10,
                'image_color': '#EF4444',  # Red
            },
            {
                'title': 'Engineering Excellence Summit',
                'caption': 'Engineering careers across industries',
                'description': 'Showcase your engineering skills to top companies. Opportunities in civil, mechanical, electrical, and software engineering.',
                'location': 'Tangier Engineering Hub',
                'is_online': False,
                'is_timeSlot_enabled': False,
                'recruiters_number': 20,
                'image_color': '#8B5CF6',  # Violet
            },
            {
                'title': 'Remote Work Opportunities Fair',
                'caption': 'Work from anywhere opportunities',
                'description': 'Discover remote work opportunities with companies from around the world. Perfect for digital nomads.',
                'location': None,
                'is_online': True,
                'is_timeSlot_enabled': True,
                'recruiters_number': 25,
                'meeting_link': 'https://teams.microsoft.com/meet/remote-fair',
                'image_color': '#06B6D4',  # Cyan
            },
        ]
        
        events = []
        for i, data in enumerate(event_data):
            start_date = timezone.now() + timedelta(days=random.randint(7, 60))
            
            # Some events last multiple days (20% chance for 2-3 days)
            if random.choice([True] + [False] * 4):  # 20% chance
                event_duration_days = random.randint(2, 3)
                end_date = start_date + timedelta(days=event_duration_days - 1, hours=random.randint(4, 8))
            else:
                # Single day event
                end_date = start_date + timedelta(hours=random.randint(4, 8))
            
            # Create placeholder image
            image_file = self.create_placeholder_image(
                color=data.get('image_color', '#6B7280'), 
                text=data['title'][:20]
            )
            
            event = Event.objects.create(
                title=data['title'],
                caption=data['caption'],
                description=data['description'],
                start_date=start_date,
                end_date=end_date,
                location=data['location'],
                recruiterId=random.randint(1, 10),
                is_timeSlot_enabled=data['is_timeSlot_enabled'],
                is_online=data['is_online'],
                recruiters_number=data['recruiters_number'],
                meeting_link=data.get('meeting_link'),
            )
            
            # Save the image
            image_filename = f"event_{event.id}_{data['title'].lower().replace(' ', '_')}.jpg"
            event.image.save(image_filename, image_file, save=True)
            
            events.append(event)
            
        self.stdout.write(f'Created {len(events)} events.')

    def create_talents(self):
        self.stdout.write('Creating talents...')
        
        talent_data = [
            {
                'name': 'Ahmed El Mansouri',
                'email': 'ahmed.mansouri@email.com',
                'phone': '+212123456789',
                'etablissement': 'ENSA Casablanca',
                'filiere': 'Génie Informatique',
            },
            {
                'name': 'Fatima Zahra Benjelloun',
                'email': 'fatima.benjelloun@email.com',
                'phone': '+212123456790',
                'etablissement': 'ENCG Rabat',
                'filiere': 'Finance et Comptabilité',
            },
            {
                'name': 'Youssef Alaoui',
                'email': 'youssef.alaoui@email.com',
                'phone': '+212123456791',
                'etablissement': 'FST Fès',
                'filiere': 'Génie Électrique',
            },
            {
                'name': 'Aicha Benali',
                'email': 'aicha.benali@email.com',
                'phone': '+212123456792',
                'etablissement': 'Faculté de Médecine Rabat',
                'filiere': 'Médecine Générale',
            },
            {
                'name': 'Mohamed Chakir',
                'email': 'mohamed.chakir@email.com',
                'phone': '+212123456793',
                'etablissement': 'EMI Rabat',
                'filiere': 'Génie Civil',
            },
            {
                'name': 'Salma Idrissi',
                'email': 'salma.idrissi@email.com',
                'phone': '+212123456794',
                'etablissement': 'ISCAE Casablanca',
                'filiere': 'Marketing Digital',
            },
            {
                'name': 'Hamza Berrada',
                'email': 'hamza.berrada@email.com',
                'phone': '+212123456795',
                'etablissement': 'ENSA Marrakech',
                'filiere': 'Génie Logiciel',
            },
            {
                'name': 'Nadia Tazi',
                'email': 'nadia.tazi@email.com',
                'phone': '+212123456796',
                'etablissement': 'FSJES Casablanca',
                'filiere': 'Droit des Affaires',
            },
            {
                'name': 'Omar Senhaji',
                'email': 'omar.senhaji@email.com',
                'phone': '+212123456797',
                'etablissement': 'ENSA Tétouan',
                'filiere': 'Génie Mécanique',
            },
            {
                'name': 'Zineb Hassouni',
                'email': 'zineb.hassouni@email.com',
                'phone': '+212123456798',
                'etablissement': 'FST Settat',
                'filiere': 'Biologie Moléculaire',
            },
            {
                'name': 'Karim Benkirane',
                'email': 'karim.benkirane@email.com',
                'phone': '+212123456799',
                'etablissement': 'ENCG Agadir',
                'filiere': 'Gestion des Ressources Humaines',
            },
            {
                'name': 'Imane Radi',
                'email': 'imane.radi@email.com',
                'phone': '+212123456800',
                'etablissement': 'ENSA Agadir',
                'filiere': 'Génie Industriel',
            },
            {
                'name': 'Anas Benjamaa',
                'email': 'anas.benjamaa@email.com',
                'phone': '+212123456801',
                'etablissement': 'FST Tangier',
                'filiere': 'Informatique et Télécommunications',
            },
            {
                'name': 'Laila Berrada',
                'email': 'laila.berrada@email.com',
                'phone': '+212123456802',
                'etablissement': 'ENCG Marrakech',
                'filiere': 'Management International',
            },
            {
                'name': 'Reda Alami',
                'email': 'reda.alami@email.com',
                'phone': '+212123456803',
                'etablissement': 'ENSA Oujda',
                'filiere': 'Génie des Procédés',
            },
        ]
        
        talents = []
        for data in talent_data:
            # Create the talent first
            talent = Talent.objects.create(**data)
            
            # Generate and attach resume
            resume_file = self.create_sample_resume(
                talent_name=data['name'],
                etablissement=data['etablissement'],
                filiere=data['filiere'],
                email=data['email'],
                phone=data['phone']
            )
            
            # Save the resume
            file_extension = '.pdf' if REPORTLAB_AVAILABLE else '.txt'
            resume_filename = f"resume_{talent.id}_{data['name'].lower().replace(' ', '_')}{file_extension}"
            talent.resume.save(resume_filename, resume_file, save=True)
            
            talents.append(talent)
            
        self.stdout.write(f'Created {len(talents)} talents.')

    def create_time_slots(self):
        self.stdout.write('Creating time slots...')
        
        events_with_slots = Event.objects.filter(is_timeSlot_enabled=True)
        time_slots_created = 0
        
        for event in events_with_slots:
            start_hour = 9  # 9 AM
            
            # Create 6 time slots of 1 hour each (same slots regardless of event duration)
            for i in range(6):
                start_time = time(start_hour + i, 0)
                end_time = time(start_hour + i + 1, 0)
                
                # Capacity per time slot = recruiters_number * slots_per_recruiter
                slots_per_recruiter = random.randint(3, 8)
                total_capacity = event.recruiters_number * slots_per_recruiter
                
                # Only create if it doesn't exist (avoid duplicates)
                time_slot, created = TimeSlot.objects.get_or_create(
                    event=event,
                    start_time=start_time,
                    end_time=end_time,
                    defaults={'slot': total_capacity}
                )
                if created:
                    time_slots_created += 1
                
        self.stdout.write(f'Created {time_slots_created} time slots.')

    def create_participations(self):
        self.stdout.write('Creating participations...')
        
        events = Event.objects.all()
        talents = list(Talent.objects.all())
        participations_created = 0
        
        for event in events:
            # Randomly select talents for this event (30-80% of all talents)
            num_participants = random.randint(
                int(len(talents) * 0.3), 
                int(len(talents) * 0.8)
            )
            participating_talents = random.sample(talents, num_participants)
            
            if event.is_timeSlot_enabled:
                # Handle events with time slots
                time_slots = list(TimeSlot.objects.filter(event=event))
                
                # Track RDV assignments per time slot
                rdv_assignments = {}  # {time_slot_id: {datetime: count}}
                
                for talent in participating_talents:
                    # Determine if they attended (70% chance)
                    has_attended = random.choice([True] * 7 + [False] * 3)
                    
                    # Assign a time slot
                    assigned_time_slot = random.choice(time_slots) if time_slots else None
                    
                    participation_data = {
                        'talent_id': talent,
                        'event_id': event,
                        'has_attended': has_attended,
                        'note': random.randint(0, 5) if has_attended else 0,
                        'is_selected': random.choice([True, False]) if has_attended else False,
                        'event_time_slot': assigned_time_slot,
                    }
                    
                    # Add comment for some participants
                    if has_attended and random.choice([True, False]):
                        comments = [
                            'Excellent candidate with strong technical skills',
                            'Good communication skills and team player',
                            'Needs improvement in technical knowledge',
                            'Very promising candidate for future opportunities',
                            'Outstanding presentation and problem-solving skills',
                            'Good potential but lacks experience',
                        ]
                        participation_data['comment'] = random.choice(comments)
                    
                    # Schedule RDV if they attended and were selected (30% chance)
                    if has_attended and participation_data['is_selected'] and assigned_time_slot:
                        rdv_datetime = self.schedule_rdv_in_time_slot(
                            event, assigned_time_slot, rdv_assignments
                        )
                        participation_data['rdv'] = rdv_datetime
                    
                    Participation.objects.create(**participation_data)
                    participations_created += 1
            
            else:
                # Handle events without time slots - simple follow-up meetings
                for talent in participating_talents:
                    has_attended = random.choice([True] * 7 + [False] * 3)
                    
                    participation_data = {
                        'talent_id': talent,
                        'event_id': event,
                        'has_attended': has_attended,
                        'note': random.randint(0, 5) if has_attended else 0,
                        'is_selected': random.choice([True, False]) if has_attended else False,
                    }
                    
                    # Add comment for some participants
                    if has_attended and random.choice([True, False]):
                        comments = [
                            'Excellent candidate with strong technical skills',
                            'Good communication skills and team player',
                            'Needs improvement in technical knowledge',
                            'Very promising candidate for future opportunities',
                            'Outstanding presentation and problem-solving skills',
                            'Good potential but lacks experience',
                        ]
                        participation_data['comment'] = random.choice(comments)
                    
                    # Schedule follow-up RDV for selected candidates (20% chance)
                    if has_attended and participation_data['is_selected'] and random.choice([True] + [False] * 4):
                        rdv_date = event.end_date + timedelta(days=random.randint(1, 14))
                        participation_data['rdv'] = rdv_date
                    
                    Participation.objects.create(**participation_data)
                    participations_created += 1
                    
        self.stdout.write(f'Created {participations_created} participations.')

    def schedule_rdv_in_time_slot(self, event, time_slot, rdv_assignments):
        """Schedule RDV within a specific time slot, considering recruiter capacity"""
        
        # Initialize tracking for this time slot if not exists
        if time_slot.id not in rdv_assignments:
            rdv_assignments[time_slot.id] = {}
        
        # Calculate event duration to pick a random day
        event_duration = (event.end_date.date() - event.start_date.date()).days + 1
        random_day_offset = random.randint(0, event_duration - 1)
        rdv_date = event.start_date.date() + timedelta(days=random_day_offset)
        
        # Create RDV datetime within the time slot
        rdv_datetime = datetime.combine(rdv_date, time_slot.start_time)
        rdv_datetime = timezone.make_aware(rdv_datetime)
        
        # Track this RDV assignment
        rdv_key = rdv_datetime.isoformat()
        if rdv_key not in rdv_assignments[time_slot.id]:
            rdv_assignments[time_slot.id][rdv_key] = 0
        
        rdv_assignments[time_slot.id][rdv_key] += 1
        
        # Check if we've exceeded recruiter capacity for this time slot
        # Each recruiter can handle multiple candidates in the same time slot
        max_per_slot = event.recruiters_number * random.randint(2, 4)  # 2-4 candidates per recruiter per slot
        
        if rdv_assignments[time_slot.id][rdv_key] > max_per_slot:
            # If capacity exceeded, try next available slot or add small time offset
            minutes_offset = rdv_assignments[time_slot.id][rdv_key] * 10  # 10 min intervals
            if minutes_offset < 60:  # Stay within the hour
                rdv_datetime += timedelta(minutes=minutes_offset)
        
        return rdv_datetime
