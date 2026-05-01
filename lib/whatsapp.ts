import { db } from "@/lib/db";

export type WhatsAppSettings = {
  enabled: boolean;
  timezone: string;
  sendAt: string;
  sendEmptyMessage: boolean;

  reminderDaysAhead: number;
  includeEmptyDays: boolean;

  includeTasks: boolean;
  includeEvents: boolean;
  includePayments: boolean;
  includeBirthdays: boolean;
  includeOnlyPending: boolean;
  includeLocation: boolean;
  includeAmounts: boolean;

  includeMonthlySummary: boolean;

  includeOverdue: boolean;
  includeOverduePayments: boolean;
  includeOverdueTasks: boolean;
  includeOverdueEvents: boolean;
  overdueLookbackDays: number;
  maxOverdueItems: number;

  priorityPaymentsFirst: boolean;

  birthdayReminderDays: number[];
  messageTitle: string;
  tomorrowLabel: string;
  emptyMessage: string;
  testPrefix: string;
};

type EventRow = {
  id: string | number;
  title: string;
  details: string | null;
  type: string | null;
  event_at: string | Date;
  all_day: boolean | null;
  status: string | null;
  amount: string | number | null;
  actual_amount: string | number | null;
  payment_status: string | null;
  category: string | null;
  address: string | null;
  repeat_type: string | null;
  repeat_interval: number | null;
  repeat_unit: string | null;
  custom_repeat_config: unknown;
  completed_at: string | Date | null;
};

type OccurrenceRow = {
  event_id: string | number;
  occurrence_date: string | Date;
  status: string | null;
  payment_status: string | null;
  actual_amount: string | number | null;
  completed_at: string | Date | null;
};

type ExpenseSummaryRow = {
  spent_today: string | number | null;
  spent_yesterday: string | number | null;
  spent_month: string | number | null;
};

type MessageItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  allDay: boolean;
  status: string;
  amount: number | null;
  actualAmount: number | null;
  paymentStatus: string;
  category: string;
  address: string;
  isOccurrence: boolean;
  birthdayDaysUntil?: number;
};

type DayGroup = {
  date: string;
  items: MessageItem[];
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  enabled: true,
  timezone: "Europe/Bucharest",
  sendAt: "22:00",
  sendEmptyMessage: false,

  reminderDaysAhead: 2,
  includeEmptyDays: false,

  includeTasks: true,
  includeEvents: true,
  includePayments: true,
  includeBirthdays: true,
  includeOnlyPending: true,
  includeLocation: true,
  includeAmounts: true,

  includeMonthlySummary: true,

  includeOverdue: true,
  includeOverduePayments: true,
  includeOverdueTasks: true,
  includeOverdueEvents: false,
  overdueLookbackDays: 45,
  maxOverdueItems: 10,

  priorityPaymentsFirst: true,

  birthdayReminderDays: [7, 5, 3, 1],
  messageTitle: "PXP Calendar",
  tomorrowLabel: "Urmatoarele zile",
  emptyMessage: "Nu ai evenimente programate.",
  testPrefix: "TEST",
};

const RO_MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const RO_WEEKDAYS = [
  "Duminica",
  "Luni",
  "Marti",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sambata",
];

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeString(value: unknown) {
  return String(value || "").trim();
}

