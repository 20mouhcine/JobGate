// ParticipantDetails.tsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";

import { toast } from "react-hot-toast";
import { Switch } from "@heroui/switch";
import DefaultLayout from "@/layouts/default";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import {
  Star,
  Save,
  Eye,
  Award,
  AlertCircle,
  Users,
  CornerDownLeft,
} from "lucide-react";
import { Talent, Participation } from '@/types';

import ParticipantInfoCard from "@/components/ParticipantInfoCard";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Import PDF.js worker
import 'pdfjs-dist/build/pdf.worker.min.js';

// import { addToast } from '@heroui/toast';

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
            className={`transition-all duration-200 ${editable ? "hover:scale-110 cursor-pointer" : "cursor-default"
              }`}
            disabled={!editable}
          >
            <Star
              size={size}
              className={`${star <= (hoverRating || rating)
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
        `${API_URL}participations-details/?event_id=${eventId}&talent_id=${talentId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      }
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
  console.log("Participant data:", participant);

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
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
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

      // Update the original data and reset dirty state
      setOriginalData({
        note: updatedData.note || 0,
        comment: updatedData.comment || "",
        has_attended: updatedData.has_attended || false,
        is_selected: updatedData.is_selected || false,
      });
      setDirty(false);

      toast.success("Participant details updated successfully");
      console.log('updated');
    } catch (error) {
      console.error("Error updating participation:", error);
      toast.error("Échec de la mise à jour des détails");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // revert to original snapshot
    setFormData(originalData);
    setDirty(false);
  };





  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails du participant...</p>
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
            Participant non trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Le participant que vous recherchez n'existe pas ou a peut-être été supprimé.
          </p>
          <Button
            color="primary"
            onPress={() => navigate(-1)}
            startContent={<Users size={16} />}
          >
            Retour aux participants
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
                Retour
              </Button>
              {dirty && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  Modifications non enregistrées
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
                onPress={handleCancel}
                startContent={
                  <CornerDownLeft size={16} className="items-center mt-1" />
                }
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
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>

          {/* Participant Header Card */}
          <ParticipantInfoCard participant={participant} />

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
                      Aperçu du CV
                    </h3>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={onOpen}
                      endContent={<Eye size={14} />}
                    >
                      Plein Écran
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
                    Évaluation et Notation
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
                              Présence
                            </label>
                            <p className="text-xs text-gray-500">
                              Marquer comme présent
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
                              Sélection
                            </label>
                            <p className="text-xs text-gray-500">
                              Marquer comme sélectionné
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
                        Évaluation globale
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
                          Note Globale
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
                        placeholder="Ajoutez vos commentaires d'évaluation..."
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
                {participant.talent_id.first_name} - Resume
              </h3>
            </ModalHeader>
            <ModalBody className="p-0">
              {participant.talent_id.resume && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <div className="h-[70vh] border border-gray-300">
                    <Viewer
                      plugins={[defaultLayoutPluginInstance]}
                      fileUrl={`http://localhost:8000${participant.talent_id.resume}`}
                    />
                  </div>
                </Worker>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
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
}
