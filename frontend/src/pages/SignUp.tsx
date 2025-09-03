import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { SignupFormData } from '@/types';

// Note: You may need to adjust the SignupFormData interface in types/index.ts 
// to match the field names used in this component (firstName vs first_name, etc.)

const Signup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'talent',
    phone: '',
    etablissement: '',
    filiere: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useUser();

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
    
    if (currentStep === 1) {
      // Validation des mots de passe pour la première étape
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Les mots de passe ne correspondent pas");
        return;
      }
      
      // Passer à l'étape 2
      setCurrentStep(2);
      setErrorMessage('');
      return;
    }
    
    // Étape 2 - Soumission finale
    setSignupLoading(true);
    setErrorMessage('');

    try {
      // Envoi de la requête à l'API locale
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          phone: formData.phone,
          etablissement: formData.etablissement,
          filiere: formData.filiere,
          role: 'talent',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Inscription réussie
        console.log('Inscription réussie:', data);
        setSignupSuccess(true);
        
        // Optionnel: Se connecter automatiquement après l'inscription
        setTimeout(async () => {
          const loginSuccess = await login(formData.email, formData.password);
          if (loginSuccess) {
            navigate('/dashboard'); // ou toute autre page
          }
        }, 2000);
      } else {
        // Gestion des erreurs de l'API
        setErrorMessage(data.message || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la requête:', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setErrorMessage('');
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
      boxSizing: 'border-box',
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
      paddingRight: '45px',
    } as React.CSSProperties,
    passwordContainer: {
      position: 'relative',
    } as React.CSSProperties,
    eyeButton: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#888',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
    } as React.CSSProperties,
    signupButton: {
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
    nameRow: {
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap' as 'wrap',
    } as React.CSSProperties,
    nameInputContainer: {
      flex: '1 1 45%',
      minWidth: '150px',
    } as React.CSSProperties,
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '30px',
      gap: '10px',
    } as React.CSSProperties,
    stepDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
    stepDotActive: {
      backgroundColor: '#4a6cf7',
    } as React.CSSProperties,
    stepDotInactive: {
      backgroundColor: '#ddd',
    } as React.CSSProperties,
    stepLine: {
      width: '40px',
      height: '2px',
      backgroundColor: '#ddd',
    } as React.CSSProperties,
    backButton: {
      background: 'transparent',
      color: '#4a6cf7',
      border: '2px solid #4a6cf7',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginRight: '10px',
    } as React.CSSProperties,
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
    } as React.CSSProperties,
  };

  // Icône d'œil SVG pour afficher le mot de passe
  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {show ? (
        // Icône œil barré (masquer)
        <>
          <path 
            d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.6696 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45744 11.9998C3.73156 16.0539 7.54259 19 11.999 19C13.9371 19 15.7264 18.4182 17.1775 17.4334M10.999 5.04939C11.328 5.01672 11.6617 5 11.999 5C16.4554 5 20.2664 7.94614 21.5406 12.0002C21.1272 13.3752 20.3184 14.6109 19.2381 15.5983" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </>
      ) : (
        // Icône œil normal (afficher)
        <>
          <path 
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap='round' 
            strokeLinejoin='round'
          />
          <path 
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );

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
            box-shadow: 0 5px 20px rgba(203, 209, 233, 0.3);
          }
          
          button:disabled {
            opacity: 0.8;
            cursor: not-allowed;
          }
          
          .back-button:hover {
            background-color: #4a6cf7;
            color: white;
          }
          
          a:hover {
            color: #3a56d5;
            text-decoration: underline;
          }

          .eye-button:hover {
            color: #4a6cf7;
          }

          @media (max-width: 480px) {
            .name-row {
              flex-direction: column;
              gap: 0;
            }
          }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>
            {currentStep === 1 ? 'Informations de base' : 'Informations complémentaires'}
          </p>
          
          {/* Step indicator */}
          <div style={styles.stepIndicator}>
            <div style={{
              ...styles.stepDot,
              ...(currentStep >= 1 ? styles.stepDotActive : styles.stepDotInactive)
            }}></div>
            <div style={styles.stepLine}></div>
            <div style={{
              ...styles.stepDot,
              ...(currentStep >= 2 ? styles.stepDotActive : styles.stepDotInactive)
            }}></div>
          </div>
        </div>

        {signupSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{...styles.message, ...styles.successMessage}}>
              <h3>Inscription réussie!</h3>
              <p>Votre compte a été créé avec succès. Vous allez être connecté automatiquement...</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link to="/login" style={styles.link}>
                <button style={styles.signupButton}>
                  Se connecter manuellement
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={styles.form}>
              {currentStep === 1 ? (
                <>
                  {/* Step 1: Basic Information */}
                  <div style={styles.nameRow} className="name-row">
                    <div style={styles.nameInputContainer}>
                      <div style={styles.inputGroup}>
                        <label htmlFor="firstName" style={styles.label}>Prénom</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Votre prénom"
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>
                    
                    <div style={styles.nameInputContainer}>
                      <div style={styles.inputGroup}>
                        <label htmlFor="lastName" style={styles.label}>Nom</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Votre nom"
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>

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
                        placeholder="Créez un mot de passe"
                        required
                        style={styles.input}
                      />
                      <button
                        type="button"
                        style={styles.eyeButton}
                        onClick={() => setShowPassword(!showPassword)}
                        className="eye-button"
                        tabIndex={-1}
                      >
                        <EyeIcon show={showPassword} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label htmlFor="confirmPassword" style={styles.label}>Confirmer le mot de passe</label>
                    <div style={styles.passwordContainer}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmez votre mot de passe"
                        required
                        style={styles.input}
                      />
                      <button
                        type="button"
                        style={styles.eyeButton}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="eye-button"
                        tabIndex={-1}
                      >
                        <EyeIcon show={showConfirmPassword} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Additional Information */}
                  <div style={styles.inputGroup}>
                    <label htmlFor="phone" style={styles.label}>Numéro de téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Votre numéro de téléphone"
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label htmlFor="etablissement" style={styles.label}>Établissement</label>
                    <input
                      type="text"
                      id="etablissement"
                      name="etablissement"
                      value={formData.etablissement}
                      onChange={handleChange}
                      placeholder="Votre établissement"
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label htmlFor="filiere" style={styles.label}>Filière</label>
                    <input
                      type="text"
                      id="filiere"
                      name="filiere"
                      value={formData.filiere}
                      onChange={handleChange}
                      placeholder="Votre filière d'études"
                      required
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              {errorMessage && (
                <div style={{...styles.message, ...styles.errorMessage}}>
                  {errorMessage}
                </div>
              )}

              <div style={styles.buttonContainer}>
                {currentStep === 2 && (
                  <button 
                    type="button"
                    style={styles.backButton}
                    onClick={handlePreviousStep}
                    className="back-button"
                  >
                    Retour
                  </button>
                )}
                
                <button 
                  type="submit" 
                  style={{
                    ...styles.signupButton,
                    ...(currentStep === 2 ? { flex: 1 } : { width: '100%' })
                  }}
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <div style={styles.spinner}></div>
                  ) : (
                    currentStep === 1 ? "Continuer" : "Créer mon compte"
                  )}
                </button>
              </div>
            </form>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                Déjà inscrit? <Link to="/" style={styles.link}>Se connecter</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;