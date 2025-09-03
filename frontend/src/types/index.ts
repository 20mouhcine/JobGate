import { SVGProps } from "react";
import { ReactNode } from "react";
import { CalendarDate, CalendarDateTime, ZonedDateTime } from "@internationalized/date";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// ==================== USER TYPES ====================
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role: 'talent' | 'recruiter';
  phone?: string;
  etablissement?: string;
  filiere?: string;
  company_name?: string;
  talent_id?: number;
  recruiter_id?: number;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UserProviderProps {
  children: ReactNode;
}

// ==================== TALENT TYPES ====================
export interface Talent {
  id: number;
  first_name: string;
  last_name: string;
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

// ==================== EVENT TYPES ====================
export interface Event {
  id: string | number;
  image?: string | File | null;
  caption?: string;
  title: string;
  start_date?: string;
  end_date?: string;
  date?: string; // For compatibility with events.tsx
  location: string | null;
  description: string;
  is_timeSlot_enabled: boolean;
  is_online?: boolean;
  is_archived?: boolean;
  recruiters_number?: number;
  meeting_link?: string | null;
  recruiterId?: number;
}

export interface TimeSlot {
  id: number;
  event: Event;
  start_time: string;
  end_time: string;
  slot: number;
}

export interface TimeSlotFormData {
  start_time: string;
  end_time: string;
  slot: number;
}

// ==================== PARTICIPATION TYPES ====================
export interface Participation {
  id: number;
  event_id?: Event;
  talent_id: Talent;
  has_attended: boolean;
  date_inscription: string;
  note: number;
  comment: string;
  rdv: Date | string; // Can be either Date or string depending on context
  is_selected: boolean;
  event_time_slot: {
    start_time: string;
    end_time: string;
  } | null;
}

export interface ParticipantInfoCardProps {
  participant: Participation;
}

// ==================== FORM TYPES ====================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName: string; // Using camelCase to match current component usage
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string; // Additional field for form validation
  role: 'talent' | 'recruiter';
  phone?: string;
  etablissement?: string;
  filiere?: string;
}

// Alternative interface using snake_case (matches API)
export interface SignupFormDataAPI {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'talent' | 'recruiter';
  phone?: string;
  etablissement?: string;
  filiere?: string;
}

export interface EventFormData {
  title: string;
  image?: File | null;
  caption?: string;
  start_date: CalendarDate | CalendarDateTime | ZonedDateTime | null;
  end_date: CalendarDate | CalendarDateTime | ZonedDateTime | null;
  location: string | null;
  description: string;
  is_timeSlot_enabled: boolean;
  recruiterId?: number | null;
  recruiters_number?: number;
  is_online?: boolean;
  meeting_link?: string | null;
}


// ==================== COMPONENT TYPES ====================
export interface ThemeSwitchProps {
  className?: string;
  classNames?: any; // SwitchProps["classNames"] - using any to avoid import issues
}

export interface ReminderResult {
  success: boolean;
  message: string;
  sent_count?: number; // Alternative field name used in component
  failed_count?: number; // Alternative field name used in component
  participants_count?: number;
  emails_sent?: number;
  errors?: string[];
  reminders_sent?: Array<{
    talent_name: string;
    talent_email: string;
    rdv_time: string;
    event_title: string;
  }>;
  participants?: Array<{
    talent_name: string;
    email: string;
    event_title: string;
    rdv_time: string;
    status: string;
  }>;
}

export interface RDVReminderComponentProps {
  onClose: () => void;
  eventId?: number;
}

// ==================== ROUTER TYPES ====================
export interface RouterConfig {
  router: any;
}

// ==================== STATISTICS TYPES ====================
export interface EventStatistics {
  total_participants: number;
  selected_participants: number;
  attended_participants: number;
  average_rating: number;
  top_participants: Array<{
    talent_id__first_name: string;
    talent_id__last_name: string;
    talent_id__email: string;
    note: number;
    is_selected: boolean;
  }>;
  participation_over_time: Array<{
    date: string;
    count: number;
  }>;
  rating_distribution: Array<{
    rating: number;
    count: number;
  }>;
}
