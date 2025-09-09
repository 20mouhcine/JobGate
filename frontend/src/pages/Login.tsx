import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { LoginFormData } from '@/types';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login, isLoading } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer les messages d'erreur lorsque l'utilisateur modifie le formulaire
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Connexion réussie - rediriger vers la page précédente ou dashboard
        // navigate(-1);
        navigate('/events')
      } else {
        setErrorMessage('Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage("Veuillez entrer votre adresse email");
      return;
    }

    setForgotPasswordLoading(true);
    setErrorMessage('');

    try {
      // Envoi de la requête à l'API locale pour la réinitialisation de mot de passe
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Email de réinitialisation envoyé avec succès
        console.log('Email de réinitialisation envoyé à:', formData.email);
        setResetEmailSent(true);

        // Réinitialiser après 5 secondes
        setTimeout(() => {
          setForgotPassword(false);
          setResetEmailSent(false);
        }, 5000);
      } else {
        // Gestion des erreurs de l'API
        setErrorMessage(data.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête:", error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Styles sous forme d'objets TypeScript
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    } as React.CSSProperties,
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      animation: 'fadeIn 0.5s ease-out',
    } as React.CSSProperties,
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    } as React.CSSProperties,
    title: {
      color: '#4a6cf7',
      marginBottom: '10px',
      fontWeight: 600,
      fontSize: '28px',
    } as React.CSSProperties,
    subtitle: {
      color: '#666',
      fontSize: '16px',
    } as React.CSSProperties,
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    } as React.CSSProperties,
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    } as React.CSSProperties,
    label: {
      marginBottom: '8px',
      fontWeight: 500,
      color: '#444',
      fontSize: '14px',
    } as React.CSSProperties,
    input: {
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      background: '#fff',
      width: '100%',
      boxSizing: 'border-box',
    } as React.CSSProperties,
    passwordContainer: {
      position: 'relative',
    } as React.CSSProperties,
    passwordToggle: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#4a6cf7',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
    } as React.CSSProperties,
    loginButton: {
      background: 'linear-gradient(135deg, #4a6cf7 0%, #82b1ff 100%)',
      color: 'white',
      border: 'none',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50px',
      width: '100%',
    } as React.CSSProperties,
    secondaryButton: {
      background: 'linear-gradient(135deg, #e7c21eff 0%, #f2c912ff 100%)',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginTop: '10px',
      width: '100%',
    } as React.CSSProperties,
    footer: {
      textAlign: 'center',
      marginTop: '30px',
    } as React.CSSProperties,
    link: {
      color: '#4a6cf7',
      textDecoration: 'none',
      fontWeight: 500,
      cursor: 'pointer',
    } as React.CSSProperties,
    footerText: {
      marginTop: '15px',
      color: '#666',
      fontSize: '14px',
    } as React.CSSProperties,
    spinner: {
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
    } as React.CSSProperties,
    message: {
      padding: '12px',
      borderRadius: '8px',
      marginTop: '15px',
      textAlign: 'center',
      fontSize: '14px',
    } as React.CSSProperties,
    successMessage: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    } as React.CSSProperties,
    errorMessage: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <style>
        {`
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
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          input:focus {
            outline: none;
            border-color: #4a6cf7;
            box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
          }
          
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(74, 108, 247, 0.3);
          }
          
          button:disabled {
            opacity: 0.8;
            cursor: not-allowed;
          }
          
          a:hover {
            color: #3a56d5;
            text-decoration: underline;
          }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {forgotPassword ? 'Réinitialisation' : 'Bienvenue'}
          </h1>
          <p style={styles.subtitle}>
            {forgotPassword
              ? 'Entrez votre email pour réinitialiser votre mot de passe'
              : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {errorMessage && (
          <div style={{...styles.message, ...styles.errorMessage}}>
            {errorMessage}
          </div>
        )}

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="resetEmail" style={styles.label}>Email</label>
              <input
                type="email"
                id="resetEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              style={styles.loginButton}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <div style={styles.spinner}></div>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                setForgotPassword(false);
                setErrorMessage('');
              }}
              disabled={forgotPasswordLoading}
            >
              Retour à la connexion
            </button>

            {resetEmailSent && (
              <div style={{ ...styles.message, ...styles.successMessage }}>
                Un email de réinitialisation a été envoyé à {formData.email}
              </div>
            )}
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="password" style={styles.label}>Mot de passe</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    required
                    style={styles.input}
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={styles.spinner}></div>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <div style={styles.footer}>
              <a
                style={styles.link}
                onClick={() => setForgotPassword(true)}
              >
                Mot de passe oublié?
              </a>
              <p style={styles.footerText}>
                Pas encore de compte? <Link to="/signup" style={styles.link}>S'inscrire</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;