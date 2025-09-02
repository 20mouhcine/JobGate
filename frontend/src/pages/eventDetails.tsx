import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/layouts/default";
import Stats from "@/components/stats";
import {
  Users,
  Download,
  CircleAlert,
  ChartArea,
  SearchIcon,
  Mail,
} from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@heroui/button";
import { useCurrentUser } from "@/contexts/UserContext";
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
import { Chip } from "@heroui/chip";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { Event, Talent, Participation } from '@/types';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const user = useCurrentUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(false);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "selected" | "not-selected"
  >("all");

  const [participations, setParticipations] = useState<Participation[]>([]);

  const [newCv, setNewCv] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCv(e.target.files[0]);
    }
  };

  const {
    isOpen: isCvModalOpen,
    onOpen: onOpenCvModal,
    onOpenChange: onOpenChangeCvModal,
    onClose: onCloseCvModal,
  } = useDisclosure();

  const {
    isOpen: isArchiveOpen,
    onOpen: onArchiveOpen,
    onOpenChange: onArchiveOpenChange,
  } = useDisclosure();

  const {
    isOpen: isUnarchiveOpen,
    onOpen: onUnarchiveOpen,
    onOpenChange: onUnarchiveOpenChange,
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
    if(user?.role === "talent") return;
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search.trim()) {
        params.append("search", search);
      }

      const response = await fetch(`${apiParticipationsUrl}${id}/?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
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

  const sendEmailToSelectedTalents = async () => {
    if (!id) return;

    const selectedTalents = participations.filter((p) => p.is_selected);
    if (selectedTalents.length === 0) {
      alert("Aucun talent sélectionné trouvé.");
      return;
    }

    setIsLoadingEmail(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/events/${id}/send-selection-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            talent_ids: selectedTalents.map((p) => p.talent_id.id),
          }),
        }
      );

      if (response.ok) {
        alert(
          `Email envoyé avec succès à ${selectedTalents.length} talent(s) sélectionné(s)!`
        );
        setEmailSent(true); // Hide the button after successful send
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    } finally {
      setIsLoadingEmail(false);
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

  const DesarchiverEvenement = async () => {
    try {
      if (!event) return;

      const response = await fetch(
        `http://localhost:8000/api/events/${event.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ is_archived: false }),
        }
      );

      if (!response.ok) throw new Error("Failed to unarchive the event");

      setEvent((prev) => (prev ? { ...prev, is_archived: false } : null));
      onUnarchiveOpenChange();
      //fetchEvents();
      window.location.href = "/events";
    } catch (error) {
      console.error(error);
      alert("Erreur lors du désarchivage de l'événement.");
    }
  };

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
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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
  }, [id]);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      // Only check registration for talents
      if (!user || user.role !== "talent" || !event?.id) return;

      try {
        // For talents, we don't need to pass talent_id - the backend will find their talent profile automatically
        const response = await fetch(
          `http://localhost:8000/api/participations-details/?event_id=${event.id}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const data = await response.json();
        console.log("Registration status check:", data);

        // If we get a participation object back, user is registered
        if (data.detail === "Participation not found." || data.detail === "Talent profile not found") {
          setIsRegistered(false);
        } else if (data.id) {
          // If we get a participation with an ID, user is registered
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        setIsRegistered(false);
      }
    };

    checkRegistrationStatus();
  }, [user?.id, user?.role, event?.id]);

  const handleCvChange = async () => {
    if (!newCv) {
      alert("Veuillez sélectionner un fichier CV avant d'importer.");
      return;
    }

    if (!user) {
      alert("Erreur: utilisateur non connecté.");
      return;
    }

    try {
      // First, upload the CV to the user's profile
      const cvData = new FormData();
      cvData.append("resume", newCv);

      const response = await fetch(
        `http://localhost:8000/api/auth/profile/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: cvData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du CV");
      }

      alert("CV importé avec succès !");

      // Then, register for the event participation
      const participationData: any = {
        event_id: event?.id,
      };

      // Only include talent_id if user is not a talent (for recruiters/admins)
      if (user.role !== "talent") {
        participationData.talent_id = user?.talent_id || user?.id;
      }

      const participationResponse = await fetch(
        `http://localhost:8000/api/participations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(participationData),
        }
      );

      if (!participationResponse.ok) {
        const errorData = await participationResponse.json();
        throw new Error(errorData.error || "Erreur lors de l'inscription à l'événement");
      }

      await participationResponse.json(); // Parse the response
      alert("Inscription réussie !");
      
      // Update registration status
      setIsRegistered(true);
      
      // Optionally refresh the page data
      if (user.role === "recruiter") {
        fetchParticipations();
      }
      
    } catch (error) {
      console.error("Error updating CV or registering:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour du CV ou de l'inscription");
    }
  };
  const handleRegistrationClick = () => {
    // Only allow registration for authenticated talents
    if (!user) {
      alert("Veuillez vous connecter pour vous inscrire à cet événement.");
      return;
    }

    if (user.role !== "talent") {
      alert("Seuls les talents peuvent s'inscrire aux événements.");
      return;
    }

    if (isRegistered) {
      alert("Vous êtes déjà inscrit à cet événement.");
      return;
    }

    onOpenCvModal();
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
    setIsLoadingRegistrations(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/participations/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
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

      onCloseConfirmModal();
      alert("Inscription réussie avec votre CV actuel !");
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);

      // Show the actual error message to help with debugging
      if (error instanceof Error) {
        alert(`Erreur lors de l'inscription: ${error.message}`);
      } else {
        alert("Erreur lors de l'inscription");
      }
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

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
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
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

  const ArchiverEvenement = async () => {
    try {
      const response = await fetch(`${apiUrl}${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ is_archived: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.location.href = "/events";
    } catch (error) {
      console.error("Error archiving event:", error);
      setError("Failed to archive the event. Please try again later.");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  
  const filteredParticipations = participations.filter((participation) => {
    // Apply selection filter
    if (selectedFilter === "selected" && !participation.is_selected) {
      return false;
    }
    if (selectedFilter === "not-selected" && participation.is_selected) {
      return false;
    }
    // 'all' filter shows all participants, so no additional filtering needed
    return true;
  });

  // Define table columns
  const columns = [
    { key: "full_name", label: "Nom Complet" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Téléphone" },
    { key: "etablissement", label: "Etablissement" },
    { key: "filiere", label: "Filière" },
    ...(event?.is_timeSlot_enabled ? [{ key: "rdv", label: "RDV" }] : []),
    { key: "is_selected", label: "Sélection" },
  ];

  // Transform participations data for the table
  const tableData = filteredParticipations.map((p) => ({
    id: p.id.toString(),
    full_name: `${p.talent_id.first_name} ${p.talent_id.last_name || ""}`,
    email: p.talent_id.email,
    phone: p.talent_id.phone,
    etablissement: p.talent_id.etablissement || "—",
    filiere: p.talent_id.filiere || "—",
    rdv: p.rdv ? new Date(p.rdv).toLocaleString("fr-FR") : "—",
    is_selected: p.is_selected,
    talent_id: p.talent_id.id,
  }));

  console.log(tableData);

  const renderCell = (item: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "full_name":
        return <Link to={`participants/${item.talent_id}`}>{item.full_name}</Link>;
        case "phone":
          return <span>{item.phone || "-"}</span>
      case "filiere":
        return (
          <span className="max-w-xs truncate" title={item.filiere}>
            {item.filiere}
          </span>
        );
      case "is_selected":
        return (
          <Chip
            color={`${item.is_selected ? "success" : "danger"}`}
            variant="flat"
          >
            {item.is_selected ? "Sélectionné" : "Non sélectionné"}
          </Chip>
        );
      default:
        return item[columnKey as keyof typeof item];
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
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const now = new Date();
  const isEventFinished = endDate ? endDate < now : false;

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date non disponible";
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
                            {event?.location === "" ? (
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
                                  {!event.is_archived ? (
                                    // ✅ Event is active
                                    <div className="flex gap-2">
                                      <Button
                                        onPress={onOpen}
                                        color="danger"
                                        variant="flat"
                                      >
                                        Annuler l'événement
                                      </Button>

                                      <Button
                                        onPress={onArchiveOpen}
                                        color="primary"
                                        variant="flat"
                                      >
                                        Archiver l'événement
                                      </Button>
                                    </div>
                                  ) : (
                                    // ✅ Event is archived
                                    <div className="flex gap-2">
                                      {!isEventFinished && (
                                        <Button
                                          onPress={onUnarchiveOpen}
                                          color="secondary"
                                          variant="flat"
                                        >
                                          Désarchiver l'événement
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {/* Modal d’annulation */}
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

                                  {/* Modal d’archivage */}
                                  <Modal
                                    isOpen={isArchiveOpen}
                                    onOpenChange={onArchiveOpenChange}
                                  >
                                    <ModalContent>
                                      {(onClose) => (
                                        <>
                                          <ModalHeader>
                                            Confirmer l’archivage
                                          </ModalHeader>
                                          <ModalBody>
                                            Êtes-vous sûr de vouloir archiver
                                            cet événement ? Vous pourrez le
                                            retrouver plus tard dans la liste
                                            des événements archivés.
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
                                              variant="flat"
                                              onPress={ArchiverEvenement}
                                            >
                                              Oui, archiver
                                            </Button>
                                          </ModalFooter>
                                        </>
                                      )}
                                    </ModalContent>
                                  </Modal>

                                  {/* Modal de désarchivage */}
                                  <Modal
                                    isOpen={isUnarchiveOpen}
                                    onOpenChange={onUnarchiveOpenChange}
                                  >
                                    <ModalContent>
                                      {(onClose) => (
                                        <>
                                          <ModalHeader>
                                            Confirmer le désarchivage
                                          </ModalHeader>
                                          <ModalBody>
                                            Voulez-vous restaurer cet événement
                                            actif ?
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
                                              variant="flat"
                                              onPress={DesarchiverEvenement}
                                            >
                                              Oui, restaurer
                                            </Button>
                                          </ModalFooter>
                                        </>
                                      )}
                                    </ModalContent>
                                  </Modal>
                                </>
                              ) : (
                                // ✅ Talents - Only show registration for authenticated talents
                                user &&
                                user.role === "talent" && (
                                  <Button
                                    className="mt-4"
                                    color="primary"
                                    variant="flat"
                                    isDisabled={
                                      isRegistered
                                    }
                                    onPress={handleRegistrationClick}
                                  >
                                    {isRegistered
                                      ? "Déjà inscrit"
                                      : "S'inscrire"}
                                  </Button>
                                )
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

                          <div className="mb-4 space-y-4">
                            <div className="flex justify-between items-center">
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
                                {filteredParticipations.length > 0 && (
                                  <span>
                                    {filteredParticipations.length} participant
                                    {filteredParticipations.length > 1
                                      ? "s"
                                      : ""}{" "}
                                    affiché
                                    {filteredParticipations.length > 1
                                      ? "s"
                                      : ""}
                                    {searchQuery && ` pour "${searchQuery}"`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Selection Filter */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Filtrer par sélection:
                                </span>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      selectedFilter === "all"
                                        ? "solid"
                                        : "bordered"
                                    }
                                    color={
                                      selectedFilter === "all"
                                        ? "primary"
                                        : "default"
                                    }
                                    onClick={() => {
                                      setSelectedFilter("all");
                                      setEmailSent(false);
                                    }}
                                  >
                                    Tous ({participations.length})
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      selectedFilter === "selected"
                                        ? "solid"
                                        : "bordered"
                                    }
                                    color={
                                      selectedFilter === "selected"
                                        ? "success"
                                        : "default"
                                    }
                                    onClick={() => {
                                      setSelectedFilter("selected");
                                      setEmailSent(false);
                                    }}
                                  >
                                    Sélectionnés (
                                    {
                                      participations.filter(
                                        (p) => p.is_selected
                                      ).length
                                    }
                                    )
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      selectedFilter === "not-selected"
                                        ? "solid"
                                        : "bordered"
                                    }
                                    color={
                                      selectedFilter === "not-selected"
                                        ? "warning"
                                        : "default"
                                    }
                                    onClick={() => {
                                      setSelectedFilter("not-selected");
                                      setEmailSent(false);
                                    }}
                                  >
                                    Non sélectionnés (
                                    {
                                      participations.filter(
                                        (p) => !p.is_selected
                                      ).length
                                    }
                                    )
                                  </Button>
                                </div>
                              </div>

                              {/* Email Button - Only show when "selected" filter is active and email not sent yet */}
                              {selectedFilter === "selected" &&
                                !emailSent &&
                                participations.filter((p) => p.is_selected)
                                  .length > 0 && (
                                  <Button
                                    size="sm"
                                    color="primary"
                                    variant="solid"
                                    startContent={<Mail size={16} />}
                                    isLoading={isLoadingEmail}
                                    onPress={sendEmailToSelectedTalents}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {isLoadingEmail
                                      ? "Envoi..."
                                      : "Envoyer email"}
                                  </Button>
                                )}
                            </div>
                          </div>

                          {isLoadingParticipations ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <>
                              <Table aria-label="Participants table">
                                <TableHeader columns={columns}>
                                  {(column) => (
                                    <TableColumn key={column.key}>
                                      {column.label}
                                    </TableColumn>
                                  )}
                                </TableHeader>
                                <TableBody
                                  items={tableData}
                                  emptyContent={
                                    <div className="flex flex-col items-center justify-center py-12">
                                      <div className="text-gray-400 text-4xl mb-2">
                                        👥
                                      </div>
                                      <p className="text-gray-500 text-sm">
                                        {searchQuery
                                          ? `Aucun participant trouvé pour "${searchQuery}"`
                                          : "Aucun participant trouvé pour cet événement"}
                                      </p>
                                      {searchQuery && (
                                        <Button
                                          variant="light"
                                          size="sm"
                                          className="mt-2"
                                          onPress={() => setSearchQuery("")}
                                        >
                                          Effacer la recherche
                                        </Button>
                                      )}
                                    </div>
                                  }
                                >
                                  {(item) => (
                                    <TableRow key={item.id}>
                                      {(columnKey) => (
                                        <TableCell>
                                          {renderCell(item, columnKey)}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>

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
                      <div className="mt-6">
                        <Stats eventId={parseInt(id!)} />
                      </div>
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
                          // Only show registration button for authenticated talents
                          user &&
                          user.role === "talent" && (
                            <Button
                              className="mt-4"
                              color="primary"
                              variant="flat"
                              isDisabled={isRegistered}
                              onPress={handleRegistrationClick}
                            >
                              {isRegistered ? "Déjà inscrit" : "S'inscrire"}
                            </Button>
                          )
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
                isDisabled={isLoadingRegistrations}
              >
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={confirmKeepCv}
                isLoading={isLoadingRegistrations}
                isDisabled={isLoadingRegistrations}
              >
                {isLoadingRegistrations ? "En cours..." : "Confirmer"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
