import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/layouts/default";
import { Users, Download } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@heroui/button";
import { useUser } from "@/contexts/UserContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

// Move interface outside component for better organization
interface Event {
  id: string | number;
  title: string; // Changed from title to match your API
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  is_timeSlot_enabled: boolean;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  const {
    isOpen: isCvModalOpen,
    onOpen: onOpenCvModal,
    onOpenChange: onOpenChangeCvModal,
    onClose: onCloseCvModal
  } = useDisclosure();

  const {
    isOpen: isRegistrationModalOpen,
    onOpen: onOpenRegistrationModal,
    onOpenChange: onOpenChangeRegistrationModal,
    onClose: onCloseRegistrationModal
  } = useDisclosure();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onClose: onCloseConfirmModal
  } = useDisclosure();

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/events/";

  // CSS styles for proper list rendering
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
  useEffect(() => {
    if (localStorage.getItem(`registered_${id}`)) {
      setIsRegistered(true)
    }
  }, [id]);
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, apiUrl]);

  const handleCvChoice = (choice: 'keep' | 'import') => {
    onCloseCvModal();
    if (choice === 'import') {
      navigate('/profile')
    }
    else {
      onOpenConfirmModal();
    }
  };
  const confirmKeepCv = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/talents/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: id }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      onCloseConfirmModal();
      setIsRegistered(true);
      localStorage.setItem(`registered_${id}`, 'true');
      alert("Inscription réussie avec votre CV actuel !");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Erreur lors de l'inscription");
    }
  };
  const handleRegistrationSubmit = async (formData: any) => {
    try {
      const form = new FormData();
      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("resume", formData.resume);
      form.append("event", id!);


      const response = await fetch("http://localhost:8000/api/talents/", {
        method: "POST",
        body: form,
      });

      

      if (!response.ok) {
        throw new Error("Registration failed");
      }


      onCloseRegistrationModal();
      alert("Inscription réussie !");

      localStorage.setItem(`registered_${id}`, 'true');
    } catch (error) {
      console.error("Registration error:", error);
      alert("Erreur lors de l'inscription");
    }
  };

  // Function to clean and render HTML content from ReactQuill
  const renderDescription = (htmlContent: string) => {
    if (!htmlContent) return null;

    // Remove empty paragraphs and clean up the HTML
    const cleanedContent = htmlContent
      .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs with br
      .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
      .trim();

    if (!cleanedContent || cleanedContent === '<p></p>') {
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

  // Function to download QR code as PNG
  const downloadQRCode = () => {
    if (!qrCodeRef.current || !event) return;

    const svg = qrCodeRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (make it larger for better quality)
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Fill canvas with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Draw the QR code
      ctx.drawImage(img, 0, 0, size, size);

      // Create download link
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `qr-code-${event.title.replace(/\s+/g, "-").toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

      URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
  };

  const AnnulerEvenement = async () => {
    try {
      const response = await fetch(`${apiUrl}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.location.href = "/events";
    } catch (error) {
      console.error("Error cancelling event:", error);
      setError("Failed to cancel the event. Please try again later.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Error state
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

  // Event not found
  if (!event) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600">
              The event you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-dvh -mt-2 bg-gray-100 py-6 w-full">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Navigation
                </h2>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#about"
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                    >
                      <span>ℹ️</span>À propos
                    </a>
                  </li>
                  {user && user.role === "recruiter" && (
                    <li>
                      <a
                        href="#participants"
                        className="flex items-center gap-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                      >
                        <span>
                          <Users />
                        </span>
                        Participants
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              {/* QR Code Section */}
              {user && user.role === "recruiter" && (
                <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 items-center">
                      QR Code
                    </h2>
                    <Button
                      onClick={downloadQRCode}
                      variant="flat"
                      color="primary"
                      className="flex items-center gap-2 text-white rounded-md transition-colors"
                    >
                      <Download size={16} color="blue" />
                    </Button>
                  </div>
                  <div ref={qrCodeRef} className="flex flex-col items-center">
                    <QRCode value={`${apiUrl}${event.id}/`} size={128} />
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-md rounded-lg p-6">
                <section id="about" className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-gray-600">
                      📅 {formatDate(event.start_date)}
                      {formatDate(event.end_date)}
                    </span>
                    <span className="text-gray-600">📍 {event.location}</span>
                  </div>

                  {/* Rendered description */}
                  <div className="mb-6">
                    {renderDescription(event.description)}
                  </div>

                  {/* Updated button section - handles all cases */}
                  {user?.role === "recruiter" ? (
                    <>
                      <Button onPress={onOpen} color="danger" variant="flat">
                        Annuler l'événement
                      </Button>
                      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                        <ModalContent>
                          {(onClose) => (
                            <>
                              <ModalHeader className="flex flex-col gap-1">
                                Confirmer l'annulation
                              </ModalHeader>
                              <ModalBody>
                                <p>
                                  Êtes-vous sûr de vouloir annuler cet événement ?
                                  Cette action est irréversible.
                                </p>
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="danger"
                                  variant="light"
                                  onPress={onClose}
                                >
                                  Non
                                </Button>
                                <Button
                                  color="primary"
                                  onPress={AnnulerEvenement}
                                  variant="flat"
                                >
                                  Oui
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </>
                  ) : (
                    <Button
                      className="mt-4"
                      color="primary"
                      variant="flat"
                      isDisabled={isRegistered}
                      onPress={() => {
                        if (user?.role === "talent") {
                          onOpenCvModal();
                        } else if (!isRegistered) {
                          onOpenRegistrationModal();
                        }
                      }}
                    >
                      {isRegistered ? "Déjà inscrit" : "S'inscrire"}
                    </Button>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* CV Choice Modal for talent */}
        <Modal isOpen={isCvModalOpen} onOpenChange={onOpenChangeCvModal}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Choix de CV
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-700">
                Vous voulez conserver le même CV ou importer un autre ?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                onPress={() => handleCvChoice('keep')}
              >
                Conserver le même CV
              </Button>
              <Button
                color="secondary"
                onPress={() => handleCvChoice('import')}
              >
                Importer un autre CV
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Registration Modal for unauthenticated users */}
        <Modal
          isOpen={isRegistrationModalOpen}
          onOpenChange={onOpenChangeRegistrationModal}
          size="lg"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Inscription à l'événement
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleRegistrationSubmit({
                    first_name: formData.get("first_name") as string,
                    last_name: formData.get("last_name") as string,
                    email: formData.get("email") as string,
                    phone: formData.get("phone") as string,
                    resume: formData.get("resume") as File,
                  });
                }}
                className="space-y-4"
              >
                <Input
                  label="Prénom"
                  name="first_name"
                  required
                />

                <Input
                  label="Nom"
                  name="last_name"
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  required
                />

                <Input
                  label="Téléphone"
                  name="phone"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CV (PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    required
                    className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md p-2"
                  />
                </div>

                <Button type="submit" color="primary">
                  Soumettre
                </Button>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal isOpen={isConfirmModalOpen} onOpenChange={onCloseConfirmModal}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Confirmer votre choix
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir utiliser votre CV actuel ?
                Cette action est définitive et vous ne pourrez pas modifier
                votre CV pour cet événement par la suite.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onCloseConfirmModal}
              >
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={confirmKeepCv}
              >
                Confirmer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}