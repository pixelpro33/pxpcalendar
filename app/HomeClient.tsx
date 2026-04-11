"use client";

import { useMemo, useState } from "react";

type EventType = "task" | "event" | "pay" | "birthday";
type ViewMode = "grid" | "list";
type RepeatType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

type CalendarItem = {
  id: string;
  title: string;
  details?: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  allDay: boolean;
  completed: boolean;
  repeat: RepeatType;
  amount?: number;
  customColor?: string;
  address?: string;
};

type Props = {
  version: string;
};

const MONTHS = [
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

const WEEKDAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

const TYPE_CONFIG: Record<
  EventType,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
  }
> = {
  task: {
    label: "Task",
    color: "#c7d2fe",
    bg: "rgba(99,102,241,0.22)",
    border: "rgba(99,102,241,0.42)",
    icon: "✓",
  },
  event: {
    label: "Event",
    color: "#bbf7d0",
    bg: "rgba(34,197,94,0.20)",
    border: "rgba(34,197,94,0.38)",
    icon: "📍",
  },
  pay: {
    label: "Pay",
    color: "#fecaca",
    bg: "rgba(239,68,68,0.20)",
    border: "rgba(239,68,68,0.38)",
    icon: "💰",
  },
  birthday: {
    label: "Birthday",
    color: "#e9d5ff",
    bg: "rgba(168,85,247,0.22)",
    border: "rgba(168,85,247,0.40)",
    icon: "🎂",
  },
};