function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeSettings(value: unknown): WhatsAppSettings {
  const input = value && typeof value === "object" ? value : {};
  const raw = input as Partial<WhatsAppSettings>;

  const birthdayReminderDays = Array.isArray(raw.birthdayReminderDays)
    ? raw.birthdayReminderDays
        .map((day) => Number(day))
        .filter((day) => Number.isFinite(day) && day > 0)
    : DEFAULT_WHATSAPP_SETTINGS.birthdayReminderDays;

  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : DEFAULT_WHATSAPP_SETTINGS.enabled,

    timezone: raw.timezone || DEFAULT_WHATSAPP_SETTINGS.timezone,
    sendAt: raw.sendAt || DEFAULT_WHATSAPP_SETTINGS.sendAt,

    sendEmptyMessage:
      typeof raw.sendEmptyMessage === "boolean"
        ? raw.sendEmptyMessage
        : DEFAULT_WHATSAPP_SETTINGS.sendEmptyMessage,

    reminderDaysAhead: clampNumber(
      raw.reminderDaysAhead,
      DEFAULT_WHATSAPP_SETTINGS.reminderDaysAhead,
      1,
      14,
    ),

    includeEmptyDays:
      typeof raw.includeEmptyDays === "boolean"
        ? raw.includeEmptyDays
        : DEFAULT_WHATSAPP_SETTINGS.includeEmptyDays,

    includeTasks:
      typeof raw.includeTasks === "boolean"
        ? raw.includeTasks
        : DEFAULT_WHATSAPP_SETTINGS.includeTasks,

    includeEvents:
      typeof raw.includeEvents === "boolean"
        ? raw.includeEvents
        : DEFAULT_WHATSAPP_SETTINGS.includeEvents,

    includePayments:
      typeof raw.includePayments === "boolean"
        ? raw.includePayments
        : DEFAULT_WHATSAPP_SETTINGS.includePayments,

    includeBirthdays:
      typeof raw.includeBirthdays === "boolean"
        ? raw.includeBirthdays
        : DEFAULT_WHATSAPP_SETTINGS.includeBirthdays,

    includeOnlyPending:
      typeof raw.includeOnlyPending === "boolean"
        ? raw.includeOnlyPending
        : DEFAULT_WHATSAPP_SETTINGS.includeOnlyPending,

    includeLocation:
      typeof raw.includeLocation === "boolean"
        ? raw.includeLocation
        : DEFAULT_WHATSAPP_SETTINGS.includeLocation,

    includeAmounts:
      typeof raw.includeAmounts === "boolean"
        ? raw.includeAmounts
        : DEFAULT_WHATSAPP_SETTINGS.includeAmounts,

    includeMonthlySummary:
      typeof raw.includeMonthlySummary === "boolean"
        ? raw.includeMonthlySummary
        : DEFAULT_WHATSAPP_SETTINGS.includeMonthlySummary,

    includeOverdue:
      typeof raw.includeOverdue === "boolean"
        ? raw.includeOverdue
        : DEFAULT_WHATSAPP_SETTINGS.includeOverdue,

    includeOverduePayments:
      typeof raw.includeOverduePayments === "boolean"
        ? raw.includeOverduePayments
        : DEFAULT_WHATSAPP_SETTINGS.includeOverduePayments,

    includeOverdueTasks:
      typeof raw.includeOverdueTasks === "boolean"
        ? raw.includeOverdueTasks
        : DEFAULT_WHATSAPP_SETTINGS.includeOverdueTasks,

    includeOverdueEvents:
      typeof raw.includeOverdueEvents === "boolean"
        ? raw.includeOverdueEvents
        : DEFAULT_WHATSAPP_SETTINGS.includeOverdueEvents,

    overdueLookbackDays: clampNumber(
      raw.overdueLookbackDays,
      DEFAULT_WHATSAPP_SETTINGS.overdueLookbackDays,
      1,
      365,
    ),

    maxOverdueItems: clampNumber(
      raw.maxOverdueItems,
      DEFAULT_WHATSAPP_SETTINGS.maxOverdueItems,
      1,
      50,
    ),

    priorityPaymentsFirst:
      typeof raw.priorityPaymentsFirst === "boolean"
        ? raw.priorityPaymentsFirst
        : DEFAULT_WHATSAPP_SETTINGS.priorityPaymentsFirst,

    birthdayReminderDays:
      birthdayReminderDays.length > 0
        ? birthdayReminderDays
        : DEFAULT_WHATSAPP_SETTINGS.birthdayReminderDays,

    messageTitle: raw.messageTitle || DEFAULT_WHATSAPP_SETTINGS.messageTitle,
    tomorrowLabel: raw.tomorrowLabel || DEFAULT_WHATSAPP_SETTINGS.tomorrowLabel,
    emptyMessage: raw.emptyMessage || DEFAULT_WHATSAPP_SETTINGS.emptyMessage,
    testPrefix: raw.testPrefix || DEFAULT_WHATSAPP_SETTINGS.testPrefix,
  };
}

