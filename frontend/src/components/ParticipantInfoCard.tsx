import React from 'react'
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import{Mail,Phone,MapPin,Clock,Calendar} from 'lucide-react'

interface Talent {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  etablissement?: string;
  filiere?: string;
  avatar?: string;
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

const ParticipantInfoCard = ({ participant }:{participant: Participation}) => {
      const getInitials = (name: string) => {
        return name
          .split(" ")
          .map((word) => word.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2);
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
    <span className={`inline-flex items-center gap-1 rounded-full border ${colorClasses[color]} ${sizeClasses[size]}`}>
      {startContent}
      {children}
      {onClose && (
        <button onClick={onClose} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
          X
        </button>
      )}
    </span>
  );
};

const InfoCard = ({ icon: Icon, title, value, color }: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  color: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={16} className="text-gray-600" />
      <span className="text-xs font-medium text-gray-600">{title}</span>
    </div>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);
  return (
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
                            {participant.talent_id.name
                              .split(" ")[0]
                              .charAt(0)
                              .toUpperCase() +
                              participant.talent_id.name
                                .split(" ")[0]
                                .slice(1)}{" "}
                            {participant.talent_id.name.split(" ")[1]
                              ? participant.talent_id.name
                                  .split(" ")[1]
                                  .charAt(0)
                                  .toUpperCase() +
                                participant.talent_id.name.split(" ")[1].slice(1)
                              : ""}
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
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-purple-500 rounded-lg p-2">
                                        <Clock size={16} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-purple-800">Interview Time</span>
                                </div>
                                <p className="text-base font-bold text-purple-900 ml-11">
                                    {new Date(participant.rdv).toLocaleString("fr-FR")}
                                </p>
                            </div>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-500 rounded-lg p-2">
                                        <Calendar size={16} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-blue-800">Registration Date</span>
                                </div>
                                <p className="text-base font-bold text-blue-900 ml-11">
                                    {formatDate(participant.date_inscription)}
                                </p>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
)
}

export default ParticipantInfoCard