const INITIAL_ITEMS: CalendarItem[] = [
  {
    id: "1",
    title: "Spalat masina",
    type: "task",
    date: "2026-04-11",
    time: "10:00",
    allDay: false,
    completed: false,
    repeat: "none",
    details: "Exterior + interior",
  },
  {
    id: "2",
    title: "Tuns",
    type: "event",
    date: "2026-04-12",
    time: "13:00",
    allDay: false,
    completed: false,
    repeat: "monthly",
    details: "Salon centru",
    address: "Brasov, centru",
    amount: 100,
  },
  {
    id: "3",
    title: "Pixieset",
    type: "pay",
    date: "2026-04-14",
    allDay: true,
    completed: false,
    repeat: "monthly",
    amount: 220,
    details: "Abonament lunar",
  },
  {
    id: "4",
    title: "Ziua lui Andrei",
    type: "birthday",
    date: "2026-04-20",
    allDay: true,
    completed: false,
    repeat: "yearly",
    details: "Reminder cu cateva zile inainte",
  },
  {
    id: "5",
    title: "Cumparaturi",
    type: "task",
    date: "2026-04-12",
    allDay: true,
    completed: true,
    repeat: "weekly",
    details: "Apa, cafea, detergent",
  },
  {
    id: "6",
    title: "Dentist",
    type: "event",
    date: "2026-04-22",
    time: "16:30",
    allDay: false,
    completed: false,
    repeat: "none",
    details: "Control + posibil cost variabil",
    address: "Clinica Smile",
  },
  {
    id: "7",
    title: "Vodafone",
    type: "pay",
    date: "2026-04-15",
    allDay: true,
    completed: true,
    repeat: "monthly",
    amount: 44,
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDisplayDate(item: CalendarItem) {
  const date = new Date(`${item.date}T${item.allDay ? "00:00" : item.time || "00:00"}`);
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMonthName(monthIndex: number) {
  return MONTHS[monthIndex];
}

function getEventChipStyle(item: CalendarItem) {
  const typeCfg = TYPE_CONFIG[item.type];
  const bg = item.customColor || typeCfg.bg;
  const border = item.customColor ? item.customColor : typeCfg.border;

  return {
    background: bg,
    border: `1px solid ${border}`,
    color: typeCfg.color,
    opacity: item.completed ? 0.45 : 1,
    textDecoration: item.completed ? "line-through" : "none",
  };
}

function EventChip({
  item,
  onClick,
  compact = false,
}: {
  item: CalendarItem;
  onClick: () => void;
  compact?: boolean;
}) {
  const typeCfg = TYPE_CONFIG[item.type];
  const style = getEventChipStyle(item);

  return (
    <button
      onClick={onClick}
      style={{
        ...style,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 10,
        padding: compact ? "4px 7px" : "8px 10px",
        fontSize: compact ? 11 : 13,
        lineHeight: 1.2,
        cursor: "pointer",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        backgroundClip: "padding-box",
      }}
    >
      <span style={{ flexShrink: 0 }}>{typeCfg.icon}</span>
      {!item.allDay && item.time && (
        <span style={{ opacity: 0.85, flexShrink: 0 }}>{item.time}</span>
      )}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
        }}
      >
        {item.title}
      </span>
    </button>
  );
}

function TypeBadge({ type }: { type: EventType }) {
  const cfg = TYPE_CONFIG[type];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 10px",
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        opacity: 0.55,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function HomeClient({ version }: Props) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<CalendarItem[]>(INITIAL_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<EventType, boolean>>({
    task: true,
    event: true,
    pay: true,
    birthday: true,
  });

  const [draftType, setDraftType] = useState<EventType>("task");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetails, setDraftDetails] = useState("");
  const [draftAllDay, setDraftAllDay] = useState(false);
  const [draftDate, setDraftDate] = useState(toDateString(selectedYear, selectedMonth, 1));
  const [draftTime, setDraftTime] = useState("10:00");
  const [draftRepeat, setDraftRepeat] = useState<RepeatType>("none");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftAddress, setDraftAddress] = useState("");
  const [draftColor, setDraftColor] = useState("");

  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const monthItems = useMemo(() => {
    return items.filter((item) => {
      const [y, m] = item.date.split("-").map(Number);
      return (
        y === selectedYear &&
        m === selectedMonth + 1 &&
        activeFilters[item.type]
      );
    });
  }, [items, selectedYear, selectedMonth, activeFilters]);

  const groupedByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();

    for (let day = 1; day <= daysInMonth; day++) {
      map.set(day, []);
    }

    monthItems.forEach((item) => {
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
  }, [monthItems, daysInMonth]);

  const totals = useMemo(() => {
    const pays = monthItems.filter((i) => i.type === "pay");
    const paid = pays
      .filter((i) => i.completed)
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    const remaining = pays
      .filter((i) => !i.completed)
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    return { paid, remaining };
  }, [monthItems]);

  function resetDraft() {
    setDraftType("task");
    setDraftTitle("");
    setDraftDetails("");
    setDraftAllDay(false);
    setDraftDate(toDateString(selectedYear, selectedMonth, 1));
    setDraftTime("10:00");
    setDraftRepeat("none");
    setDraftAmount("");
    setDraftAddress("");
    setDraftColor("");
  }

  function toggleFilter(type: EventType) {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  function createMockEvent() {
    if (!draftTitle.trim()) return;

    const newItem: CalendarItem = {
      id: crypto.randomUUID(),
      title: draftTitle.trim(),
      details: draftDetails.trim() || undefined,
      type: draftType,
      date: draftDate,
      time: draftAllDay ? undefined : draftTime,
      allDay: draftAllDay,
      completed: false,
      repeat: draftRepeat,
      amount:
        draftType === "pay" || draftAmount.trim()
          ? Number(draftAmount || 0)
          : undefined,
      address: draftAddress.trim() || undefined,
      customColor: draftColor.trim() || undefined,
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddModal(false);
    resetDraft();
  }

  function toggleComplete(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );

    setSelectedItem((prev) =>
      prev && prev.id === itemId ? { ...prev, completed: !prev.completed } : prev
    );
  }

  function deleteMockItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItem(null);
  }

  const years = Array.from({ length: 7 }, (_, index) => today.getFullYear() - 2 + index);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(90,110,255,0.12), transparent 28%), #09090d",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "18px 14px 24px",
        }}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: -1,
                }}
              >
                pxpcalendar
              </div>
              <div style={{ opacity: 0.6, marginTop: 4 }}>
                iOS dark UI preview · v{version}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "white",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                {years.map((year) => (
                  <option key={year} value={year} style={{ color: "black" }}>
                    {year}
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 4,
                  gap: 4,
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 14px",
                    background: viewMode === "grid" ? "#1d4ed8" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 14px",
                    background: viewMode === "list" ? "#1d4ed8" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {MONTHS.map((month, index) => {
              const active = index === selectedMonth;

              return (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(index)}
                  style={{
                    border: active
                      ? "1px solid rgba(96,165,250,0.6)"
                      : "1px solid rgba(255,255,255,0.09)",
                    background: active
                      ? "rgba(59,130,246,0.22)"
                      : "rgba(255,255,255,0.04)",
                    color: active ? "#dbeafe" : "rgba(255,255,255,0.88)",
                    borderRadius: 16,
                    padding: "12px 18px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    minWidth: 76,
                  }}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const active = activeFilters[type];

              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  style={{
                    border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.08)"}`,
                    background: active ? cfg.bg : "rgba(255,255,255,0.04)",
                    color: active ? cfg.color : "rgba(255,255,255,0.7)",
                    borderRadius: 999,
                    padding: "9px 13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: selectedItem ? "grid" : "block",
            gridTemplateColumns: selectedItem ? "minmax(0, 1fr) 360px" : "1fr",
            gap: 18,
          }}
        >
          <div>
            {viewMode === "grid" ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      style={{
                        padding: "14px 12px",
                        fontSize: 13,
                        opacity: 0.65,
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    const dayItems = groupedByDay.get(day) || [];

                    return (
                      <div
                        key={day}
                        style={{
                          minHeight: 150,
                          borderRight:
                            day % 7 !== 0
                              ? "1px solid rgba(255,255,255,0.06)"
                              : "none",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          padding: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            opacity: 0.92,
                            marginBottom: 4,
                          }}
                        >
                          {day}
                        </div>

                        {dayItems.slice(0, 3).map((item) => (
                          <EventChip
                            key={item.id}
                            item={item}
                            compact
                            onClick={() => setSelectedItem(item)}
                          />
                        ))}

                        {dayItems.length > 3 && (
                          <button
                            onClick={() => setSelectedItem(dayItems[0])}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "rgba(255,255,255,0.5)",
                              fontSize: 11,
                              textAlign: "left",
                              padding: "2px 4px",
                              cursor: "pointer",
                            }}
                          >
                            +{dayItems.length - 3} more
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const dayItems = groupedByDay.get(day) || [];
                  const dateLabel = `${pad(day)} ${getMonthName(selectedMonth)} ${selectedYear}`;

                  return (
                    <div
                      key={day}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 22,
                        padding: 16,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 18 }}>
                          {dateLabel}
                        </div>
                        <div style={{ opacity: 0.5, fontSize: 13 }}>
                          {dayItems.length} item{dayItems.length === 1 ? "" : "s"}
                        </div>
                      </div>

                      {dayItems.length === 0 ? (
                        <div style={{ opacity: 0.35, fontSize: 14 }}>
                          Fara evenimente
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {dayItems.map((item) => (
                            <EventChip
                              key={item.id}
                              item={item}
                              onClick={() => setSelectedItem(item)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                <SectionTitle>Platit deja</SectionTitle>
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  {totals.paid} lei
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                <SectionTitle>Mai ai de platit</SectionTitle>
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  {totals.remaining} lei
                </div>
              </div>
            </div>
          </div>

          {selectedItem && (
            <aside
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 18,
                height: "fit-content",
                position: "sticky",
                top: 18,
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 16,
                  alignItems: "start",
                }}
              >
                <div>
                  <SectionTitle>Detalii</SectionTitle>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      opacity: selectedItem.completed ? 0.55 : 1,
                      textDecoration: selectedItem.completed ? "line-through" : "none",
                    }}
                  >
                    {selectedItem.title}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    borderRadius: 12,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <TypeBadge type={selectedItem.type} />
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div>
                  <SectionTitle>Data</SectionTitle>
                  <div style={{ fontSize: 15 }}>{formatDisplayDate(selectedItem)}</div>
                </div>

                <div>
                  <SectionTitle>Status</SectionTitle>
                  <div style={{ fontSize: 15 }}>
                    {selectedItem.completed ? "Completed" : "Pending"}
                  </div>
                </div>

                <div>
                  <SectionTitle>All day</SectionTitle>
                  <div style={{ fontSize: 15 }}>{selectedItem.allDay ? "Da" : "Nu"}</div>
                </div>

                <div>
                  <SectionTitle>Repeat</SectionTitle>
                  <div style={{ fontSize: 15 }}>{selectedItem.repeat}</div>
                </div>

                {typeof selectedItem.amount === "number" && (
                  <div>
                    <SectionTitle>Suma</SectionTitle>
                    <div style={{ fontSize: 15 }}>{selectedItem.amount} lei</div>
                  </div>
                )}

                {selectedItem.address && (
                  <div>
                    <SectionTitle>Adresa</SectionTitle>
                    <div style={{ fontSize: 15 }}>{selectedItem.address}</div>
                  </div>
                )}

                {selectedItem.details && (
                  <div>
                    <SectionTitle>Detalii</SectionTitle>
                    <div style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.86 }}>
                      {selectedItem.details}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <button
                  onClick={() => toggleComplete(selectedItem.id)}
                  style={{
                    border: "none",
                    borderRadius: 14,
                    padding: "13px 14px",
                    background: selectedItem.completed ? "#f59e0b" : "#22c55e",
                    color: "#08110b",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {selectedItem.completed ? "Mark pending" : "Mark completed"}
                </button>

                <button
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "13px 14px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteMockItem(selectedItem.id)}
                  style={{
                    border: "1px solid rgba(239,68,68,0.35)",
                    borderRadius: 14,
                    padding: "13px 14px",
                    background: "rgba(239,68,68,0.16)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: "fixed",
          right: 22,
          bottom: 22,
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "none",
          background:
            "linear-gradient(180deg, rgba(59,130,246,1), rgba(37,99,235,1))",
          color: "white",
          fontSize: 34,
          cursor: "pointer",
          boxShadow: "0 22px 40px rgba(37,99,235,0.35)",
        }}
      >
        +
      </button>

      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#111218",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 28,
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 18,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                position: "sticky",
                top: 0,
                background: "#111218",
                zIndex: 2,
              }}
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetDraft();
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#93c5fd",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={createMockEvent}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#93c5fd",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Save
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Add title"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: 44,
                  lineHeight: 1.05,
                  outline: "none",
                  marginBottom: 18,
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const active = draftType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setDraftType(type)}
                      style={{
                        border: `1px solid ${
                          active ? cfg.border : "rgba(255,255,255,0.12)"
                        }`,
                        background: active ? cfg.bg : "rgba(255,255,255,0.04)",
                        color: active ? cfg.color : "white",
                        borderRadius: 14,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <SectionTitle>Details</SectionTitle>
                  <textarea
                    value={draftDetails}
                    onChange={(e) => setDraftDetails(e.target.value)}
                    placeholder="Add details"
                    rows={3}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "white",
                      fontSize: 16,
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 650, marginBottom: 4 }}>All day</div>
                    <div style={{ opacity: 0.6, fontSize: 14 }}>
                      Daca e o zi intreaga, fara ora fixa
                    </div>
                  </div>

                  <button
                    onClick={() => setDraftAllDay((prev) => !prev)}
                    style={{
                      width: 66,
                      height: 36,
                      borderRadius: 999,
                      border: "none",
                      background: draftAllDay ? "#2563eb" : "rgba(255,255,255,0.12)",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 4,
                        left: draftAllDay ? 34 : 4,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "white",
                        transition: "all 0.18s ease",
                      }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <SectionTitle>Date & time</SectionTitle>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: draftAllDay ? "1fr" : "1fr 160px",
                      gap: 10,
                    }}
                  >
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14,
                        color: "white",
                        padding: 14,
                        fontSize: 15,
                        outline: "none",
                      }}
                    />

                    {!draftAllDay && (
                      <input
                        type="time"
                        value={draftTime}
                        onChange={(e) => setDraftTime(e.target.value)}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          color: "white",
                          padding: 14,
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <SectionTitle>Repeat</SectionTitle>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {[
                      { value: "none", label: "Does not repeat" },
                      { value: "daily", label: "Every day" },
                      { value: "weekly", label: "Every week" },
                      { value: "monthly", label: "Every month" },
                      { value: "yearly", label: "Every year" },
                      { value: "custom", label: "Custom" },
                    ].map((option) => {
                      const active = draftRepeat === option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => setDraftRepeat(option.value as RepeatType)}
                          style={{
                            border: `1px solid ${
                              active
                                ? "rgba(96,165,250,0.45)"
                                : "rgba(255,255,255,0.08)"
                            }`,
                            background: active
                              ? "rgba(59,130,246,0.22)"
                              : "rgba(255,255,255,0.03)",
                            color: "white",
                            borderRadius: 14,
                            padding: "12px 14px",
                            cursor: "pointer",
                            textAlign: "left",
                            minHeight: 54,
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(draftType === "pay" || draftType === "event") && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <SectionTitle>Suma (lei)</SectionTitle>
                    <input
                      type="number"
                      value={draftAmount}
                      onChange={(e) => setDraftAmount(e.target.value)}
                      placeholder="Ex: 220"
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14,
                        color: "white",
                        padding: 14,
                        fontSize: 15,
                        outline: "none",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <SectionTitle>Adresa</SectionTitle>
                  <input
                    value={draftAddress}
                    onChange={(e) => setDraftAddress(e.target.value)}
                    placeholder="Optional"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      color: "white",
                      padding: 14,
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <SectionTitle>Custom color</SectionTitle>
                  <input
                    value={draftColor}
                    onChange={(e) => setDraftColor(e.target.value)}
                    placeholder="Ex: rgba(255, 140, 0, 0.28)"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      color: "white",
                      padding: 14,
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}