import DefaultLayout from '@/layouts/default';
import React, { useEffect, useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    role: string;
    phone?: string;
    etablissement?: string;
    filiere?: string;
    company_name: string;
    talent_id: number;
    recruiter_id: number;
}

interface Event {
    id: number;
    title: string;
    date: string;
    location: string;
    description: string;
    type: 'conférence' | 'atelier' | 'réseautage' | 'formation';
    recruiterId: number
}

const descriptionStyles = `
        .description-content ul {
            list-style-type: disc !important;
            margin-left: 1.5rem !important;
            margin-bottom: 1rem !important;
            padding-left: 0.5rem !important;
        }
        
        .description-content ol {
            list-style-type: decimal !important;
            margin-left: 1.5rem !important;
            margin-bottom: 1rem !important;
            padding-left: 0.5rem !important;
        }
        
        .description-content li {
            display: list-item !important;
            margin-bottom: 0.25rem !important;
            line-height: 1.6 !important;
        }
        
        .description-content ul li {
            list-style-type: disc !important;
        }
        
        .description-content ol li {
            list-style-type: decimal !important;
        }
        
        .description-content p {
            margin-bottom: 0.75rem !important;
        }
        
        .description-content h1 {
            font-size: 1.5rem !important;
            font-weight: bold !important;
            margin-bottom: 1rem !important;
        }
        
        .description-content h2 {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            margin-bottom: 0.75rem !important;
        }
        
        .description-content h3 {
            font-size: 1.125rem !important;
            font-weight: 500 !important;
            margin-bottom: 0.5rem !important;
        }
        
        .description-content blockquote {
            border-left: 4px solid #d1d5db !important;
            padding-left: 1rem !important;
            font-style: italic !important;
            color: #6b7280 !important;
            margin: 1rem 0 !important;
        }
        
        .description-content a {
            color: #2563eb !important;
            text-decoration: underline !important;
        }
        
        .description-content a:hover {
            color: #1d4ed8 !important;
        }
        
        .description-content strong {
            font-weight: 600 !important;
        }
        
        .description-content em {
            font-style: italic !important;
        }
        
        .description-content code {
            background-color: #f3f4f6 !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875rem !important;
            font-family: monospace !important;
        }
        
        .description-content pre {
            background-color: #f3f4f6 !important;
            padding: 0.75rem !important;
            border-radius: 0.25rem !important;
            overflow-x: auto !important;
            margin: 1rem 0 !important;
        }
    `;

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    } as React.CSSProperties,
    header: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as React.CSSProperties,
    profileCard: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    } as React.CSSProperties,
    eventsCard: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    } as React.CSSProperties,
    title: {
        color: '#1f2937',
        fontSize: '28px',
        fontWeight: 700,
        margin: '0 0 5px 0',
    } as React.CSSProperties,
    subtitle: {
        color: '#6b7280',
        fontSize: '18px',
        fontWeight: 500,
        margin: '0 0 20px 0',
    } as React.CSSProperties,
    sectionTitle: {
        color: '#1f2937',
        fontSize: '22px',
        fontWeight: 600,
        margin: '0 0 20px 0',
        paddingBottom: '10px',
        borderBottom: '2px solid #e5e7eb',
    } as React.CSSProperties,
    profileHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px',
    } as React.CSSProperties,
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '20px',
        border: '4px solid #4a6cf7',
    } as React.CSSProperties,
    userInfo: {
        flex: 1,
    } as React.CSSProperties,
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
    } as React.CSSProperties,
    infoItem: {
        marginBottom: '15px',
    } as React.CSSProperties,
    label: {
        display: 'block',
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '5px',
    } as React.CSSProperties,
    value: {
        display: 'block',
        fontSize: '16px',
        color: '#1f2937',
        fontWeight: 500,
    } as React.CSSProperties,
    eventsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    } as React.CSSProperties,
    eventCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        borderLeft: `4px solid #4a6cf7`,
    } as React.CSSProperties,
    eventTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#1f2937',
        margin: '0 0 10px 0',
    } as React.CSSProperties,
    eventDate: {
        display: 'inline-block',
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '10px',
        padding: '4px 8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
    } as React.CSSProperties,
    eventDescription: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 15px 0',
    } as React.CSSProperties,
    eventLocation: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280',
    } as React.CSSProperties,
    icon: {
        marginRight: '8px',
    } as React.CSSProperties,
    errorMessage: {
        color: '#ef4444',
        fontSize: '14px',
        marginTop: '5px',
    } as React.CSSProperties,
    avatarPlaceholder: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '20px',
        border: '4px solid #4a6cf7',
        color: '#6b7280',
        fontSize: '40px',
        fontWeight: 'bold',
    } as React.CSSProperties,
};


