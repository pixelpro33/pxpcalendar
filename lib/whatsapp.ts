import { db } from "@/lib/db";

export type WhatsAppSettings = {
  enabled: boolean;
  timezone: string;
  sendAt: string;
  sendEmptyMessage: boolean;
  includeTasks: boolean;
  includeEvents: boolean;
  includePayments: boolean;
  includeBirthdays: boolean;
  includeOnlyPending: boolean;
  includeLocation: boolean;
  includeAmounts: boolean;
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

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  enabled: true,
  timezone: "Europe/Bucharest",
  sendAt: "22:00",
  sendEmptyMessage: false,
  includeTasks: true,
  includeEvents: true,
  includePayments: true,
  includeBirthdays: true,
  includeOnlyPending: true,
  includeLocation: true,
  includeAmounts: true,
  birthdayReminderDays: [7, 5, 3, 1],
  messageTitle: "PXP Calendar",
  tomorrowLabel: "Ai evenimente maine",
  emptyMessage: "Nu ai evenimente pentru maine.",
  testPrefix: "TEST",
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeString(value: unknown) {
  return String(value || "").trim();
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

export async function saveWhatsAppSettings(settings: WhatsAppSettings) {
  const normalized = normalizeSettings(settings);

  const result = await db.query<{ value: unknown }>(
    `
      INSERT INTO app_settings (key, value)
      VALUES ('whatsapp', $1::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value
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
    id: String(row.id),
    title: row.title,
    type: row.type || "event",
    date,
    time: row.all_day ? "" : toLocalTimeString(row.event_at, timezone),
    allDay: Boolean(row.all_day),
    status,
    amount: toNumber(row.amount),
    actualAmount: toNumber(occurrence?.actual_amount || row.actual_amount),
    paymentStatus,
    category: safeString(row.category),
    address: safeString(row.address),
    isOccurrence: date !== toLocalDateString(row.event_at, timezone),
    birthdayDaysUntil,
  };
}

async function loadEventsForDates(dates: string[], timezone: string) {
  const maxDate = [...dates].sort().at(-1) || todayInTimezone(timezone);

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

  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatItemLine(item: MessageItem, settings: WhatsAppSettings) {
  const icon =
    item.type === "pay"
      ? "💳"
      : item.type === "task"
        ? "✅"
        : item.type === "birthday"
          ? "🎂"
          : "📌";

  const pieces = [`${icon} ${item.title}`];

  if (!item.allDay && item.time) {
    pieces.push(item.time);
  }

  if (
    settings.includeAmounts &&
    (item.type === "pay" || typeof item.amount === "number")
  ) {
    const amount = item.actualAmount ?? item.amount;

    if (typeof amount === "number") {
      pieces.push(`${amount} lei`);
    }
  }

  if (item.category) {
    pieces.push(item.category);
  }

  if (item.birthdayDaysUntil) {
    pieces.push(`in ${item.birthdayDaysUntil} zile`);
  }

  const mainLine = `• ${pieces.join(" · ")}`;

  if (settings.includeLocation && item.address) {
    return `${mainLine}\n  📍 ${item.address}`;
  }

  return mainLine;
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

export async function buildWhatsAppMessage({
  settings,
  isTest = false,
  todayDate,
}: {
  settings?: WhatsAppSettings;
  isTest?: boolean;
  todayDate?: string;
}) {
  const finalSettings = settings || (await getWhatsAppSettings());
  const baseToday = todayDate || todayInTimezone(finalSettings.timezone);
  const tomorrow = addDays(baseToday, 1);

  const birthdayDates = finalSettings.birthdayReminderDays.map((days) => ({
    days,
    date: addDays(baseToday, days),
  }));

  const dates = Array.from(
    new Set([tomorrow, ...birthdayDates.map((item) => item.date)]),
  );

  const { events, occurrences } = await loadEventsForDates(
    dates,
    finalSettings.timezone,
  );

  const tomorrowItems: MessageItem[] = [];
  const birthdayItems: MessageItem[] = [];

  events.forEach((row) => {
    const type = row.type || "event";
    const originalDate = toLocalDateString(
      row.event_at,
      finalSettings.timezone,
    );

    if (!typeIsEnabled(type, finalSettings)) return;

    if (type !== "birthday") {
      if (!shouldIncludeOccurrence(row, originalDate, tomorrow)) return;

      const occurrence = occurrences.get(getOccurrenceKey(row.id, tomorrow));

      const item = buildItemFromRow({
        row,
        occurrence,
        date: tomorrow,
        timezone: finalSettings.timezone,
      });

      if (finalSettings.includeOnlyPending && item.status === "completed") {
        return;
      }

      tomorrowItems.push(item);
      return;
    }

    if (!finalSettings.includeBirthdays) return;

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
        timezone: finalSettings.timezone,
        birthdayDaysUntil: birthdayDate.days,
      });

      if (finalSettings.includeOnlyPending && item.status === "completed") {
        return;
      }

      birthdayItems.push(item);
    });
  });

  tomorrowItems.sort((a, b) => {
    if (a.allDay !== b.allDay) return a.allDay ? 1 : -1;
    return a.time.localeCompare(b.time);
  });

  birthdayItems.sort((a, b) => {
    return (a.birthdayDaysUntil || 0) - (b.birthdayDaysUntil || 0);
  });

  const { tasks, events: eventItems, payments } = splitByType(tomorrowItems);

  const sections = [
    buildSection("✅ Taskuri", tasks, finalSettings),
    buildSection("📌 Evenimente", eventItems, finalSettings),
    buildSection("💳 Plati", payments, finalSettings),
    buildSection("🎂 Birthdays", birthdayItems, finalSettings),
  ].filter(Boolean);

  const hasItems = sections.length > 0;

  const prefix =
    isTest && finalSettings.testPrefix ? `[${finalSettings.testPrefix}] ` : "";

  const header = `${prefix}${finalSettings.messageTitle}`;

  const body = hasItems
    ? [
        header,
        "",
        `${finalSettings.tomorrowLabel} (${formatDateHuman(tomorrow)}):`,
        "",
        sections.join("\n\n"),
      ].join("\n")
    : [header, "", finalSettings.emptyMessage].join("\n");

  return {
    message: body,
    hasItems,
    tomorrow,
    today: baseToday,
    counts: {
      total: tomorrowItems.length + birthdayItems.length,
      tasks: tasks.length,
      events: eventItems.length,
      payments: payments.length,
      birthdays: birthdayItems.length,
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
