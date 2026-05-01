export type EventType = "task" | "event" | "pay" | "birthday";
export type ViewMode = "grid" | "list";

export type RepeatType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export type RepeatUnit = "day" | "week" | "month" | "year";
export type EventStatus = "pending" | "completed";
export type PaymentStatus = "none" | "unpaid" | "paid";

export type CustomRepeatConfig = {
  interval: number;
  unit: RepeatUnit;
  monthlyMode?: "same_day";
};

export type CalendarOccurrence = {
  occurrenceDate: string;
  status: EventStatus;
  completed: boolean;
  paymentStatus: PaymentStatus;
  actualAmount?: number;
  completedAt?: string;
};

export type CalendarItem = {
  id: string;

  baseId?: string;
  isOccurrence?: boolean;
  originalDate?: string;
  occurrenceDate?: string;
  occurrences?: Record<string, CalendarOccurrence>;

  title: string;
  details?: string;
  type: EventType;
  date: string;
  time?: string;
  allDay: boolean;

  completed: boolean;
  status: EventStatus;

  repeat: RepeatType;
  customRepeat?: CustomRepeatConfig;

  amount?: number;
  actualAmount?: number;
  paymentStatus: PaymentStatus;

  category?: string;
  customColor?: string;
  address?: string;
  completedAt?: string;
};

export type TypeConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
};

export type DraftEvent = {
  type: EventType;
  title: string;
  details: string;
  allDay: boolean;
  date: string;
  time: string;
  repeat: RepeatType;
  customRepeat: CustomRepeatConfig;
  amount: string;
  category: string;
  address: string;
  customColor: string;
};

export type FiltersState = Record<EventType, boolean>;