const Profile = () => {
    const { user: contextUser } = useUser();
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (contextUser) {
            const userData: User = {
                ...contextUser,
                first_name: contextUser.first_name || '',
                last_name: contextUser.last_name || '',
                company_name: contextUser.company_name || '',
                talent_id: contextUser.talent_id || 0,
                recruiter_id: contextUser.recruiter_id || 0,
            };
            setUser(userData);
        }
    }, [contextUser]);

    useEffect(() => {
        if (user && user.id) {
            const fetchEvents = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const token = localStorage.getItem('authToken');

                    // For recruiters: fetch all events and filter by recruiter
                    if (user.role === 'recruiter') {
                        const response = await fetch(`http://localhost:8000/api/events/`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });

                        if (!response.ok) {
                            if (response.status === 401) {
                                setError("Session expirée. Veuillez vous reconnecter.");
                                localStorage.removeItem('authToken');
                                setTimeout(() => {
                                    window.location.href = '/login';
                                }, 3000);
                                return;
                            }
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        let eventsData = data;

                        if (data && typeof data === 'object' && !Array.isArray(data) && data.events) {
                            eventsData = data.events;
                        }

                        if (Array.isArray(eventsData)) {
                            // Filter events to show only those created by this recruiter
                            const recruiterEvents = eventsData.filter(event =>
                                event.recruiterId === user.id
                            );

                            const validEvents = recruiterEvents
                                .filter(event => event && event.title)
                                .map(event => ({
                                    id: event.id || 0,
                                    title: event.title || "Sans titre",
                                    date: event.date || event.start_date || "Date inconnue",
                                    location: event.location || "Lieu inconnu",
                                    description: event.description || "Aucune description",
                                    type: event.type || "conférence",
                                    recruiterId: event.recruiterId || 0
                                }));

                            setEvents(validEvents);
                        } else {
                            console.error("Expected an array but got:", eventsData);
                            setError("La réponse du serveur est inattendue.");
                        }
                    }
                    // For talents: fetch events they participated in
                    else {
                        const response = await fetch(`http://localhost:8000/api/user/${user.id}/events/`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });

                        if (!response.ok) {
                            if (response.status === 401) {
                                setError("Session expirée. Veuillez vous reconnecter.");
                                localStorage.removeItem('authToken');
                                setTimeout(() => {
                                    window.location.href = '/login';
                                }, 3000);
                                return;
                            }
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        let eventsData = data;

                        if (data && typeof data === 'object' && !Array.isArray(data) && data.events) {
                            eventsData = data.events;
                        }
                        if (Array.isArray(eventsData)) {
                            const validEvents = eventsData
                                .filter(event => event && event.title)
                                .map(event => ({
                                    id: event.id || 0,
                                    title: event.title || "Sans titre",
                                    date: event.date || event.start_date || "Date inconnue",
                                    location: event.location || "Lieu inconnu",
                                    description: event.description || "Aucune description",
                                    type: event.type || "conférence",
                                    recruiterId: event.recruiterId || 0
                                }));

                            setEvents(validEvents);
                        } else {
                            console.error("Expected an array but got:", eventsData);
                            setError("La réponse du serveur est inattendue.");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching events:", error);
                    setError("Impossible de charger les événements. Veuillez réessayer plus tard.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEvents();
        }
    }, [user]);

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'conférence': return '#4a6cf7';
            case 'atelier': return '#10b981';
            case 'réseautage': return '#f59e0b';
            case 'formation': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const renderDescription = (htmlContent: string) => {
        if (!htmlContent) return null;

        const cleanedContent = htmlContent
            .replace(/<p><br><\/p>/g, "")
            .replace(/<p>\s*<\/p>/g, "")
            .trim();

        if (!cleanedContent || cleanedContent === "<p></p>") {
            return (
                <p className="text-gray-500 italic">
                    Aucune description disponible pour cet événement.
                </p>
            );
        }

        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: descriptionStyles }} />
                <div
                    className="description-content text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: cleanedContent }}
                />
            </>
        );
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (!user) {
        return (
            <DefaultLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div style={styles.container}>
                <style>
                    {`
                        .event-card:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                        }
                        
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        
                        .profile-avatar {
                            animation: fadeIn 0.5s ease-out;
                        }
                    `}
                </style>

                <div style={styles.header}>
                    <h1 style={styles.title}>Mon Profil</h1>
                </div>

                {error && (
                    <div style={{ ...styles.profileCard, marginBottom: '15px', borderLeft: '4px solid #ef4444' }}>
                        <p style={styles.errorMessage}>{error}</p>
                    </div>
                )}

                <div style={styles.profileCard}>
                    <div style={styles.profileHeader}>
                        {user.avatar ? (
                            <img
                                src={`http://127.0.0.1:8000${user.avatar}`}
                                alt={`${user.first_name} ${user.last_name}`}
                                style={styles.avatar}
                                className="profile-avatar"
                            />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}

                        <div style={styles.userInfo}>
                            <h2 style={styles.title}>{`${user.first_name} ${user.last_name}`}</h2>
                            <p style={styles.subtitle}>
                                {user.role === 'recruiter' ? 'Recruteur' : 'Étudiant'}
                                {user.role === 'recruiter' && user.company_name ? ` chez ${user.company_name}` : ''}
                                {user.role === 'talent' && user.etablissement ? ` à ${user.etablissement}` : ''}
                            </p>
                        </div>
                    </div>

                    <h3 style={styles.sectionTitle}>Informations Personnelles</h3>

                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <span style={styles.label}>Prénom</span>
                            <span style={styles.value}>{user.first_name}</span>
                        </div>

                        <div style={styles.infoItem}>
                            <span style={styles.label}>Nom</span>
                            <span style={styles.value}>{user.last_name}</span>
                        </div>

                        <div style={styles.infoItem}>
                            <span style={styles.label}>Email</span>
                            <span style={styles.value}>{user.email}</span>
                        </div>

                        <div style={styles.infoItem}>
                            <span style={styles.label}>Téléphone</span>
                            <span style={styles.value}>{user.phone || 'Non renseigné'}</span>
                        </div>

                        {user.role === 'talent' && (
                            <>
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Établissement</span>
                                    <span style={styles.value}>{user.etablissement || 'Non renseigné'}</span>
                                </div>

                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Filière</span>
                                    <span style={styles.value}>{user.filiere || 'Non renseigné'}</span>
                                </div>
                            </>
                        )}

                        {user.role === 'recruiter' && (
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Entreprise</span>
                                <span style={styles.value}>{user.company_name || 'Non renseigné'}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.eventsCard}>
                    <h3 style={styles.sectionTitle}>
                        {user.role === 'recruiter' ? 'Mes Événements' : 'Mes Participations'}
                    </h3>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p style={{ color: '#6b7280', marginTop: '15px' }}>Chargement des événements...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#d1d5db"
                                strokeWidth="2"
                                style={{ margin: '0 auto 15px' }}
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>
                                Aucun événement participé pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.eventsGrid}>
                            {events.map(event => (
                                <Link to={`/events/${event?.id}`} key={event.id}>
                                    <div
                                        style={{
                                            ...styles.eventCard,
                                            borderLeft: `4px solid ${getEventTypeColor(event.type)}`
                                        }}
                                        className="event-card"
                                    >
                                        <h4 style={styles.eventTitle}>{event.title}</h4>
                                        <span style={styles.eventDate}>{event.date}</span>
                                        <div style={styles.eventDescription}>
                                            {renderDescription(event.description)}
                                        </div>
                                        <div style={styles.eventLocation}>
                                            <svg
                                                style={styles.icon}
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            {event.location}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: 'green',
                            secondary: 'white',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: 'red',
                            secondary: 'white',
                        },
                    },
                }}
            />
        </DefaultLayout>
    );
};

export default Profile;
