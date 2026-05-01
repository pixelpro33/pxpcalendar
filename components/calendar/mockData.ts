import { EventType, TypeConfig } from "./types";

export const MONTHS = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Noi",
  "Dec",
];

export const WEEKDAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

export const TYPE_CONFIG: Record<EventType, TypeConfig> = {
  task: {
    label: "Task",
    color: "#bfdbfe",
    bg: "rgba(59, 130, 246, 0.86)",
    border: "rgba(147, 197, 253, 0.55)",
    icon: "✓",
  },
  event: {
    label: "Event",
    color: "#bbf7d0",
    bg: "rgba(16, 185, 129, 0.86)",
    border: "rgba(134, 239, 172, 0.55)",
    icon: "📍",
  },
  pay: {
    label: "Pay",
    color: "#bfdbfe",
    bg: "rgba(59, 130, 246, 0.86)",
    border: "rgba(147, 197, 253, 0.55)",
    icon: "💳",
  },
  birthday: {
    label: "Birthday",
    color: "#fbcfe8",
    bg: "rgba(168, 85, 247, 0.86)",
    border: "rgba(216, 180, 254, 0.55)",
    icon: "🎂",
  },
};

export const DEFAULT_COLORS = [
  "rgba(59, 130, 246, 0.86)",
  "rgba(16, 185, 129, 0.86)",
  "rgba(239, 68, 68, 0.86)",
  "rgba(168, 85, 247, 0.86)",
  "rgba(245, 158, 11, 0.86)",
  "rgba(6, 182, 212, 0.86)",
  "rgba(236, 72, 153, 0.86)",
  "rgba(132, 204, 22, 0.86)",
  "rgba(244, 114, 182, 0.86)",
  "rgba(59, 130, 246, 0.86)",
];
