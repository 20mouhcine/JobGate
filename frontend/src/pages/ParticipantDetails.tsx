// ParticipantDetails.tsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar } from "@heroui/avatar";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { toast } from "react-hot-toast";
import { Switch } from "@heroui/switch";
import DefaultLayout from "@/layouts/default";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Save,
  X,
  Download,
  Eye,
  Award,
  AlertCircle,
  Users,
} from "lucide-react";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// import { addToast } from '@heroui/toast';

interface Talent {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  etablissement?: string;
  filiere?: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills?: string[];
  experience_years?: number;
  location?: string;
}

interface Participation {
  id: number;
  talent_id: Talent;
  has_attended: boolean;
  date_inscription: string;
  note: number;
  comment: string;
  rdv: Date;
  is_selected: boolean;
  event_time_slot: {
    start_time: string;
    end_time: string;
  } | null;
}

const StarRating = ({
  rating,
  onRatingChange,
  editable = true,
  size = 32,
  showLabel = true,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  size?: number;
  showLabel?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getRatingText = (value: number) => {
    const texts = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
    return texts[value - 1] || "No rating";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => editable && onRatingChange?.(star)}
            onMouseEnter={() => editable && setHoverRating(star)}
            onMouseLeave={() => editable && setHoverRating(0)}
            className={`transition-all duration-200 ${
              editable ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
            disabled={!editable}
          >
            <Star
              size={size}
              className={`${
                star <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            {getRatingText(hoverRating || rating)}
          </div>
          <div className="text-xs text-gray-500">
            {hoverRating || rating}/5 stars
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Chip component since @heroui/chip might not be available
const Chip = ({
  children,
  color = "primary",
  size = "md",
  onClose,
  startContent,
}: {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  onClose?: () => void;
  startContent?: React.ReactNode;
}) => {
  const colorClasses = {
    primary: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-purple-100 text-purple-800 border-purple-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    danger: "bg-red-100 text-red-800 border-red-200",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${colorClasses[color]} ${sizeClasses[size]}`}
    >
      {startContent}
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
        >
          <X size={size === "sm" ? 12 : 14} />
        </button>
      )}
    </span>
  );
};


const InfoCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "primary",
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}) => (
  <Card className="shadow-sm border-1 border-gray-200 hover:shadow-md transition-shadow">
    <CardBody className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-base font-semibold text-gray-900 truncate">
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </CardBody>
  </Card>
);

export default function ParticipantDetailsPage() {
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participation | null>(null);
  const { eventId, talentId } = useParams<{
    eventId: string;
    talentId: string;
  }>();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Track original data for cancel & dirty state handling
  const [originalData, setOriginalData] = useState({
    note: 0,
    comment: "",
    has_attended: false,
    is_selected: false,
  });
  const [dirty, setDirty] = useState(false);
  const [formData, setFormData] = useState({
    note: 0,
    comment: "",
    has_attended: false,
    is_selected: false,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

  const fetchParticipant = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}participations-details/?event_id=${eventId}&talent_id=${talentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setParticipant(data);
      const mapped = {
        note: data.note || 0,
        comment: data.comment || "",
        has_attended: data.has_attended || false,
        is_selected: data.is_selected || false,
      };
      setFormData(mapped);
      setOriginalData(mapped);
      setDirty(false);
    } catch (error) {
      console.error("Error fetching participant:", error);
      toast.error("Failed to load participant details");
    } finally {
      setLoading(false);
    }
  }, [eventId, talentId]);

  useEffect(() => {
    if (eventId && talentId) {
      fetchParticipant();
    }
  }, [fetchParticipant, eventId, talentId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `http://localhost:8000/api/participations-details/?event_id=${eventId}&talent_id=${talentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: formData.note,
            comment: formData.comment,
            has_attended: formData.has_attended,
            is_selected: formData.is_selected,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update participation");
      }

      const updatedData = await response.json();
      setParticipant((prev) => ({
        ...prev!,
        ...updatedData,
        talent_id: prev!.talent_id,
      }));

      toast.success("Participant details updated successfully");
    } catch (error) {
      console.error("Error updating participation:", error);
      toast.error("Failed to update details");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // revert to original snapshot
    setFormData(originalData);
    setDirty(false);
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const downloadResume = () => {
    if (participant?.talent_id.resume) {
      const link = document.createElement("a");
      link.href = `http://localhost:8000${participant.talent_id.resume}`;
      link.download = `${participant.talent_id.name}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading participant details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!participant) {
    return (
      <DefaultLayout>
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Participant not found
          </h3>
          <p className="text-gray-600 mb-6">
            The participant you're looking for doesn't exist or may have been
            removed.
          </p>
          <Button
            color="primary"
            onPress={() => navigate(-1)}
            startContent={<Users size={16} />}
          >
            Back to participants
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="light"
                onPress={() => navigate(-1)}
                startContent={<Users size={16} />}
                className="text-gray-600 hover:text-gray-900"
              >
                Back
              </Button>
              {dirty && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
                onPress={handleCancel}
                startContent={<X size={16} />}
                isDisabled={!dirty || saving}
              >
                Reset
              </Button>
              <Button
                onPress={handleSave}
                isLoading={saving}
                startContent={!saving && <Save size={16} />}
                color="success"
                isDisabled={!dirty}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Participant Header Card */}
            <Card className="shadow-lg border border-gray-200">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar
                src={participant.talent_id.avatar}
                name={getInitials(participant.talent_id.name)}
                size="lg"
                className="text-lg font-bold flex-shrink-0"
              />

              <div className="flex-1 w-full">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Left side: Participant Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                  {participant.talent_id.name}
                  </h1>
                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{participant.talent_id.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{participant.talent_id.phone}</span>
                  </div>
                  {participant.talent_id.location && (
                    <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{participant.talent_id.location}</span>
                    </div>
                  )}
                  </div>

                  {participant.talent_id.etablissement && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Chip size="sm" color="primary">
                    {participant.talent_id.etablissement}
                    </Chip>
                    {participant.talent_id.filiere && (
                    <Chip size="sm" color="secondary">
                      {participant.talent_id.filiere}
                    </Chip>
                    )}
                  </div>
                  )}
                </div>

                {/* Right side: Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-shrink-0">
                  <InfoCard
                  icon={Clock}
                  title="Interview Time"
                  value={new Date(participant.rdv).toLocaleString("fr-FR")}
                  color="secondary"
                  />
                  <InfoCard
                  icon={Calendar}
                  title="Registration Date"
                  value={formatDate(participant.date_inscription)}
                  color="primary"
                  />
                </div>
                </div>
              </div>
              </div>
            </CardBody>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Viewer */}
          {participant.talent_id.resume && (
            <div className="lg:col-span-2">
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye size={20} />
                      Resume Preview
                    </h3>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={onOpen}
                      endContent={<Eye size={14} />}
                    >
                      Full Screen
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <div className="border border-gray-300 h-96 lg:h-[600px]">
                      <Viewer
                        plugins={[defaultLayoutPluginInstance]}
                        fileUrl={`http://localhost:8000${participant.talent_id.resume}`}
                      />
                    </div>
                  </Worker>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Details Panel */}
          <div
            className={
              participant.talent_id.resume ? "lg:col-span-1" : "lg:col-span-3"
            }
          >
            <div className="space-y-6">

              {/* Evaluation Section */}
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award size={20} />
                    Evaluation & Rating
                  </h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="space-y-6">
                    {/* Attendance & Selection Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attendance
                            </label>
                            <p className="text-xs text-gray-500">
                              Mark as attended
                            </p>
                          </div>
                          <Switch
                            isSelected={formData.has_attended}
                            onValueChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,
                                has_attended: value,
                              }));
                              setDirty(true);
                            }}
                            color="success"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Selection
                            </label>
                            <p className="text-xs text-gray-500">
                              Mark as selected
                            </p>
                          </div>
                          <Switch
                            isSelected={formData.is_selected}
                            onValueChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,
                                is_selected: value,
                              }));
                              setDirty(true);
                            }}
                            color="primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Overall Rating
                      </label>
                      <StarRating
                        rating={formData.note}
                        onRatingChange={(rating) => {
                          setFormData((prev) => ({ ...prev, note: rating }));
                          setDirty(true);
                        }}
                        size={36}
                      />
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Comments
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }));
                          setDirty(true);
                        }}
                        placeholder="Add your evaluation comments..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Full Screen Resume Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">
                {participant.talent_id.name} - Resume
              </h3>
            </ModalHeader>
            <ModalBody className="p-0">
              {participant.talent_id.resume && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <div className="h-[70vh] border border-gray-300">
                    <Viewer
                      plugins={[defaultLayoutPluginInstance]}
                      fileUrl={`http://localhost:8000${participant.talent_id.resume}`}
                    />
                  </div>
                </Worker>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} variant="light">
                Close
              </Button>
              <Button onPress={downloadResume} color="primary">
                Download
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
