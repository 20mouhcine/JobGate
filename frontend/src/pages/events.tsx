import DefaultLayout from "@/layouts/default";
import EventCard from "@/components/eventCard";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { Switch } from "@heroui/switch";
import { TimeInput } from "@heroui/date-input";
import { NumberInput } from "@heroui/number-input";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useUser } from "@/contexts/UserContext";

// Define proper types
interface Event {
  id: string | number;
  image?: File | null;
  caption?: string;
  title: string;
  date: string;
  location: string | null;
  description: string;
  is_timeSlot_enabled: boolean;
  is_online?: boolean;
  recruiters_number?: number;
  meeting_link?: string | null;
}

interface FormData {
  title: string;
  image?: File | null;
  caption?: string;
  start_date: CalendarDate | null;
  end_date: CalendarDate | null;
  location: string | null;
  description: string;
  is_timeSlot_enabled: boolean;
  recruiterId: number | null;
  recruiters_number?: number;
  is_online?: boolean;
  meeting_link?: string | null;
}

interface TimeSlotFormData {
  startTime: string;
  endTime: string;
  slot: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Basic info", "description", "Time slots"];
  const { user } = useUser();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    caption: "",
    start_date: null,
    end_date: null,
    location: "",
    description: "",
    is_timeSlot_enabled: false,
    recruiterId: user?.id || null,
    recruiters_number: 1,
    is_online: false,
    meeting_link: null,
  });
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotFormData>({
    startTime: "",
    endTime: "",
    slot: 10,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      image: file || null,
    }));
  };

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/events/";
  const timeSlotApiUrl =
    import.meta.env.VITE_TIMESLOT_API_URL ||
    "http://localhost:8000/api/time-slots/";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Update recruiterId when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        recruiterId: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to fetch events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartDateChange = (start_date: CalendarDate | null) => {
    setFormData((prev) => ({
      ...prev,
      start_date,
    }));
  };
  const handleEndDateChange = (end_date: CalendarDate | null) => {
    setFormData((prev) => ({
      ...prev,
      end_date,
    }));
  };

  const handleSwitchChange = (isSelected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_timeSlot_enabled: isSelected,
    }));

    if (!isSelected) {
      setTimeSlotData({
        startTime: "",
        endTime: "",
        slot: 10,
      });
    }
  };

  const handleTimeSlotChange = (
    field: keyof TimeSlotFormData,
    value: string | number
  ) => {
    setTimeSlotData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle start time change
  const handleStartTimeChange = (time: any) => {
    // Convert time object to string format (HH:MM)
    const timeString = time
      ? `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`
      : "";
    handleTimeSlotChange("startTime", timeString);
  };

  // Handle end time change
  const handleEndTimeChange = (time: any) => {
    // Convert time object to string format (HH:MM)
    const timeString = time
      ? `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`
      : "";
    handleTimeSlotChange("endTime", timeString);
  };

  // Handle slot duration change
  const handleSlotChange = (value: number) => {
    handleTimeSlotChange("slot", value);
  };

  // Handle online event switch change
  const handleOnlineEventChange = (isSelected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_online: isSelected,
      // Clear location if online, clear meeting link if not online
      location: isSelected ? null : prev.location,
      meeting_link: isSelected ? prev.meeting_link : null,
    }));
  };

  // Handle recruiters number change
  const handleRecruitersNumberChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      recruiters_number: value,
    }));
  };

  // Enhanced form validation - FIXED
  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return (
          formData.title.trim() !== "" &&
          formData.image !== null &&
          formData.caption?.trim() !== "" &&
          formData.start_date !== null &&
          formData.end_date !== null &&
          formData.recruiterId !== null &&
          formData.is_online !== undefined &&
          formData.recruiters_number !== undefined &&
          // Location validation: required if NOT online
          (!formData.is_online ? formData.location?.trim() !== "" : true) &&
          // Meeting link validation: required if online
          (formData.is_online ? formData.meeting_link?.trim() !== "" : true)
        );
      case 1:
        return formData.description.trim() !== "";
      case 2:
        if (!formData.is_timeSlot_enabled) return true;
        return (
          timeSlotData.startTime !== "" &&
          timeSlotData.endTime !== "" &&
          timeSlotData.slot > 0
        );
      default:
        return false;
    }
  };

  // Updated form validation - FIXED
  const isFormValid = () => {
    const basicFieldsValid =
      formData.title.trim() !== "" &&
      formData.image !== null &&
      formData.caption?.trim() !== "" &&
      formData.start_date !== null &&
      formData.end_date !== null &&
      formData.recruiterId !== null &&
      formData.is_online !== undefined &&
      formData.recruiters_number !== undefined &&
      formData.description.trim() !== "" &&
      // Location validation: required if NOT online
      (!formData.is_online ? formData.location?.trim() !== "" : true) &&
      // Meeting link validation: required if online
      (formData.is_online ? formData.meeting_link?.trim() !== "" : true);

    // If time slots are enabled, validate time slot fields
    if (formData.is_timeSlot_enabled) {
      const timeSlotFieldsValid =
        timeSlotData.startTime !== "" &&
        timeSlotData.endTime !== "" &&
        timeSlotData.slot > 0;
      return basicFieldsValid && timeSlotFieldsValid;
    }

    return basicFieldsValid;
  };

  // Handle next step navigation
  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event bubbling
    setCurrentStep(currentStep + 1);
  };

  // Handle previous step navigation
  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event bubbling
    setCurrentStep(currentStep - 1);
  };

  // Submit handler with API call - FIXED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert CalendarDate to ISO string for API
      const start_dateString = formData.start_date
        ? `${formData.start_date.year}-${String(formData.start_date.month).padStart(2, "0")}-${String(formData.start_date.day).padStart(2, "0")}`
        : null;
      const end_dateString = formData.end_date
        ? `${formData.end_date.year}-${String(formData.end_date.month).padStart(2, "0")}-${String(formData.end_date.day).padStart(2, "0")}`
        : null;

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("caption", formData.caption || "");
      
      // Handle location - only append if not online or has value
      if (!formData.is_online && formData.location) {
        formDataToSend.append("location", formData.location);
      } else if (formData.is_online) {
        // For online events, you might want to set location to null or empty
        formDataToSend.append("location", "");
      }
      
      formDataToSend.append("description", formData.description);
      formDataToSend.append("start_date", start_dateString || "");
      formDataToSend.append("end_date", end_dateString || "");
      formDataToSend.append(
        "is_timeSlot_enabled",
        String(formData.is_timeSlot_enabled)
      );
      formDataToSend.append("recruiterId", String(formData.recruiterId));
      formDataToSend.append(
        "recruiters_number",
        String(formData.recruiters_number || 1)
      );
      formDataToSend.append("is_online", String(formData.is_online || false));
      
      // Handle meeting link - only append if online and has value
      if (formData.is_online && formData.meeting_link) {
        formDataToSend.append("meeting_link", formData.meeting_link);
      } else {
        formDataToSend.append("meeting_link", "");
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // FIXED: Remove Content-Type header for FormData
      const eventResponse = await fetch(apiUrl, {
        method: "POST",
        // Don't set Content-Type header - let browser set it with boundary
        body: formDataToSend,
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.text();
        console.error("Server error:", errorData);
        throw new Error(`HTTP error! status: ${eventResponse.status} - ${errorData}`);
      }

      const newEvent = await eventResponse.json();

      if (formData.is_timeSlot_enabled && newEvent.id) {
        const timeSlotPayload = {
          event: newEvent.id,
          start_time: timeSlotData.startTime,
          end_time: timeSlotData.endTime,
          slot_duration: timeSlotData.slot,
        };

        const timeSlotResponse = await fetch(timeSlotApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(timeSlotPayload),
        });

        if (!timeSlotResponse.ok) {
          console.error("Failed to create time slots, but event was created");
          setError(
            "Event created successfully, but failed to create time slots. You can add them later."
          );
        }
      }

      // Update events list
      setEvents((prev) => [...prev, newEvent]);

      // Reset forms
      setFormData({
        title: "",
        image: null,
        caption: "",
        start_date: null,
        end_date: null,
        location: "",
        description: "",
        is_timeSlot_enabled: false,
        recruiterId: user?.id || null,
        recruiters_number: 1,
        is_online: false,
        meeting_link: null,
      });
      setTimeSlotData({
        startTime: "",
        endTime: "",
        slot: 10,
      });

      // Reset step
      setCurrentStep(0);

      // Close modal
      onOpenChange();
    } catch (error) {
      console.error("Error creating event:", error);
      setError(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error when modal closes
  const handleModalClose = () => {
    setError(null);
    setCurrentStep(0); // Reset step when modal closes
    // Reset forms when modal closes
    setFormData({
      title: "",
      image: null,
      caption: "",
      start_date: null,
      end_date: null,
      location: "",
      description: "",
      is_timeSlot_enabled: false,
      recruiterId: user?.id || null,
      recruiters_number: 1,
      is_online: false,
      meeting_link: null,
    });
    setTimeSlotData({
      startTime: "",
      endTime: "",
      slot: 10,
    });
    onOpenChange();
  };

  return (
    <DefaultLayout>
      <section className="py-8 md:py-10">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <Input
              className="w-auto max-w-xs"
              placeholder="Search events..."
              // You can add search functionality here
            />
            <Button onPress={onOpen} color="primary">
              Create Event
            </Button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && !events.length ? (
            <div className="text-center py-8">
              <p>Loading events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id || `event-${Math.random()}`}
                    event={event}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No events found. Create your first event!
                </div>
              )}
            </div>
          )}

          {/* Modal */}
          <Modal isOpen={isOpen} onOpenChange={handleModalClose} size="2xl">
            <ModalContent className="max-h-[90vh] overflow-hidden flex flex-col">
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-4 pb-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-semibold">Create Event</h2>
                      <span className="text-default-500 text-sm">
                        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
                      </span>
                    </div>
                    
                    {/* Step Progress Slider */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        {steps.map((step, index) => (
                          <div
                            key={step}
                            className={`flex items-center ${
                              index < steps.length - 1 ? 'flex-1' : ''
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                  index < currentStep
                                    ? 'bg-success text-white' // Completed steps
                                    : index === currentStep
                                    ? 'bg-primary text-white' // Current step
                                    : 'bg-default-200 text-default-500' // Future steps
                                }`}
                              >
                                {index < currentStep ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <span className={`text-xs mt-1 text-center max-w-20 ${
                                index === currentStep 
                                  ? 'text-primary font-medium' 
                                  : 'text-default-500'
                              }`}>
                                {step}
                              </span>
                            </div>
                            {index < steps.length - 1 && (
                              <div className="flex-1 mx-2">
                                <div className={`h-0.5 transition-all duration-200 ${
                                  index < currentStep 
                                    ? 'bg-success' 
                                    : 'bg-default-200'
                                }`} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-default-200 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${((currentStep) / (steps.length - 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </ModalHeader>
                  <ModalBody className="overflow-y-auto px-4 flex-1">
                    <div className="flex flex-col gap-4">
                      {currentStep === 0 && (
                        <>
                          <Input
                            label="Event Name"
                            name="title"
                            placeholder="Enter event name"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            isDisabled={isLoading}
                          />

                          <div className="flex flex-col gap-2">
                            <Input
                              label="Event Image"
                              type="file"
                              name="image"
                              accept="image/*"
                              onChange={handleFileChange}
                              isDisabled={isLoading}
                              description="Select an image file for the event banner"
                              isRequired
                            />
                            {formData.image && (
                              <div className="text-sm text-gray-600">
                                Selected: {formData.image.name}
                              </div>
                            )}
                          </div>

                          <Input
                            label="Event Caption"
                            name="caption"
                            placeholder="Enter Event caption"
                            required
                            value={formData.caption || ""}
                            onChange={handleChange}
                            isDisabled={isLoading}
                            description="Brief description of the event"
                          />

                          <div className="flex gap-4">
                            <DatePicker
                              label="Start Date"
                              value={formData.start_date}
                              onChange={handleStartDateChange}
                              isDisabled={isLoading}
                              isRequired
                            />
                            <DatePicker
                              label="End Date"
                              value={formData.end_date}
                              onChange={handleEndDateChange}
                              isDisabled={isLoading}
                              isRequired
                            />
                          </div>

                          <div className="flex flex-row gap-4">
                            <NumberInput
                              label="Number of Recruiters"
                              className="flex-1"
                              placeholder="1"
                              value={formData.recruiters_number || 1}
                              onValueChange={handleRecruitersNumberChange}
                              isDisabled={isLoading}
                              min={1}
                              max={20}
                              step={1}
                              description="Number of recruiters for this event"
                              isRequired
                            />
                            <div className="flex items-center -mt-6">
                              <Switch
                                isSelected={formData.is_online || false}
                                onValueChange={handleOnlineEventChange}
                                isDisabled={isLoading}
                              >
                                Online Event
                              </Switch>
                            </div>
                          </div>

                          {formData.is_online ? (
                            <Input
                              label="Meeting Link"
                              name="meeting_link"
                              placeholder="Enter meeting link (Zoom, Teams, etc.)"
                              required
                              value={formData.meeting_link || ""}
                              onChange={handleChange}
                              isDisabled={isLoading}
                            />
                          ) : (
                            <Input
                              label="Location"
                              name="location"
                              placeholder="Enter event location"
                              required
                              value={formData.location || ""}
                              onChange={handleChange}
                              isDisabled={isLoading}
                            />
                          )}
                        </>
                      )}

                      {currentStep === 1 && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description *
                          </label>
                          <ReactQuill
                            value={formData.description}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                description: value,
                              }))
                            }
                            className="h-screen"
                            modules={{
                              toolbar: {
                                container: [
                                  [{ header: [1, 2, false] }],
                                  ["bold", "italic", "underline", "strike"],
                                  ["blockquote", "code-block"],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["link", "image", "video"],
                                  ["clean"],
                                ],
                              },
                            }}
                            formats={[
                              "header",
                              "bold",
                              "italic",
                              "underline",
                              "strike",
                              "blockquote",
                              "code-block",
                              "list",
                              "bullet",
                              "link",
                              "image",
                              "video",
                            ]}
                            readOnly={isLoading}
                          />
                        </div>
                      )}

                      {currentStep === 2 && (
                        <>
                          <div className="flex items-center gap-2">
                            <Switch
                              isSelected={formData.is_timeSlot_enabled}
                              onValueChange={handleSwitchChange}
                              isDisabled={isLoading}
                            >
                              Enable Appointments
                            </Switch>
                          </div>

                          {formData.is_timeSlot_enabled && (
                            <div className="border-t pt-4 mt-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Time Slot Configuration
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <TimeInput
                                    label="Start Time"
                                    onChange={handleStartTimeChange}
                                    isDisabled={isLoading}
                                    isRequired
                                    description="Appointment start time"
                                  />
                                  <TimeInput
                                    label="End Time"
                                    onChange={handleEndTimeChange}
                                    isDisabled={isLoading}
                                    isRequired
                                    description="Appointment end time"
                                  />
                                </div>
                                <NumberInput
                                  label="Slot Duration (minutes)"
                                  placeholder="10"
                                  value={timeSlotData.slot}
                                  onValueChange={handleSlotChange}
                                  isDisabled={isLoading}
                                  min={5}
                                  max={120}
                                  step={5}
                                  description="Duration of each time slot in minutes"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ModalBody>
                  <ModalFooter className="sticky bottom-0 bg-white z-10">
                   
                    {currentStep > 0 && (
                      <Button onClick={handlePreviousStep} type="button">
                        Previous
                      </Button>
                    )}
                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={handleNextStep}
                        isDisabled={!isStepValid(currentStep)}
                        color="primary"
                        variant="flat"
                        type="button"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        isDisabled={!isFormValid()}
                        isLoading={isLoading}
                        color="primary"
                        type="button"
                      >
                        {isLoading ? "Creating..." : "Create Event"}
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </section>
    </DefaultLayout>
  );
}