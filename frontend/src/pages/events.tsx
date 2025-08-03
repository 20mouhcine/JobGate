import DefaultLayout from "@/layouts/default";
import EventCard from "@/components/eventCard";
import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
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

// Define proper types
interface Event {
  id: string | number;
  title: string;
  date: string;
  location: string;
  description: string;
  is_timeSlot_enabled: boolean;
}

interface FormData {
  title: string;
  date: CalendarDate | null;
  location: string;
  description: string;
  is_timeSlot_enabled: boolean;
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
  const [formData, setFormData] = useState<FormData>({
    title: "",
    date: null,
    location: "",
    description: "",
    is_timeSlot_enabled: false,
  });
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotFormData>({
    startTime: "",
    endTime: "",
    slot: 10,
  });

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/events/";
  const timeSlotApiUrl = 
    import.meta.env.VITE_TIMESLOT_API_URL || "http://localhost:8000/api/time-slots/";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  const handleDateChange = (date: CalendarDate | null) => {
    setFormData((prev) => ({
      ...prev,
      date,
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

  const handleTimeSlotChange = (field: keyof TimeSlotFormData, value: string | number) => {
    setTimeSlotData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle start time change
  const handleStartTimeChange = (time: any) => {
    // Convert time object to string format (HH:MM)
    const timeString = time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : "";
    handleTimeSlotChange("startTime", timeString);
  };

  // Handle end time change
  const handleEndTimeChange = (time: any) => {
    // Convert time object to string format (HH:MM)
    const timeString = time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : "";
    handleTimeSlotChange("endTime", timeString);
  };

  // Handle slot duration change
  const handleSlotChange = (value: number) => {
    handleTimeSlotChange("slot", value);
  };

  // Enhanced form validation
  const isFormValid = () => {
    const basicFieldsValid = (
      formData.title.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.date !== null
    );

    // If time slots are enabled, validate time slot fields
    if (formData.is_timeSlot_enabled) {
      const timeSlotFieldsValid = (
        timeSlotData.startTime !== "" &&
        timeSlotData.endTime !== "" &&
        timeSlotData.slot > 0
      );
      return basicFieldsValid && timeSlotFieldsValid;
    }

    return basicFieldsValid;
  };

  // Submit handler with API call
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
      const dateString = formData.date
        ? `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`
        : null;

      // Step 1: Create the event
      const eventPayload = {
        title: formData.title,
        location: formData.location,
        description: formData.description,
        date: dateString,
        is_timeSlot_enabled: formData.is_timeSlot_enabled,
      };

      const eventResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      if (!eventResponse.ok) {
        throw new Error(`HTTP error! status: ${eventResponse.status}`);
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
          // If time slot creation fails, we should probably delete the event
          // or at least warn the user
          console.error("Failed to create time slots, but event was created");
          setError("Event created successfully, but failed to create time slots. You can add them later.");
        }
      }

      // Update events list
      setEvents((prev) => [...prev, newEvent]);

      // Reset forms
      setFormData({
        title: "",
        date: null,
        location: "",
        description: "",
        is_timeSlot_enabled: false,
      });
      setTimeSlotData({
        startTime: "",
        endTime: "",
        slot: 10,
      });

      // Close modal
      onOpenChange();
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error when modal closes
  const handleModalClose = () => {
    setError(null);
    // Reset forms when modal closes
    setFormData({
      title: "",
      date: null,
      location: "",
      description: "",
      is_timeSlot_enabled: false,
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
          <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Créer un événement
                    <span className="text-default-500 text-sm">
                      Remplissez les informations de l'événement
                    </span>
                  </ModalHeader>
                  <ModalBody>
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleSubmit}
                      id="event-form"
                    >
                      <Input
                        label="Event Name"
                        name="title"
                        placeholder="Enter event name"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        isDisabled={isLoading}
                      />
                      <DatePicker
                        label="Date"
                        value={formData.date}
                        onChange={handleDateChange}
                        isDisabled={isLoading}
                        isRequired
                      />
                      <Input
                        label="Location"
                        name="location"
                        placeholder="Enter event location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        isDisabled={isLoading}
                      />
                      <Textarea
                        label="Description"
                        name="description"
                        placeholder="Enter event description"
                        value={formData.description}
                        onChange={handleChange}
                        isDisabled={isLoading}
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          isSelected={formData.is_timeSlot_enabled}
                          onValueChange={handleSwitchChange}
                          isDisabled={isLoading}
                        >
                          Activer Rdv
                        </Switch>
                      </div>

                      {/* Time Slot Configuration */}
                      {formData.is_timeSlot_enabled && (
                        <div className="border-t pt-4 mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Configuration des créneaux horaires
                          </h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TimeInput
                                label="Heure de début"
                                onChange={handleStartTimeChange}
                                isDisabled={isLoading}
                                isRequired
                                description="Heure de début des rendez-vous"
                              />
                              <TimeInput
                                label="Heure de fin"
                                onChange={handleEndTimeChange}
                                isDisabled={isLoading}
                                isRequired
                                description="Heure de fin des rendez-vous"
                              />
                            </div>
                            <NumberInput
                              label="Durée du créneau (minutes)"
                              placeholder="10"
                              value={timeSlotData.slot}
                              onValueChange={handleSlotChange}
                              isDisabled={isLoading}
                              min={5}
                              max={120}
                              step={5}
                              description="Durée de chaque créneau en minutes"
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={onClose}
                      isDisabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="event-form"
                      color="primary"
                      variant="flat"
                      isLoading={isLoading}
                      isDisabled={!isFormValid()}
                    >
                      {isLoading ? "Creating..." : "Create Event"}
                    </Button>
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