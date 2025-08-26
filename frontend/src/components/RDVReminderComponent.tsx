import React, { useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Bell, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface ReminderResult {
  message: string;
  sent_count: number;
  failed_count: number;
  reminders_sent: Array<{
    talent_name: string;
    talent_email: string;
    rdv_time: string;
    event_title: string;
  }>;
}

interface RDVReminderComponentProps {
  eventId?: number; // Optional: if provided, will send reminders only for this event
}

const RDVReminderComponent: React.FC<RDVReminderComponentProps> = ({ eventId }) => {
  const [hoursAhead, setHoursAhead] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReminderResult | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sendReminders = async () => {
    setIsLoading(true);
    try {
      const requestBody: any = {
        hours: hoursAhead
      };

      if (eventId) {
        requestBody.event_id = eventId;
      }

      const response = await fetch('http://localhost:8000/api/send-rdv-reminders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setResult(data);
      onOpen();
    } catch (error) {
      console.error('Error sending reminders:', error);
      setResult({
        message: 'Erreur lors de l\'envoi des rappels',
        sent_count: 0,
        failed_count: 1,
        reminders_sent: []
      });
      onOpen();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="flex gap-3">
          <Bell className="text-blue-500" size={24} />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Rappels RDV</p>
            <p className="text-small text-default-500">
              {eventId ? 'Pour cet événement' : 'Pour tous les événements'}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              type="number"
              label="Envoyer des rappels pour les RDV dans les prochaines"
              placeholder="24"
              value={hoursAhead.toString()}
              onChange={(e) => setHoursAhead(parseInt(e.target.value) || 24)}
              endContent={<span className="text-small text-default-500">heures</span>}
              min="1"
              max="168"
            />
            
            <Button
              color="primary"
              onPress={sendReminders}
              isLoading={isLoading}
              startContent={!isLoading && <Send size={16} />}
              className="w-full"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer les rappels'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Results Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Résultats de l'envoi de rappels
          </ModalHeader>
          <ModalBody>
            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.sent_count > 0 ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="text-orange-500" size={20} />
                  )}
                  <span className="font-medium">{result.message}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Rappels envoyés</p>
                    <p className="text-2xl font-bold text-green-700">{result.sent_count}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">Échecs</p>
                    <p className="text-2xl font-bold text-red-700">{result.failed_count}</p>
                  </div>
                </div>

                {result.reminders_sent.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Rappels envoyés à:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {result.reminders_sent.map((reminder, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                          <p className="font-medium">{reminder.talent_name}</p>
                          <p className="text-gray-600">{reminder.talent_email}</p>
                          <p className="text-gray-600">
                            RDV: {new Date(reminder.rdv_time).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-gray-600">Événement: {reminder.event_title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RDVReminderComponent;
