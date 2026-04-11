import { CalendarItem, DraftEvent, EventType, RepeatType } from "./types";
import { TYPE_CONFIG } from "./mockData";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatEventDate(item: CalendarItem) {
  const date = new Date(`${item.date}T${item.allDay ? "00:00" : item.time || "00:00"}`);
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: item.allDay ? undefined : "2-digit",
    minute: item.allDay ? undefined : "2-digit",
  }).format(date);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCompactDate(date: string, time?: string, allDay?: boolean) {
  const value = `${date}T${allDay ? "00:00" : time || "00:00"}`;
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: allDay ? undefined : "2-digit",
    minute: allDay ? undefined : "2-digit",
  }).format(new Date(value));
}

export function getDaysRemaining(item: CalendarItem) {
  const target = new Date(`${item.date}T${item.allDay ? "00:00" : item.time || "00:00"}`);
  const now = new Date();

  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  ).getTime();

  const diffDays = Math.round((startTarget - startNow) / 86400000);

  if (diffDays === 0) return "azi";
  if (diffDays === 1) return "maine";
  if (diffDays > 1) return `in ${diffDays} zile`;
  if (diffDays === -1) return "ieri";
  return `intarziat cu ${Math.abs(diffDays)} zile`;
}

export function getEventChipStyle(item: CalendarItem) {
  const typeCfg = TYPE_CONFIG[item.type];
  const bg = item.customColor || typeCfg.bg;
  const border = item.customColor || typeCfg.border;

  return {
    background: bg,
    border: `1px solid ${border}`,
    color: typeCfg.color,
    opacity: item.completed ? 0.45 : 1,
    textDecoration: item.completed ? "line-through" as const : "none" as const,
  };
}

export function buildGroupedByDay(
  items: CalendarItem[],
  daysInMonth: number
): Map<number, CalendarItem[]> {
  const map = new Map<number, CalendarItem[]>();

  for (let day = 1; day <= daysInMonth; day++) {
    map.set(day, []);
  }

  items.forEach((item) => {
    const day = Number(item.date.split("-")[2]);
    map.get(day)?.push(item);
  });

  for (const [day, dayItems] of map.entries()) {
    dayItems.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      if (!a.time) return -1;
      if (!b.time) return 1;
      return a.time.localeCompare(b.time);
    });
    map.set(day, dayItems);
  }

  return map;
}

export function buildDraft(year: number, monthIndex: number): DraftEvent {
  return {
    type: "task",
    title: "",
    details: "",
    allDay: false,
    date: toDateString(year, monthIndex, 1),
    time: "10:00",
    repeat: "none",
    customRepeat: {
      interval: 1,
      unit: "week",
      monthlyMode: "same_day",
    },
    amount: "",
    address: "",
    customColor: "",
  };
}

export function createItemFromDraft(draft: DraftEvent): CalendarItem {
  return {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    details: draft.details.trim() || undefined,
    type: draft.type,
    date: draft.date,
    time: draft.allDay ? undefined : draft.time,
    allDay: draft.allDay,
    completed: false,
    repeat: draft.repeat,
    customRepeat: draft.repeat === "custom" ? draft.customRepeat : undefined,
    amount:
      draft.type === "pay" || draft.amount.trim()
        ? Number(draft.amount || 0)
        : undefined,
    address: draft.address.trim() || undefined,
    customColor: draft.customColor.trim() || undefined,
  };
}

export function shouldShowAmount(type: EventType) {
  return type === "pay" || type === "event";
}

export function getRepeatLabel(item: CalendarItem) {
  if (item.repeat !== "custom") return item.repeat;
  if (!item.customRepeat) return "custom";

  const { interval, unit } = item.customRepeat;
  return `every ${interval} ${unit}${interval > 1 ? "s" : ""}`;
}

export function filterMonthItems(
  items: CalendarItem[],
  selectedYear: number,
  selectedMonth: number,
  filters: Record<EventType, boolean>
) {
  return items.filter((item) => {
    const [y, m] = item.date.split("-").map(Number);
    return y === selectedYear && m === selectedMonth + 1 && filters[item.type];
  });
}

export function getMonthPayTotals(items: CalendarItem[]) {
  const pays = items.filter((i) => i.type === "pay");
  const paid = pays.filter((i) => i.completed).reduce((sum, i) => sum + (i.amount || 0), 0);
  const remaining = pays
    .filter((i) => !i.completed)
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return { paid, remaining };
}

export function isRepeatCustomOpen(repeat: RepeatType) {
  return repeat === "custom";
}