export async function getWhatsAppSettings() {
  const result = await db.query<{ value: unknown }>(
    `
      SELECT value
      FROM app_settings
      WHERE key = 'whatsapp'
      LIMIT 1
    `,
  );

  if (result.rowCount === 0) {
    await db.query(
      `
        INSERT INTO app_settings (key, value)
        VALUES ('whatsapp', $1::jsonb)
        ON CONFLICT (key)
        DO NOTHING
      `,
      [JSON.stringify(DEFAULT_WHATSAPP_SETTINGS)],
    );

    return DEFAULT_WHATSAPP_SETTINGS;
  }

  return normalizeSettings(result.rows[0].value);
}

export async function saveWhatsAppSettings(
  settings: Partial<WhatsAppSettings>,
) {
  const normalized = normalizeSettings(settings);

  const result = await db.query<{ value: unknown }>(
    `
      INSERT INTO app_settings (key, value)
      VALUES ('whatsapp', $1::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
      RETURNING value
    `,
    [JSON.stringify(normalized)],
  );

  return normalizeSettings(result.rows[0].value);
}

function getDatePartsInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value || 0);
  const month = Number(parts.find((part) => part.type === "month")?.value || 0);
  const day = Number(parts.find((part) => part.type === "day")?.value || 0);

  return { year, month, day };
}

function toDateStringFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function todayInTimezone(timezone: string) {
  const parts = getDatePartsInTimezone(new Date(), timezone);

  return toDateStringFromParts(parts.year, parts.month, parts.day);
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);

  return toDateStringFromParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function getMonthStart(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return toDateStringFromParts(date.getFullYear(), date.getMonth() + 1, 1);
}

function getMonthEnd(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return toDateStringFromParts(
    date.getFullYear(),
    date.getMonth() + 1,
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
  );
}

function getMonthDayInfo(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const totalDays = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  return {
    currentDay: date.getDate(),
    totalDays,
  };
}

function getDateRange(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;

  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function toLocalDateString(value: string | Date, timezone: string) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = getDatePartsInTimezone(date, timezone);

  return toDateStringFromParts(parts.year, parts.month, parts.day);
}

function toLocalTimeString(value: string | Date, timezone: string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
  );
}

function monthsBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
}

function clampDay(year: number, monthIndex: number, day: number) {
  return Math.min(day, new Date(year, monthIndex + 1, 0).getDate());
}

