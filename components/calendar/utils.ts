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
  const date = new Date(
    `${item.date}T${item.allDay ? "00:00" : item.time || "00:00"}`,
  );

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

export function formatCompactDate(
  date: string,
  time?: string,
  allDay?: boolean,
) {
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
  const target = new Date(
    `${item.date}T${item.allDay ? "00:00" : item.time || "00:00"}`,
  );

  const now = new Date();

  const startNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const startTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
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
    textDecoration: item.completed
      ? ("line-through" as const)
      : ("none" as const),
  };
}

export function buildGroupedByDay(
  items: CalendarItem[],
  daysInMonth: number,
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
    category: "",
    address: "",
    customColor: "",
  };
}

export function createItemFromDraft(draft: DraftEvent): CalendarItem {
  const amount =
    draft.type === "pay" || draft.amount.trim()
      ? Number(draft.amount || 0)
      : undefined;

  return {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    details: draft.details.trim() || undefined,
    type: draft.type,
    date: draft.date,
    time: draft.allDay ? undefined : draft.time,
    allDay: draft.allDay,
    completed: false,
    status: "pending",
    repeat: draft.repeat,
    customRepeat: draft.repeat === "custom" ? draft.customRepeat : undefined,
    amount,
    actualAmount: undefined,
    paymentStatus: draft.type === "pay" ? "unpaid" : amount ? "unpaid" : "none",
    category: draft.category.trim() || undefined,
    address: draft.address.trim() || undefined,
    customColor: draft.customColor.trim() || undefined,
    occurrences: {},
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
  filters: Record<EventType, boolean>,
) {
  return items.filter((item) => {
    const [y, m] = item.date.split("-").map(Number);
    return y === selectedYear && m === selectedMonth + 1 && filters[item.type];
  });
}

export function getItemPaidAmount(item: CalendarItem) {
  if (!item.completed) return 0;

  if (typeof item.actualAmount === "number") {
    return item.actualAmount;
  }

  if (typeof item.amount === "number") {
    return item.amount;
  }

  return 0;
}

export function getItemRemainingAmount(item: CalendarItem) {
  if (item.completed) return 0;

  if (item.type === "pay" || item.type === "event") {
    return item.amount || 0;
  }

  return 0;
}

export function getMonthPayTotals(items: CalendarItem[]) {
  const moneyItems = items.filter(
    (item) => item.type === "pay" || typeof item.amount === "number",
  );

  const paid = moneyItems.reduce(
    (sum, item) => sum + getItemPaidAmount(item),
    0,
  );

  const remaining = moneyItems.reduce(
    (sum, item) => sum + getItemRemainingAmount(item),
    0,
  );

  return { paid, remaining };
}

export function isRepeatCustomOpen(repeat: RepeatType) {
  return repeat === "custom";
}

function dateFromParts(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day);
}

function daysBetween(a: Date, b: Date) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();

  return Math.floor((end - start) / 86400000);
}

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
}

function clampDay(year: number, monthIndex: number, day: number) {
  return Math.min(day, getDaysInMonth(year, monthIndex));
}

function getDefaultPaymentStatus(
  item: CalendarItem,
): CalendarItem["paymentStatus"] {
  if (item.type === "pay") return "unpaid";
  if (item.type === "event" && typeof item.amount === "number") return "unpaid";
  return "none";
}

function applyOccurrenceState(
  item: CalendarItem,
  occurrenceDate: string,
): Pick<
  CalendarItem,
  "completed" | "status" | "paymentStatus" | "actualAmount" | "completedAt"
> {
  const override = item.occurrences?.[occurrenceDate];

  if (override) {
    return {
      completed: override.completed,
      status: override.status,
      paymentStatus: override.paymentStatus,
      actualAmount: override.actualAmount,
      completedAt: override.completedAt,
    };
  }

  if (item.repeat !== "none") {
    return {
      completed: false,
      status: "pending",
      paymentStatus: getDefaultPaymentStatus(item),
      actualAmount: undefined,
      completedAt: undefined,
    };
  }

  return {
    completed: item.completed,
    status: item.status,
    paymentStatus: item.paymentStatus,
    actualAmount: item.actualAmount,
    completedAt: item.completedAt,
  };
}

function makeOccurrence(item: CalendarItem, date: Date): CalendarItem {
  const occurrenceDate = toDateString(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const state = applyOccurrenceState(item, occurrenceDate);

  return {
    ...item,
    ...state,
    id: `${item.id}__${occurrenceDate}`,
    baseId: item.baseId || item.id,
    isOccurrence: occurrenceDate !== item.date || item.repeat !== "none",
    originalDate: item.originalDate || item.date,
    occurrenceDate,
    date: occurrenceDate,
  };
}

function shouldIncludeOccurrence(
  item: CalendarItem,
  original: Date,
  target: Date,
) {
  if (target < original) return false;

  if (item.repeat === "daily") {
    return true;
  }

  if (item.repeat === "weekly") {
    return daysBetween(original, target) % 7 === 0;
  }

  if (item.repeat === "monthly") {
    return (
      target.getDate() ===
      clampDay(target.getFullYear(), target.getMonth(), original.getDate())
    );
  }

  if (item.repeat === "yearly") {
    return (
      target.getMonth() === original.getMonth() &&
      target.getDate() ===
        clampDay(target.getFullYear(), target.getMonth(), original.getDate())
    );
  }

  if (item.repeat === "custom" && item.customRepeat) {
    const interval = Math.max(1, item.customRepeat.interval || 1);
    const unit = item.customRepeat.unit;

    if (unit === "day") {
      return daysBetween(original, target) % interval === 0;
    }

    if (unit === "week") {
      return daysBetween(original, target) % (interval * 7) === 0;
    }

    if (unit === "month") {
      const diff = monthsBetween(original, target);

      return (
        diff >= 0 &&
        diff % interval === 0 &&
        target.getDate() ===
          clampDay(target.getFullYear(), target.getMonth(), original.getDate())
      );
    }

    if (unit === "year") {
      const diff = target.getFullYear() - original.getFullYear();

      return (
        diff >= 0 &&
        diff % interval === 0 &&
        target.getMonth() === original.getMonth() &&
        target.getDate() ===
          clampDay(target.getFullYear(), target.getMonth(), original.getDate())
      );
    }
  }

  return false;
}

export function expandRecurringItemsForMonth(
  items: CalendarItem[],
  selectedYear: number,
  selectedMonth: number,
) {
  const expanded: CalendarItem[] = [];
  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);

  items.forEach((item) => {
    if (item.repeat === "none") {
      expanded.push(item);
      return;
    }

    const original = new Date(`${item.originalDate || item.date}T00:00:00`);

    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const target = dateFromParts(selectedYear, selectedMonth, day);

      if (shouldIncludeOccurrence(item, original, target)) {
        expanded.push(makeOccurrence(item, target));
      }
    }
  });

  return expanded;
}
