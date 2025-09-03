import DefaultLayout from '@/layouts/default';
import React, { useEffect, useState } from 'react';
import { useUser } from "@/contexts/UserContext";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  hasAccount: boolean;
  etablissement: string;
  filiere: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'conférence' | 'atelier' | 'réseautage' | 'formation';
}

interface Participation {
  id: number;
  event: Event;
  has_attended: boolean;
  date_inscription: string;
  note: number;
  comment: string;
  is_selected: boolean;
  rdv: string | null;
  event_time_slot: number | null;
}

const Profile= () => {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>({ ...user });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`http://localhost:8000/api/user/${user.id}/events/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("API Response:", data); // Debug log
          
          // Vérifier que la réponse est un tableau
          if (Array.isArray(data)) {
            // S'assurer que tous les événements ont les propriétés requises
            const validEvents = data
              .filter(event => event && event.title) // Filtrer les événements invalides
              .map(event => ({
                id: event.id || 0,
                title: event.title || "Sans titre",
                date: event.date || event.start_date || "Date inconnue",
                location: event.location || "Lieu inconnu",
                description: event.description || "Aucune description",
                type: event.type || "conférence"
              }));
            
            setEvents(validEvents);
          } else {
            throw new Error("La réponse de l'API n'est pas un tableau");
          }
        } catch (error) {
          console.error("Error fetching events:", error);
          setError("Failed to fetch events. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchEvents();
    }
  }, [user]);

  const handleEdit = () => {
    if (isEditing) {
      // Ici, vous devriez envoyer une requête pour mettre à jour l'utilisateur
      console.log("User data to update:", editedUser);
      // Exemple: updateUser(editedUser);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conférence': return '#4a6cf7';
      case 'atelier': return '#10b981';
      case 'réseautage': return '#f59e0b';
      case 'formation': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Styles
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
    input: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      color: '#1f2937',
      boxSizing: 'border-box',
    } as React.CSSProperties,
    select: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      color: '#1f2937',
      backgroundColor: 'white',
      boxSizing: 'border-box',
    } as React.CSSProperties,
    button: {
      background: 'linear-gradient(135deg, #4a6cf7 0%, #82b1ff 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
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
  };

  return (
    <DefaultLayout>
      <div style={styles.container}>
        <style>
          {`
            .event-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(74, 108, 247, 0.3);
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
          <button 
            style={styles.button} 
            onClick={handleEdit}
          >
            {isEditing ? 'Enregistrer' : 'Modifier le Profil'}
          </button>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={styles.avatar}
              className="profile-avatar"
            />
            <div style={styles.userInfo}>
              <h2 style={styles.title}>{user.name}</h2>
              <p style={styles.subtitle}>{user.role === 'recruiter' ? 'Recruteur' : 'Étudiant'} à {user.etablissement}</p>
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Informations Personnelles</h3>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Nom complet</span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <span style={styles.value}>{user.name}</span>
              )}
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <span style={styles.value}>{user.email}</span>
              )}
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Rôle</span>
              {isEditing ? (
                <select
                  name="role"
                  value={editedUser.role}
                  onChange={handleChange}
                  style={styles.select}
                  d
                >
                  <option value="student">Étudiant</option>
                  <option value="recruiter">Recruteur</option>
                </select>
              ) : (
                <span style={styles.value}>{user.role === 'recruiter' ? 'Recruteur' : 'Étudiant'}</span>
              )}
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Établissement</span>
              {isEditing ? (
                <input
                  type="text"
                  name="etablissement"
                  value={editedUser.etablissement}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <span style={styles.value}>{user.etablissement}</span>
              )}
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Filière</span>
              {isEditing ? (
                <input
                  type="text"
                  name="filiere"
                  value={editedUser.filiere}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <span style={styles.value}>{user.filiere}</span>
              )}
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Statut du compte</span>
              <span style={styles.value}>{user.hasAccount ? 'Complet' : 'À compléter'}</span>
            </div>
          </div>
        </div>

        <div style={styles.eventsCard}>
          <h3 style={styles.sectionTitle}>Événements Participés</h3>
          
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                {isLoading ? 'Chargement...' : 'Aucun événement participé pour le moment.'}
              </p>
            </div>
          ) : (
            <div style={styles.eventsGrid}>
              {events.map(event => (
                <div 
                  key={event.id} 
                  style={styles.eventCard}
                  className="event-card"
                >
                  <h4 style={styles.eventTitle}>{event.title}</h4>
                  <span style={styles.eventDate}>{event.date}</span>
                  <p style={styles.eventDescription}>{event.description}</p>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;