function shouldIncludeOccurrence(
  row: EventRow,
  originalDate: string,
  targetDate: string,
) {
  if (targetDate < originalDate) return false;

  const repeatType = row.repeat_type || "none";

  if (repeatType === "none") {
    return originalDate === targetDate;
  }

  if (repeatType === "daily") {
    return true;
  }

  if (repeatType === "weekly") {
    return daysBetween(originalDate, targetDate) % 7 === 0;
  }

  const original = new Date(`${originalDate}T00:00:00`);
  const target = new Date(`${targetDate}T00:00:00`);

  if (repeatType === "monthly") {
    return (
      target.getDate() ===
      clampDay(target.getFullYear(), target.getMonth(), original.getDate())
    );
  }

  if (repeatType === "yearly") {
    return (
      target.getMonth() === original.getMonth() &&
      target.getDate() ===
        clampDay(target.getFullYear(), target.getMonth(), original.getDate())
    );
  }

  if (repeatType === "custom") {
    const customConfig =
      row.custom_repeat_config && typeof row.custom_repeat_config === "object"
        ? (row.custom_repeat_config as {
            interval?: number;
            unit?: string;
          })
        : {};

    const interval = Math.max(
      1,
      Number(customConfig.interval || row.repeat_interval || 1),
    );

    const unit = String(customConfig.unit || row.repeat_unit || "week");

    if (unit === "day") {
      return daysBetween(originalDate, targetDate) % interval === 0;
    }

    if (unit === "week") {
      return daysBetween(originalDate, targetDate) % (interval * 7) === 0;
    }

    if (unit === "month") {
      const diff = monthsBetween(originalDate, targetDate);

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

function typeIsEnabled(type: string, settings: WhatsAppSettings) {
  if (type === "task") return settings.includeTasks;
  if (type === "event") return settings.includeEvents;
  if (type === "pay") return settings.includePayments;
  if (type === "birthday") return settings.includeBirthdays;

  return true;
}

function overdueTypeIsEnabled(type: string, settings: WhatsAppSettings) {
  if (!settings.includeOverdue) return false;
  if (type === "pay") return settings.includeOverduePayments;
  if (type === "task") return settings.includeOverdueTasks;
  if (type === "event") return settings.includeOverdueEvents;

  return false;
}

function getOccurrenceKey(eventId: string | number, date: string) {
  return `${String(eventId)}::${date}`;
}

function buildItemFromRow({
  row,
  occurrence,
  date,
  timezone,
  birthdayDaysUntil,
}: {
  row: EventRow;
  occurrence?: OccurrenceRow;
  date: string;
  timezone: string;
  birthdayDaysUntil?: number;
}): MessageItem {
  const status = occurrence?.status || row.status || "pending";
  const paymentStatus =
    occurrence?.payment_status || row.payment_status || "none";

  return {
    id: `${String(row.id)}::${date}`,
    title: row.title,
    type: row.type || "event",
    date,
    time: row.all_day ? "" : toLocalTimeString(row.event_at, timezone),
    allDay: Boolean(row.all_day),
    status,
    amount: toNumber(row.amount),
    actualAmount: toNumber(occurrence?.actual_amount ?? row.actual_amount),
    paymentStatus,
    category: safeString(row.category),
    address: safeString(row.address),
    isOccurrence: date !== toLocalDateString(row.event_at, timezone),
    birthdayDaysUntil,
  };
}

async function loadEventsForDates(dates: string[], timezone: string) {
  const sortedDates = [...dates].sort();
  const maxDate = sortedDates.at(-1) || todayInTimezone(timezone);

  const eventsResult = await db.query<EventRow>(
    `
      SELECT
        id,
        title,
        details,
        type,
        event_at,
        all_day,
        status,
        amount,
        actual_amount,
        payment_status,
        category,
        address,
        repeat_type,
        repeat_interval,
        repeat_unit,
        custom_repeat_config,
        completed_at
      FROM events
      WHERE event_at::date <= $1::date
      ORDER BY event_at ASC
    `,
    [maxDate],
  );

  const occurrencesResult = await db.query<OccurrenceRow>(
    `
      SELECT
        event_id,
        occurrence_date,
        status,
        payment_status,
        actual_amount,
        completed_at
      FROM event_occurrences
      WHERE occurrence_date = ANY($1::date[])
    `,
    [dates],
  );

  const occurrences = new Map<string, OccurrenceRow>();

  occurrencesResult.rows.forEach((occurrence) => {
    const occurrenceDate = toLocalDateString(
      occurrence.occurrence_date,
      timezone,
    );

    occurrences.set(getOccurrenceKey(occurrence.event_id, occurrenceDate), {
      ...occurrence,
      occurrence_date: occurrenceDate,
    });
  });

  return {
    events: eventsResult.rows,
    occurrences,
  };
}

function formatDateHuman(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const weekday = RO_WEEKDAYS[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = RO_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

function formatShortDateHuman(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = RO_MONTHS[date.getMonth()];

  return `${day} ${month}`;
}

function itemAmount(item: MessageItem) {
  return item.actualAmount ?? item.amount ?? 0;
}

function formatItemLine(item: MessageItem, settings: WhatsAppSettings) {
  const pieces = [item.title];

  if (!item.allDay && item.time) {
    pieces.push(item.time);
  }

  if (
    settings.includeAmounts &&
    (item.type === "pay" || typeof item.amount === "number")
  ) {
    const amount = itemAmount(item);

    if (amount > 0) {
      pieces.push(`${amount} lei`);
    }
  }

  if (item.category) {
    pieces.push(item.category);
  }

  if (item.birthdayDaysUntil) {
    pieces.push(`în ${item.birthdayDaysUntil} zile`);
  }

  const mainLine = `• ${pieces.join(" · ")}`;

  if (settings.includeLocation && item.address) {
    return `${mainLine}\n  📍 ${item.address}`;
  }

  return mainLine;
}

function formatOverdueLine(item: MessageItem, settings: WhatsAppSettings) {
  const dueDate = formatShortDateHuman(item.date);
  const baseLine = formatItemLine(item, settings);

  return `${baseLine} · scadent pe ${dueDate}`;
}

function splitByType(items: MessageItem[]) {
  return {
    tasks: items.filter((item) => item.type === "task"),
    events: items.filter((item) => item.type === "event"),
    payments: items.filter((item) => item.type === "pay"),
    birthdays: items.filter((item) => item.type === "birthday"),
  };
}

function buildSection(
  title: string,
  items: MessageItem[],
  settings: WhatsAppSettings,
) {
  if (items.length === 0) return "";

  return [title, ...items.map((item) => formatItemLine(item, settings))].join(
    "\n",
  );
}

function buildOverdueSection(items: MessageItem[], settings: WhatsAppSettings) {
  if (items.length === 0) return "";

  return [
    "⚠️ Restante",
    ...items.map((item) => formatOverdueLine(item, settings)),
  ].join("\n");
}

function sortMessageItems(items: MessageItem[], settings: WhatsAppSettings) {
  return [...items].sort((a, b) => {
    if (settings.priorityPaymentsFirst && a.type !== b.type) {
      if (a.type === "pay") return -1;
      if (b.type === "pay") return 1;
    }

    if (a.allDay !== b.allDay) return a.allDay ? 1 : -1;

    return a.time.localeCompare(b.time);
  });
}

function filterPending(items: MessageItem[], settings: WhatsAppSettings) {
  if (!settings.includeOnlyPending) return items;

  return items.filter((item) => item.status !== "completed");
}

function sumPayments(items: MessageItem[]) {
  return items
    .filter((item) => item.type === "pay")
    .reduce((sum, item) => sum + itemAmount(item), 0);
}

function buildItemsForDates({
  events,
  occurrences,
  dates,
  timezone,
  settings,
  mode,
}: {
  events: EventRow[];
  occurrences: Map<string, OccurrenceRow>;
  dates: string[];
  timezone: string;
  settings: WhatsAppSettings;
  mode: "upcoming" | "overdue" | "month";
}) {
  const items: MessageItem[] = [];

  events.forEach((row) => {
    const type = row.type || "event";
    const originalDate = toLocalDateString(row.event_at, timezone);

    if (mode === "upcoming" && !typeIsEnabled(type, settings)) return;
    if (mode === "overdue" && !overdueTypeIsEnabled(type, settings)) return;
    if (mode === "month" && type !== "pay") return;

    dates.forEach((date) => {
      if (!shouldIncludeOccurrence(row, originalDate, date)) return;

      const occurrence = occurrences.get(getOccurrenceKey(row.id, date));

      const item = buildItemFromRow({
        row,
        occurrence,
        date,
        timezone,
      });

      items.push(item);
    });
  });

  return filterPending(items, settings);
}

function buildDayGroups({
  dates,
  items,
  includeEmptyDays,
}: {
  dates: string[];
  items: MessageItem[];
  includeEmptyDays: boolean;
}) {
  const groups: DayGroup[] = dates.map((date) => ({
    date,
    items: [],
  }));

  items.forEach((item) => {
    const group = groups.find((entry) => entry.date === item.date);

    if (group) {
      group.items.push(item);
    }
  });

  return groups.filter((group) => includeEmptyDays || group.items.length > 0);
}

function buildDaySection(group: DayGroup, settings: WhatsAppSettings) {
  const dayInfo = getMonthDayInfo(group.date);
  const lines = [
    `🗓️ ${formatDateHuman(group.date)}`,
    `Ziua ${dayInfo.currentDay} / ${dayInfo.totalDays} din luna`,
  ];

  if (group.items.length === 0) {
    lines.push("Nu ai evenimente.");
    return lines.join("\n");
  }

  const sortedItems = sortMessageItems(group.items, settings);
  const { tasks, events, payments, birthdays } = splitByType(sortedItems);

  const sections = [
    buildSection("💳 Plati", payments, settings),
    buildSection("✅ Taskuri", tasks, settings),
    buildSection("📌 Evenimente", events, settings),
    buildSection("🎂 Birthdays", birthdays, settings),
  ].filter(Boolean);

  return [...lines, "", sections.join("\n\n")].join("\n");
}

function buildBirthdayItems({
  events,
  occurrences,
  birthdayDates,
  timezone,
  settings,
}: {
  events: EventRow[];
  occurrences: Map<string, OccurrenceRow>;
  birthdayDates: Array<{ days: number; date: string }>;
  timezone: string;
  settings: WhatsAppSettings;
}) {
  const items: MessageItem[] = [];

  if (!settings.includeBirthdays) return items;

  events.forEach((row) => {
    const type = row.type || "event";

    if (type !== "birthday") return;

    const originalDate = toLocalDateString(row.event_at, timezone);

    birthdayDates.forEach((birthdayDate) => {
      if (!shouldIncludeOccurrence(row, originalDate, birthdayDate.date))
        return;

      const occurrence = occurrences.get(
        getOccurrenceKey(row.id, birthdayDate.date),
      );

      const item = buildItemFromRow({
        row,
        occurrence,
        date: birthdayDate.date,
        timezone,
        birthdayDaysUntil: birthdayDate.days,
      });

      items.push(item);
    });
  });

  return filterPending(items, settings).sort((a, b) => {
    return (a.birthdayDaysUntil || 0) - (b.birthdayDaysUntil || 0);
  });
}

function buildBirthdaySection(
  items: MessageItem[],
  settings: WhatsAppSettings,
) {
  if (items.length === 0) return "";

  return [
    "🎂 Birthdays in curand",
    ...items.map((item) => formatItemLine(item, settings)),
  ].join("\n");
}

function formatLei(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

async function getExpenseSummary(baseToday: string) {
  const monthStart = getMonthStart(baseToday);
  const monthEnd = getMonthEnd(baseToday);
  const yesterday = addDays(baseToday, -1);

  const result = await db.query<ExpenseSummaryRow>(
    `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE expense_date = $1::date), 0) AS spent_today,
        COALESCE(SUM(amount) FILTER (WHERE expense_date = $2::date), 0) AS spent_yesterday,
        COALESCE(SUM(amount) FILTER (
          WHERE expense_date >= $3::date
            AND expense_date <= $4::date
        ), 0) AS spent_month
      FROM expenses
    `,
    [baseToday, yesterday, monthStart, monthEnd],
  );

  const row = result.rows[0];

  return {
    spentToday: toNumber(row?.spent_today) || 0,
    spentYesterday: toNumber(row?.spent_yesterday) || 0,
    spentMonth: toNumber(row?.spent_month) || 0,
  };
}

export async function buildWhatsAppMessage({
  settings,
  isTest = false,
  todayDate,
}: {
  settings?: Partial<WhatsAppSettings>;
  isTest?: boolean;
  todayDate?: string;
}) {
  const finalSettings = settings
    ? normalizeSettings(settings)
    : await getWhatsAppSettings();

  const baseToday = todayDate || todayInTimezone(finalSettings.timezone);

  const expenseSummary = await getExpenseSummary(baseToday);

  const upcomingStart = addDays(baseToday, 1);
  const upcomingEnd = addDays(baseToday, finalSettings.reminderDaysAhead);
  const upcomingDates = getDateRange(upcomingStart, upcomingEnd);

  const overdueStart = addDays(baseToday, -finalSettings.overdueLookbackDays);
  const overdueEnd = addDays(baseToday, -1);
  const overdueDates =
    overdueStart <= overdueEnd ? getDateRange(overdueStart, overdueEnd) : [];

  const monthStart = getMonthStart(baseToday);
  const monthEnd = getMonthEnd(baseToday);
  const monthDates = getDateRange(monthStart, monthEnd);

  const birthdayDates = finalSettings.birthdayReminderDays.map((days) => ({
    days,
    date: addDays(baseToday, days),
  }));

  const allDates = Array.from(
    new Set([
      ...upcomingDates,
      ...overdueDates,
      ...monthDates,
      ...birthdayDates.map((item) => item.date),
    ]),
  );

  const { events, occurrences } = await loadEventsForDates(
    allDates,
    finalSettings.timezone,
  );

  const upcomingItems = buildItemsForDates({
    events,
    occurrences,
    dates: upcomingDates,
    timezone: finalSettings.timezone,
    settings: finalSettings,
    mode: "upcoming",
  });

  const overdueItems = buildItemsForDates({
    events,
    occurrences,
    dates: overdueDates,
    timezone: finalSettings.timezone,
    settings: finalSettings,
    mode: "overdue",
  })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, finalSettings.maxOverdueItems);

  const monthPayItems = buildItemsForDates({
    events,
    occurrences,
    dates: monthDates,
    timezone: finalSettings.timezone,
    settings: {
      ...finalSettings,
      includeOnlyPending: false,
    },
    mode: "month",
  });

  const birthdayItems = buildBirthdayItems({
    events,
    occurrences,
    birthdayDates,
    timezone: finalSettings.timezone,
    settings: finalSettings,
  });

  const upcomingGroups = buildDayGroups({
    dates: upcomingDates,
    items: upcomingItems,
    includeEmptyDays: finalSettings.includeEmptyDays,
  });

  const upcomingPaymentsTotal = sumPayments(upcomingItems);
  const overduePaymentsTotal = sumPayments(overdueItems);
  const urgentTotal = upcomingPaymentsTotal + overduePaymentsTotal;

  const monthlyPaid = monthPayItems
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + itemAmount(item), 0);

  const monthlyRemaining = monthPayItems
    .filter((item) => item.status !== "completed")
    .reduce((sum, item) => sum + itemAmount(item), 0);

  const monthlyTotal = monthlyPaid + monthlyRemaining;
  const paidPercent =
    monthlyTotal > 0 ? Math.round((monthlyPaid / monthlyTotal) * 100) : 0;

  const hasItems =
    upcomingItems.length > 0 ||
    overdueItems.length > 0 ||
    birthdayItems.length > 0;

  const prefix =
    isTest && finalSettings.testPrefix ? `[${finalSettings.testPrefix}] ` : "";

  const header = `${prefix}${finalSettings.messageTitle}`;

  const dateRangeLabel =
    finalSettings.reminderDaysAhead === 1
      ? formatDateHuman(upcomingStart)
      : `${formatShortDateHuman(upcomingStart)} - ${formatShortDateHuman(
          upcomingEnd,
        )}`;

  const lines: string[] = [
    header,
    "",
    `📅 ${finalSettings.tomorrowLabel}`,
    dateRangeLabel,
  ];

  if (finalSettings.includeMonthlySummary) {
    const realMonthSpent = monthlyPaid + expenseSummary.spentMonth;
    const estimatedMonthTotal = realMonthSpent + monthlyRemaining;

    lines.push(
      "",
      "💰 Rezumat luna",
      `✅ Plati achitate: ${formatLei(monthlyPaid)} lei`,
      `💸 Cheltuieli spontane: ${formatLei(expenseSummary.spentMonth)} lei`,
      `📊 Iesiri reale luna: ${formatLei(realMonthSpent)} lei`,
      `⏳ Ramas de plata: ${formatLei(monthlyRemaining)} lei`,
      `🧾 Estimat final luna: ${formatLei(estimatedMonthTotal)} lei`,
      "",
      "💸 Cheltuieli recente",
      `• Azi: ${formatLei(expenseSummary.spentToday)} lei`,
      `• Ieri: ${formatLei(expenseSummary.spentYesterday)} lei`,
      `💳 De platit in urmatoarele ${finalSettings.reminderDaysAhead} zile: ${formatLei(
        upcomingPaymentsTotal,
      )} lei`,
    );
  }

  if (finalSettings.includeOverdue) {
    lines.push(
      "",
      "⚠️ Prioritar",
      `• Restante: ${formatLei(overduePaymentsTotal)} lei`,
      `• Urmatoarele ${finalSettings.reminderDaysAhead} zile: ${formatLei(
        upcomingPaymentsTotal,
      )} lei`,
      `• Total de pregătit: ${formatLei(urgentTotal)} lei`,
    );
  }

  if (!hasItems) {
    lines.push("", finalSettings.emptyMessage);
  } else {
    const sections: string[] = [];

    const overdueSection = buildOverdueSection(overdueItems, finalSettings);
    if (overdueSection) sections.push(overdueSection);

    upcomingGroups.forEach((group) => {
      sections.push(buildDaySection(group, finalSettings));
    });

    const birthdaySection = buildBirthdaySection(birthdayItems, finalSettings);
    if (birthdaySection) sections.push(birthdaySection);

    if (sections.length > 0) {
      lines.push("", "━━━━━━━━━━━━", "", sections.join("\n\n━━━━━━━━━━━━\n\n"));
    }
  }

  return {
    message: lines.join("\n"),
    hasItems,
    tomorrow: upcomingStart,
    today: baseToday,
    counts: {
      total: upcomingItems.length + overdueItems.length + birthdayItems.length,
      upcoming: upcomingItems.length,
      overdue: overdueItems.length,
      tasks: upcomingItems.filter((item) => item.type === "task").length,
      events: upcomingItems.filter((item) => item.type === "event").length,
      payments: upcomingItems.filter((item) => item.type === "pay").length,
      birthdays: birthdayItems.length,
    },
    totals: {
      monthlyPaid,
      monthlyRemaining,
      monthlyTotal,
      paidPercent,
      upcomingPaymentsTotal,
      overduePaymentsTotal,
      spentToday: expenseSummary.spentToday,
      spentYesterday: expenseSummary.spentYesterday,
      spentMonth: expenseSummary.spentMonth,
      urgentTotal,
    },
    settings: finalSettings,
  };
}

export async function sendWhatsAppText(message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const to = process.env.WHATSAPP_TO;

  if (!token || !phoneId || !to) {
    return {
      ok: false,
      status: 500,
      data: {
        message: "Missing WhatsApp env vars.",
        debug: {
          hasToken: Boolean(token),
          hasPhoneId: Boolean(phoneId),
          hasTo: Boolean(to),
        },
      },
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      }),
    },
  );

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
