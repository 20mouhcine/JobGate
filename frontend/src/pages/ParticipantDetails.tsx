// ParticipantDetails.tsx
import { useState, useEffect } from 'react';
import participantIcon from "../../public/participantIcon.png";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Divider } from "@heroui/divider";
import { toast } from 'react-hot-toast';
import { Switch } from "@heroui/switch";

interface Talent {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  etablissement?: string;
  filiere?: string;
}

interface Participation {
  id: number;
  talent_id: Talent;
  has_attended: boolean;
  date_inscription: string;
  note: number;
  comment: string;
  rdv: string | null;
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
  size = 32
}: { 
  rating: number, 
  onRatingChange?: (rating: number) => void,
  editable?: boolean,
  size?: number
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onRatingChange?.(star)}
          className={`transition-all duration-200 ${
            editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
          style={{ margin: '0 2px' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const StatusBadge = ({ 
  status, 
  trueText, 
  falseText,
  trueColor = "bg-green-500",
  falseColor = "bg-yellow-500"
}: {
  status: boolean;
  trueText: string;
  falseText: string;
  trueColor?: string;
  falseColor?: string;
}) => (
  <span className={`px-4 py-2 rounded-full text-white ${status ? trueColor : falseColor}`}>
    {status ? trueText : falseText}
  </span>
);

function ParticipantDetails({ talentId, eventId, onBack }) {
  // Mock data for demonstration
  const [participant, setParticipant] = useState<Participation | null>();
  
  const [loading,setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    note: 0,
    comment: '',
    has_attended: false,
    is_selected: false
  });

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/participations-details/?event_id=${eventId}&talent_id=${talentId}`
        );
        const data = await response.json();
        setParticipant(data);
        setFormData({
          note: data.note,
          comment: data.comment || '',
          has_attended: data.has_attended,
          is_selected: data.is_selected
        });
      } catch (error) {
        console.error("Error fetching participant:", error);
        toast.error("Failed to load participant details");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [eventId, talentId]);


  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/participations-details/${participant?.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: formData.note,
            comment: formData.comment,
            has_attended: formData.has_attended,
            
            is_selected: formData.is_selected
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update participation');
      }

      const updatedData = await response.json();


      setParticipant(prev => ({
        ...prev,
        ...updatedData,
        talent_id: prev?.talent_id  
      }));

      setEditing(false);
      toast.success("Participant details updated successfully");
    } catch (error) {
      console.error("Error updating participation:", error);
      toast.error("Failed to update details");
    }
  };


  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not scheduled';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!participant) return (
    <div className="text-center py-20">
      <p className="text-lg text-gray-600">Participant not found</p>
      <Button className="mt-4">Back to list</Button>
    </div>
  );

  const handleDownloadResume = async () => {
  if (!participant?.talent_id.resume) {
    toast.error("No resume available for download");
    return;
  }

  try {
    // Fetch the resume file
    const response = await fetch(participant.talent_id.resume);
    if (!response.ok) throw new Error('Failed to fetch resume');
    
    // Get the blob data
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extract filename from URL or create one
    const filename = participant.talent_id.resume.split('/').pop() || 
                    `resume_${participant.talent_id.name.replace(/\s+/g, '_')}.pdf`;
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success("Resume download started");
  } catch (error) {
    console.error("Error downloading resume:", error);
    toast.error("Failed to download resume");
  }
};

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Participant Evaluation</h1>
          <p className="opacity-80">Review and evaluate participant details</p>
        </div>
        
        <div className="p-6">
          <Button 
            onClick={() => setEditing(!editing)} 
            variant="light" 
            className="mb-6"
          >
            ← Back to participants
          </Button>

          <Card className="shadow-lg border border-gray-100">
            <CardBody>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Section */}
                <div className="w-full md:w-1/3 flex flex-col items-center p-4 border-r border-gray-100">
                  <div className="relative">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mb-4 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <div className={`w-4 h-4 rounded-full ${participant.has_attended ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 text-center">
                    {participant.talent_id.name}
                  </h2>
                  
                  <div className="mt-6 space-y-3 w-full">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500">📧</span>
                          <span>{participant.talent_id.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500">📱</span>
                          <span>{participant.talent_id.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">Education</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500">🏫</span>
                          <span>{participant.talent_id.etablissement || "Not specified"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500">📚</span>
                          <span>{participant.talent_id.filiere || "Not specified"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-6">
                  {/* Status Section */}
                  <Card className="shadow-sm border border-gray-100">
                    <CardBody>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Participation Status</h3>
                        {!editing && (
                          <Button 
                            onClick={() => setEditing(true)} 
                            variant="flat"
                            size="sm"
                            className="bg-blue-50 text-blue-600"
                          >
                            Edit Status
                          </Button>
                        )}
                      </div>

                      {editing ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attendance Status
                              </label>
                              <p className="text-sm text-gray-500">
                                Did the participant attend the event?
                              </p>
                            </div>
                            <Switch
                              isSelected={formData.has_attended}
                              onValueChange={(value) => setFormData({...formData, has_attended: value})}
                              color="success"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selection Status
                              </label>
                              <p className="text-sm text-gray-500">
                                Has the participant been selected?
                              </p>
                            </div>
                            <Switch
                              isSelected={formData.is_selected}
                              onValueChange={(value) => setFormData({...formData, is_selected: value})}
                              color="primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4">
                          <StatusBadge 
                            status={participant.has_attended}
                            trueText="Attended"
                            falseText="Not attended"
                            trueColor="bg-green-500"
                            falseColor="bg-yellow-500"
                          />
                          
                          <StatusBadge 
                            status={participant.is_selected}
                            trueText="Selected"
                            falseText="Not selected"
                            trueColor="bg-blue-500"
                            falseColor="bg-gray-500"
                          />
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Evaluation Section */}
                  <Card className="shadow-sm border border-gray-100">
                    <CardBody>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Evaluation</h3>
                        {editing && (
                          <p className="text-sm text-gray-500">
                            Click stars to rate
                          </p>
                        )}
                      </div>
                      
                      {editing ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex justify-center">
                              <StarRating 
                                rating={formData.note} 
                                onRatingChange={(rating) => setFormData({...formData, note: rating})} 
                                size={42}
                              />
                            </div>
                            <div className="text-center mt-2 text-gray-600">
                              {formData.note} {formData.note === 1 ? 'star' : 'stars'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                            <textarea
                              value={formData.comment}
                              onChange={(e) => setFormData({...formData, comment: e.target.value})}
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={4}
                              placeholder="Add your evaluation comments..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                            <span className="text-gray-700 mb-2">Rating:</span>
                            <div className="scale-125">
                              <StarRating 
                                rating={participant.note} 
                                editable={false}
                                size={42}
                              />
                            </div>
                            <div className="text-lg font-medium text-gray-800 mt-2">
                              {participant.note} {participant.note === 1 ? 'star' : 'stars'}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 font-medium mb-2">Comments:</p>
                            <p className="text-gray-600">
                              {participant.comment || 'No comments provided'}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Action Buttons */}
                  {editing && (
                    <div className="flex gap-4 justify-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Button 
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            note: participant.note,
                            comment: participant.comment || '',
                            has_attended: participant.has_attended,
                            is_selected: participant.is_selected
                          });
                        }} 
                        variant="light"
                        className="px-6 py-3"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        color="primary"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm border border-gray-100">
                      <CardBody>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Event Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Registration date</p>
                              <p className="font-medium">
                                {new Date(participant.date_inscription).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Appointment time</p>
                              <p className="font-medium">
                                {formatTime(participant.rdv)}
                              </p>
                            </div>
                          </div>
                          
                          {participant.event_time_slot && (
                            <div className="flex items-start gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.049l1.715-5.349L11 6.477V5h2a1 1 0 110 2H9a1 1 0 01-1-1V3a1 1 0 011-1h1zm-6 8a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 019 21a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.049l1.715-5.349L5 12.477V11a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Time slot</p>
                                <p className="font-medium">
                                  {formatTime(participant.event_time_slot.start_time)} - {formatTime(participant.event_time_slot.end_time)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="shadow-sm border border-gray-100">
                      <CardBody>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Documents</h3>
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-center text-gray-600">Resume available for download</p>
                          <Button 
                            variant="flat" 
                            className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            onClick={handleDownloadResume}
                            disabled={!participant.talent_id.resume}
                          >
                            Download Resume
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ParticipantDetails;	