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

export type CustomRepeatConfig = {
  interval: number;
  unit: RepeatUnit;
  monthlyMode?: "same_day";
};

export type CalendarItem = {
  id: string;
  title: string;
  details?: string;
  type: EventType;
  date: string;
  time?: string;
  allDay: boolean;
  completed: boolean;
  repeat: RepeatType;
  customRepeat?: CustomRepeatConfig;
  amount?: number;
  customColor?: string;
  address?: string;
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
  address: string;
  customColor: string;
};

export type FiltersState = Record<EventType, boolean>;