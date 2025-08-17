import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/layouts/default";
import {
  Users,
  Download,
  CircleAlert,
  ChartArea,
  SearchIcon,
} from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@heroui/button";
import { useUser } from "@/contexts/UserContext";
import { Tabs, Tab } from "@heroui/tabs";
import { QrCode } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Image as HeroImage } from "@heroui/image";
import { Card, CardBody } from "@heroui/card";
import { Link } from "react-router-dom";

interface Event {
  id: string | number;
  image?: string;
  caption?: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  is_timeSlot_enabled: boolean;
  is_online: boolean;
}

interface Talent {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  etablissement?: string;
  filiere?: string;
}

interface Participations {
  id: number;
  event_id: Event;
  talent_id: Talent;
  has_attended: boolean;
  date_inscription: Date;
  note: number;
  comment: string;
  rdv: string;
  is_selected: boolean;
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
  const [user_id, setUser_id] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(false);

  const [participations, setParticipations] = useState<Participations[]>([]);

  const [showFileInput, setShowFileInput] = useState(false);
  const [newCv, setNewCv] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCv(e.target.files[0]);
    }
  };
  const handleImportConfirm = () => {
    if (!newCv) {
      alert("Veuillez sélectionner un fichier CV avant d'importer.");
      return;
    }
    handleCvChange();
    setShowFileInput(false);
  };
  const {
    isOpen: isCvModalOpen,
    onOpen: onOpenCvModal,
    onOpenChange: onOpenChangeCvModal,
    onClose: onCloseCvModal,
  } = useDisclosure();

  const {
    isOpen: isRegistrationModalOpen,
    onOpen: onOpenRegistrationModal,
    onOpenChange: onOpenChangeRegistrationModal,
    onClose: onCloseRegistrationModal,
  } = useDisclosure();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onClose: onCloseConfirmModal,
  } = useDisclosure();

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/events/";
  const apiParticipationsUrl = "http://localhost:8000/api/participations/";

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

  const fetchParticipations = async (page = 1, search = "") => {
    if (!id) return;

    setIsLoadingParticipations(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search.trim()) {
        params.append("search", search);
      }

      const response = await fetch(`${apiParticipationsUrl}${id}/?${params}`, {
        method: "GET",
      });

      if (response.status === 404) {
        console.log("No participations found for this event.");
        setParticipations([]);
        setTotalCount(0);
        setTotalPages(0);
      } else if (response.ok) {
        const data = await response.json();
        setParticipations(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 4)); // Assuming 4 items per page
      } else {
        console.error("Error fetching participations:", response.status);
      }
    } catch (error) {
      console.error("Error fetching participations:", error);
    } finally {
      setIsLoadingParticipations(false);
    }
  };

  useEffect(() => {
    fetchParticipations(1, ""); // Initial load
  }, [id, user?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      fetchParticipations(1, searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchParticipations(newPage, searchQuery);
  };

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
  }, [id]);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      // Determine which talent ID to use
      let talentId;

      if (user?.hasAccount) {
        // Use the logged-in user's ID
        talentId = user.id;
      } else if (user_id) {
        // Use the newly created talent's ID
        talentId = user_id;
      } else {
        // No talent ID available yet
        return;
      }

      // Only proceed if we have both talent ID and event ID
      if (!talentId || !event?.id) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/participations-details/?talent_id=${talentId}&event_id=${event.id}`
        );
        const data = await response.json();

        if (data.detail === "Participation not found.") {
          setIsRegistered(false);
        } else {
          setIsRegistered(true);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        setIsRegistered(false);
      }
    };

    checkRegistrationStatus();
  }, [user?.id, user?.hasAccount, user_id, event?.id]);

  const handleCvChange = async () => {
    if (!newCv) {
      alert("Veuillez sélectionner un fichier CV avant d'importer.");
      return;
    }

    try {
      const cvData = new FormData();
      cvData.append("resume", newCv);

      const response = await fetch("http://localhost:8000/api/talents/1/", {
        method: "PUT",
        body: cvData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du CV");
      }

      alert("CV importé avec succès !");
    } catch (error) {
      console.error("Error updating CV:", error);
      alert("Erreur lors de la mise à jour du CV");
    }
  };
  const handleRegistrationClick = () => {
    if (!user?.hasAccount) {
      onOpenRegistrationModal();
    } else if (user?.role === "talent") {
      onOpenCvModal();
    } else if (!isRegistered) {
      onOpenRegistrationModal();
    }
  };

  const handleCvChoice = (choice: "keep" | "import") => {
    onCloseCvModal();
    if (choice === "import") {
      handleCvChange();
    } else {
      onOpenConfirmModal();
    }
  };
  const confirmKeepCv = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/participations/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            talent_id: user?.id,
            event_id: event?.id,
          }),
        }
      );

      if (!response.ok) {
        // Get the actual error message from the backend
        const errorData = await response.json();
        console.error("Backend error:", errorData);

        // Show the specific error message
        const errorMessage =
          errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      onCloseConfirmModal();
      alert("Inscription réussie avec votre CV actuel !");
    } catch (error) {
      console.error("Registration error:", error);

      // Show the actual error message to help with debugging
      if (error instanceof Error) {
        alert(`Erreur lors de l'inscription: ${error.message}`);
      } else {
        alert("Erreur lors de l'inscription");
      }
    }
  };

  const handleRegistrationSubmit = async (formData: any) => {
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("resume", formData.resume);
      form.append("etablissement", formData.etablissement);
      form.append("filiere", formData.filiere);
      form.append("event_id", id!);

      const response = await fetch(
        "http://localhost:8000/api/participations/",
        {
          method: "POST",
          body: form,
        }
      );

      // Handle different response scenarios
      if (response.ok) {
        const data = await response.json();
        setUser_id(data.talent_id.id);
        onCloseRegistrationModal();
        setIsRegistered(true);
        alert("Inscription réussie !");
      } else {
        // Handle specific error cases
        const errorData = await response.json();

        if (errorData.error === "No available time slots") {
          alert(
            "Désolé, tous les créneaux horaires sont complets pour cet événement."
          );
        } else if (errorData.error === "Already registered for this event") {
          alert("Vous êtes déjà inscrit à cet événement.");
          setIsRegistered(true);
        } else {
          alert(
            "Erreur lors de l'inscription: " +
              (errorData.error || "Erreur inconnue")
          );
        }

        onCloseRegistrationModal();
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Erreur lors de l'inscription");
      onCloseRegistrationModal();
    }
  };

  console.log("participations:", participations);
  // Function to clean and render HTML content from ReactQuill
  const renderDescription = (htmlContent: string) => {
    if (!htmlContent) return null;

    // Remove empty paragraphs and clean up the HTML
    const cleanedContent = htmlContent
      .replace(/<p><br><\/p>/g, "") // Remove empty paragraphs with br
      .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
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
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredParticipations = participations;

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
          <div className="flex flex-col justify-center items-center gap-6">
            <div className="flex w-full flex-col justify-center items-center">
              {user && user.role === "recruiter" ? (
                <>
                  <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 overflow-hidden hover:scale-110 transition-all duration-500">
                    <Popover placement="left">
                      <PopoverTrigger className="bg-blue-600 p-2 rounded-r-lg text-white hover:bg-blue-700 transition-colors font-bold">
                        <div className="flex flex-col items-center">
                          <span className="sr-only">QR Code</span>
                          <QrCode size={20} className="font-bold" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="mt-2">
                        <div className="px-1 py-2  space-y-2">
                          <div className="text-small font-bold flex justify-between">
                            <span>Qr</span>
                            <button
                              onClick={downloadQRCode}
                              color="primary"
                              className="flex items-center  text-white rounded-md transition-colors"
                            >
                              <Download size={16} color="blue" />
                            </button>
                          </div>
                          <div className="text-tiny">
                            <div
                              ref={qrCodeRef}
                              className="flex flex-col items-center"
                            >
                              <QRCode
                                value={`${apiUrl}${event.id}/`}
                                size={128}
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Tabs aria-label="Options" color="primary" variant="bordered">
                    <Tab
                      key="a propos"
                      title={
                        <div className="flex items-center space-x-2">
                          <CircleAlert width={20} height={20} />
                          <span>A Propos</span>
                        </div>
                      }
                    >
                      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                          {/* Left: Image */}
                          <div>
                            <HeroImage
                              src={`http://127.0.0.1:8000${event.image}`}
                              className="w-full h-64 object-cover rounded-md"
                            />
                          </div>

                          {/* Center: Title and Description */}
                          <div className="col-span-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h2>
                            <p className="text-gray-600 italic mb-4">
                              {event.caption}
                            </p>
                            <div className="text-gray-700 text-sm space-y-2">
                              {renderDescription(event.description)}
                            </div>
                          </div>

                          {/* Right: Details */}
                          <div className="bg-gray-50 p-4 rounded-md shadow-sm text-sm text-gray-700 space-y-2">
                            <p>
                              <strong>📅 Date :</strong>{" "}
                              {formatDate(event.start_date)} →{" "}
                              {formatDate(event.end_date)}
                            </p>
                            {event.location === "" ? (
                              <span> En ligne</span>
                            ) : (
                              <p>
                                <strong>📍 Lieu :</strong> {event.location}
                              </p>
                            )}
                            {/* Bottom Buttons */}
                            <div className="mt-6">
                              {user?.role === "recruiter" ? (
                                <>
                                  <Button
                                    onPress={onOpen}
                                    color="danger"
                                    variant="flat"
                                  >
                                    Annuler l'événement
                                  </Button>
                                  <Modal
                                    isOpen={isOpen}
                                    onOpenChange={onOpenChange}
                                  >
                                    <ModalContent>
                                      {(onClose) => (
                                        <>
                                          <ModalHeader className="flex flex-col gap-1">
                                            Confirmer l'annulation
                                          </ModalHeader>
                                          <ModalBody>
                                            Êtes-vous sûr de vouloir annuler cet
                                            événement ? Cette action est
                                            irréversible.
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
                                  onPress={handleRegistrationClick}
                                >
                                  {isRegistered ? "Déjà inscrit" : "S'inscrire"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab
                      key="Participants"
                      title={
                        <div className="flex items-center space-x-2">
                          <Users width={20} height={20} />
                          <span>Participants</span>
                        </div>
                      }
                    >
                      <Card className="mt-6 shadow-md">
                        <CardBody>
                          <h2 className="text-xl font-semibold mb-4">
                            Liste des participants
                          </h2>

                          <div className="mb-4 flex justify-between items-center">
                            <Input
                              type="search"
                              placeholder="Rechercher un participant..."
                              className="max-w-xs"
                              size="sm"
                              startContent={<SearchIcon color="gray" />}
                              value={searchQuery}
                              onChange={handleInputChange}
                            />
                            <div className="text-sm text-gray-600">
                              {totalCount > 0 && (
                                <span>
                                  {totalCount} participant
                                  {totalCount > 1 ? "s" : ""} trouvé
                                  {totalCount > 1 ? "s" : ""}
                                  {searchQuery && ` pour "${searchQuery}"`}
                                </span>
                              )}
                            </div>
                          </div>

                          {isLoadingParticipations ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <>
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Nom
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Email
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Téléphone
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Etablissement
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Filière
                                      </th>
                                      {event.is_timeSlot_enabled && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                          RDV
                                        </th>
                                      )}
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Sélection
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(filteredParticipations) &&
                                    filteredParticipations.length > 0 ? (
                                      filteredParticipations.map((p) => (
                                        <tr
                                          key={p.id}
                                          className="hover:bg-gray-50 transition-colors"
                                        >
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <Link
                                              to={`participants/${p.talent_id.id}`}
                                            >
                                              {p.talent_id.name}
                                            </Link>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.talent_id.email}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.talent_id.phone}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.talent_id.etablissement || "—"}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span
                                              className="max-w-xs truncate"
                                              title={p.talent_id.filiere || "—"}
                                            >
                                              {p.talent_id.filiere || "—"}
                                            </span>
                                          </td>
                                          {event.is_timeSlot_enabled && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {p.rdv || "—"}
                                            </td>
                                          )}
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                p.is_selected
                                                  ? "bg-green-100 text-green-800 border border-green-200"
                                                  : "bg-red-100 text-red-800 border border-red-200"
                                              }`}
                                            >
                                              {p.is_selected
                                                ? "✅ Sélectionné"
                                                : "❌ Non sélectionné"}
                                            </span>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={
                                            event.is_timeSlot_enabled ? 7 : 6
                                          }
                                          className="px-6 py-12 text-center"
                                        >
                                          <div className="flex flex-col items-center justify-center">
                                            <div className="text-gray-400 text-4xl mb-2">
                                              👥
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                              {searchQuery
                                                ? `Aucun participant trouvé pour "${searchQuery}"`
                                                : "Aucun participant trouvé pour cet événement"}
                                            </p>
                                            {searchQuery && (
                                              <button
                                                onClick={() =>
                                                  setSearchQuery("")
                                                }
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                              >
                                                Effacer la recherche
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="mt-6 flex justify-between items-center">
                                  <div className="text-sm text-gray-600">
                                    Page {currentPage} sur {totalPages}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isDisabled={currentPage === 1}
                                      onPress={() =>
                                        handlePageChange(currentPage - 1)
                                      }
                                    >
                                      Précédent
                                    </Button>

                                    {/* Page numbers */}
                                    <div className="flex gap-1">
                                      {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
                                          const page =
                                            Math.max(
                                              1,
                                              Math.min(
                                                totalPages - 4,
                                                currentPage - 2
                                              )
                                            ) + i;
                                          if (page <= totalPages) {
                                            return (
                                              <Button
                                                key={page}
                                                size="sm"
                                                variant={
                                                  currentPage === page
                                                    ? "solid"
                                                    : "flat"
                                                }
                                                color={
                                                  currentPage === page
                                                    ? "primary"
                                                    : "default"
                                                }
                                                onPress={() =>
                                                  handlePageChange(page)
                                                }
                                              >
                                                {page}
                                              </Button>
                                            );
                                          }
                                          return null;
                                        }
                                      )}
                                    </div>

                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isDisabled={currentPage === totalPages}
                                      onPress={() =>
                                        handlePageChange(currentPage + 1)
                                      }
                                    >
                                      Suivant
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardBody>
                      </Card>
                    </Tab>
                    <Tab
                      key="videos"
                      title={
                        <div className="flex items-center space-x-2">
                          <ChartArea />
                          <span>Statistiques</span>
                        </div>
                      }
                    >
                      Statistiques
                    </Tab>
                  </Tabs>
                </>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Left: Image */}
                    <div>
                      <HeroImage
                        src={`http://127.0.0.1:8000${event.image}`}
                        className="w-full h-64 object-cover rounded-md"
                      />
                    </div>

                    {/* Center: Title and Description */}
                    <div className="col-span-1">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h2>
                      <p className="text-gray-600 italic mb-4">
                        {event.caption}
                      </p>
                      <div className="text-gray-700 text-sm space-y-2">
                        {renderDescription(event.description)}
                      </div>
                    </div>

                    {/* Right: Details */}
                    <div className="bg-gray-50 p-4 rounded-md shadow-sm text-sm text-gray-700 space-y-2">
                      <p>
                        <strong>📅 Date :</strong>{" "}
                        {formatDate(event.start_date)} →{" "}
                        {formatDate(event.end_date)}
                      </p>
                      {event.location === "" ? (
                        <span> En ligne</span>
                      ) : (
                        <p>
                          <strong>📍 Lieu :</strong> {event.location}
                        </p>
                      )}
                      {/* Bottom Buttons */}
                      <div className="mt-6">
                        {user?.role === "recruiter" ? (
                          <>
                            <Button
                              onPress={onOpen}
                              color="danger"
                              variant="flat"
                            >
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
                                      Êtes-vous sûr de vouloir annuler cet
                                      événement ? Cette action est irréversible.
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
                              if (!user?.hasAccount) {
                                onOpenRegistrationModal();
                              } else if (user?.role === "talent") {
                                onOpenCvModal();
                              } else if (!isRegistered) {
                                onOpenRegistrationModal();
                              }
                            }}
                          >
                            {isRegistered ? "Déjà inscrit" : "S'inscrire"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2"></div>
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
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md p-2"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                onPress={() => handleCvChoice("keep")}
              >
                Conserver le même CV
              </Button>
              <Button
                color="secondary"
                onPress={() => handleCvChoice("import")}
              >
                Importer le CV sélectionné
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Registration Modal for unauthenticated users */}
        {!user?.hasAccount && (
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
                      name: formData.get("name") as string,
                      email: formData.get("email") as string,
                      phone: formData.get("phone") as string,
                      etablissement: formData.get("etablissement") as string,
                      filiere: formData.get("filiere") as string,
                      resume: formData.get("resume") as File,
                    });
                  }}
                  className="space-y-4"
                >
                  <Input label="Full Name" name="name" required />

                  <Input label="Email" name="email" type="email" required />

                  <Input label="Téléphone" name="phone" required />

                  <Input
                    type="text"
                    label="Etablissement"
                    name="etablissement"
                    required
                  />
                  <Input type="text" label="Filière" name="filiere" required />

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
        )}

        <Modal isOpen={isConfirmModalOpen} onOpenChange={onCloseConfirmModal}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Confirmer votre choix
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir utiliser votre CV actuel ? Cette action
                est définitive et vous ne pourrez pas modifier votre CV pour cet
                événement par la suite.
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
              <Button color="primary" onPress={confirmKeepCv}>
                Confirmer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
