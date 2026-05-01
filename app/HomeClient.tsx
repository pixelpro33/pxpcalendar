"use client";

import { useEffect, useMemo, useState } from "react";
import AddEventDrawer from "@/components/calendar/AddEventDrawer";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarList from "@/components/calendar/CalendarList";
import CalendarStats from "@/components/calendar/CalendarStats";
import ColorPickerModal from "@/components/calendar/ColorPickerModal";
import EventDetailsModal from "@/components/calendar/EventDetailsModal";
import RepeatModal from "@/components/calendar/RepeatModal";
import MonthlyDashboard from "@/components/calendar/MonthlyDashboard";
import {
  buildDraft,
  buildGroupedByDay,
  expandRecurringItemsForMonth,
  filterMonthItems,
  getDaysInMonth,
  getMonthPayTotals,
} from "@/components/calendar/utils";
import {
  CalendarItem,
  DraftEvent,
  EventType,
  FiltersState,
  RepeatType,
  RepeatUnit,
  ViewMode,
} from "@/components/calendar/types";

type Props = {
  version: string;
};

type DbOccurrence = {
  occurrence_date: string;
  status: "pending" | "completed";
  completed: boolean;
  payment_status: "none" | "unpaid" | "paid";
  actual_amount: number | null;
  completed_at: string | null;
};

type DbEvent = {
  id: string;
  title: string;
  details: string;
  type: EventType;
  event_at: string;
  all_day: boolean;
  status: "pending" | "completed";
  amount: number | null;
  actual_amount: number | null;
  payment_status: "none" | "unpaid" | "paid";
  category: string;
  address: string;
  custom_color: string;
  repeat_type: RepeatType;
  repeat_interval: number | null;
  repeat_unit: RepeatUnit | null;
  custom_repeat_config: {
    interval?: number;
    unit?: RepeatUnit;
    monthlyMode?: "same_day";
  } | null;
  completed_at: string | null;
  occurrences?: Record<string, DbOccurrence>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toOptionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toLocalCalendarItem(row: DbEvent): CalendarItem {
  const date = new Date(row.event_at);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  const repeat = row.repeat_type || "none";
  const completed = row.status === "completed";

  const occurrences: CalendarItem["occurrences"] = {};

  Object.entries(row.occurrences || {}).forEach(([key, occurrence]) => {
    occurrences[key] = {
      occurrenceDate: occurrence.occurrence_date || key,
      status: occurrence.status || "pending",
      completed: occurrence.status === "completed",
      paymentStatus: occurrence.payment_status || "none",
      actualAmount: toOptionalNumber(occurrence.actual_amount),
      completedAt: occurrence.completed_at || undefined,
    };
  });

  return {
    id: row.id,
    title: row.title,
    details: row.details || undefined,
    type: row.type || "event",
    date: `${year}-${month}-${day}`,
    time: row.all_day ? undefined : `${hour}:${minute}`,
    allDay: Boolean(row.all_day),
    completed,
    status: completed ? "completed" : "pending",
    repeat,
    customRepeat:
      repeat === "custom"
        ? {
            interval:
              row.custom_repeat_config?.interval || row.repeat_interval || 1,
            unit: row.custom_repeat_config?.unit || row.repeat_unit || "week",
            monthlyMode: row.custom_repeat_config?.monthlyMode || "same_day",
          }
        : undefined,
    amount: toOptionalNumber(row.amount),
    actualAmount: toOptionalNumber(row.actual_amount),
    paymentStatus: row.payment_status || "none",
    category: row.category || undefined,
    address: row.address || undefined,
    customColor: row.custom_color || undefined,
    completedAt: row.completed_at || undefined,
    occurrences,
  };
}

function draftToEventAt(draft: DraftEvent) {
  return `${draft.date}T${draft.allDay ? "00:00" : draft.time}:00`;
}

function draftToApiPayload(draft: DraftEvent) {
  const amount = draft.amount.trim() ? Number(draft.amount) : null;

  return {
    title: draft.title.trim(),
    details: draft.details.trim(),
    type: draft.type,
    eventAt: draftToEventAt(draft),
    allDay: draft.allDay,
    amount,
    category: draft.category.trim(),
    address: draft.address.trim(),
    customColor: draft.customColor.trim(),
    repeatType: draft.repeat,
    repeatInterval:
      draft.repeat === "custom" ? draft.customRepeat.interval : null,
    repeatUnit: draft.repeat === "custom" ? draft.customRepeat.unit : null,
    customRepeatConfig: draft.repeat === "custom" ? draft.customRepeat : null,
  };
}

function calendarItemToDraft(item: CalendarItem): DraftEvent {
  return {
    type: item.type,
    title: item.title,
    details: item.details || "",
    allDay: item.allDay,
    date: item.originalDate || item.date,
    time: item.time || "10:00",
    repeat: item.repeat,
    customRepeat: item.customRepeat || {
      interval: 1,
      unit: "week",
      monthlyMode: "same_day",
    },
    amount:
      typeof item.amount === "number"
        ? String(item.amount)
        : typeof item.actualAmount === "number"
          ? String(item.actualAmount)
          : "",
    category: item.category || "",
    address: item.address || "",
    customColor: item.customColor || "",
  };
}

function getBaseId(item: CalendarItem) {
  return item.baseId || item.id;
}

function occurrenceFromApi(
  occurrenceDate: string,
  occurrence: DbOccurrence,
): NonNullable<CalendarItem["occurrences"]>[string] {
  return {
    occurrenceDate,
    status: occurrence.status || "pending",
    completed: occurrence.status === "completed",
    paymentStatus: occurrence.payment_status || "none",
    actualAmount: toOptionalNumber(occurrence.actual_amount),
    completedAt: occurrence.completed_at || undefined,
  };
}

export default function HomeClient({ version }: Props) {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [filters, setFilters] = useState<FiltersState>({
    task: true,
    event: true,
    pay: true,
    birthday: true,
  });

  const [hideEmptyDays, setHideEmptyDays] = useState(false);

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);

  const [draft, setDraft] = useState<DraftEvent>(
    buildDraft(today.getFullYear(), today.getMonth()),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setIsLoadingEvents(true);
        setEventsError("");

        const response = await fetch("/api/events", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Nu am putut incarca evenimentele.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Raspuns invalid de la API.");
        }

        if (!cancelled) {
          setItems(data.map(toLocalCalendarItem));
        }
      } catch (error) {
        if (!cancelled) {
          setEventsError(
            error instanceof Error
              ? error.message
              : "Nu am putut incarca evenimentele.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );

  const years = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => today.getFullYear() - 2 + index),
    [today],
  );

  const expandedItems = useMemo(
    () => expandRecurringItemsForMonth(items, selectedYear, selectedMonth),
    [items, selectedYear, selectedMonth],
  );

  const monthItems = useMemo(
    () => filterMonthItems(expandedItems, selectedYear, selectedMonth, filters),
    [expandedItems, selectedYear, selectedMonth, filters],
  );

  const groupedByDay = useMemo(
    () => buildGroupedByDay(monthItems, daysInMonth),
    [monthItems, daysInMonth],
  );

  const totals = useMemo(() => getMonthPayTotals(monthItems), [monthItems]);

  function toggleFilter(type: EventType) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  function openAddDrawer() {
    setEditingItemId(null);
    setDraft(buildDraft(selectedYear, selectedMonth));
    setShowAddDrawer(true);
  }

  function openEditDrawer(item: CalendarItem) {
    const baseId = getBaseId(item);
    const baseItem = items.find((entry) => entry.id === baseId) || item;

    setEditingItemId(baseId);
    setDraft(calendarItemToDraft(baseItem));
    setSelectedItem(null);
    setShowAddDrawer(true);
  }

  async function saveDraftItem() {
    if (!draft.title.trim()) return;

    if (draft.type === "pay" && !draft.amount.trim()) {
      setEventsError("Pentru pay, suma este obligatorie.");
      return;
    }

    try {
      setEventsError("");

      const isEditMode = Boolean(editingItemId);

      const response = await fetch("/api/events", {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditMode ? { action: "update", id: editingItemId } : {}),
          ...draftToApiPayload(draft),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (isEditMode
              ? "Nu am putut actualiza evenimentul."
              : "Nu am putut salva evenimentul."),
        );
      }

      if (!data?.event) {
        throw new Error("API-ul nu a returnat evenimentul.");
      }

      const savedItem = toLocalCalendarItem(data.event);

      if (isEditMode) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingItemId ? savedItem : item)),
        );
      } else {
        setItems((prev) => [...prev, savedItem]);
      }

      setEditingItemId(null);
      setShowAddDrawer(false);
    } catch (error) {
      setEventsError(
        error instanceof Error
          ? error.message
          : "Nu am putut salva evenimentul.",
      );
    }
  }

  async function toggleComplete(itemId: string) {
    const selectedBaseId = selectedItem ? getBaseId(selectedItem) : itemId;
    const occurrenceDate = selectedItem?.occurrenceDate || selectedItem?.date;

    const currentItem =
      selectedItem || items.find((item) => item.id === selectedBaseId);

    if (!currentItem) return;

    const nextStatus =
      currentItem.status === "completed" ? "pending" : "completed";

    let actualAmount: number | null = null;

    if (
      nextStatus === "completed" &&
      currentItem.type === "event" &&
      typeof currentItem.amount !== "number"
    ) {
      const value = window.prompt(
        "Ce suma ai platit? Lasa gol daca nu exista suma.",
        "",
      );

      if (value !== null && value.trim()) {
        const parsed = Number(value);
        actualAmount = Number.isFinite(parsed) ? parsed : null;
      }
    }

    const previousItems = items;
    const previousSelected = selectedItem;

    function buildOccurrenceState(item: CalendarItem): CalendarItem {
      const hasMoney = item.type === "pay" || typeof item.amount === "number";

      return {
        ...item,
        completed: nextStatus === "completed",
        status: nextStatus,
        actualAmount:
          nextStatus === "completed" && actualAmount !== null
            ? actualAmount
            : nextStatus === "pending"
              ? undefined
              : item.actualAmount,
        paymentStatus:
          nextStatus === "completed"
            ? hasMoney || actualAmount !== null
              ? "paid"
              : "none"
            : hasMoney
              ? "unpaid"
              : "none",
        completedAt:
          nextStatus === "completed"
            ? item.completedAt || new Date().toISOString()
            : undefined,
      };
    }

    try {
      setEventsError("");

      setSelectedItem((prev) => {
        if (!prev) return prev;

        const prevBaseId = getBaseId(prev);

        if (prevBaseId !== selectedBaseId) {
          return prev;
        }

        return buildOccurrenceState(prev);
      });

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== selectedBaseId) return item;

          if (item.repeat === "none") {
            return buildOccurrenceState(item);
          }

          if (!occurrenceDate) return item;

          const updatedSelected = buildOccurrenceState({
            ...item,
            date: occurrenceDate,
          });

          return {
            ...item,
            occurrences: {
              ...(item.occurrences || {}),
              [occurrenceDate]: {
                occurrenceDate,
                status: updatedSelected.status,
                completed: updatedSelected.completed,
                paymentStatus: updatedSelected.paymentStatus,
                actualAmount: updatedSelected.actualAmount,
                completedAt: updatedSelected.completedAt,
              },
            },
          };
        }),
      );

      const response = await fetch("/api/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedBaseId,
          occurrenceDate,
          status: nextStatus,
          actualAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut actualiza evenimentul.");
      }

      if (data?.event) {
        const updatedItem = toLocalCalendarItem(data.event);

        setItems((prev) =>
          prev.map((item) => (item.id === selectedBaseId ? updatedItem : item)),
        );

        setSelectedItem((prev) => {
          if (!prev) return prev;

          const prevBaseId = getBaseId(prev);

          if (prevBaseId !== selectedBaseId) {
            return prev;
          }

          return {
            ...updatedItem,
            id: prev.id,
            baseId: prev.baseId,
            isOccurrence: prev.isOccurrence,
            originalDate: prev.originalDate,
            occurrenceDate: prev.occurrenceDate,
            date: prev.date,
          };
        });
      }

      if (data?.occurrence && occurrenceDate) {
        const occurrence = occurrenceFromApi(occurrenceDate, data.occurrence);

        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== selectedBaseId) return item;

            return {
              ...item,
              occurrences: {
                ...(item.occurrences || {}),
                [occurrenceDate]: occurrence,
              },
            };
          }),
        );

        setSelectedItem((prev) => {
          if (!prev) return prev;

          const prevBaseId = getBaseId(prev);

          if (prevBaseId !== selectedBaseId) {
            return prev;
          }

          return {
            ...prev,
            completed: occurrence.completed,
            status: occurrence.status,
            paymentStatus: occurrence.paymentStatus,
            actualAmount: occurrence.actualAmount,
            completedAt: occurrence.completedAt,
          };
        });
      }
    } catch (error) {
      setItems(previousItems);
      setSelectedItem(previousSelected);

      setEventsError(
        error instanceof Error
          ? error.message
          : "Nu am putut actualiza evenimentul.",
      );
    }
  }

  async function deleteItem(itemId: string) {
    const previousItems = items;

    try {
      setEventsError("");
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItem(null);

      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut sterge evenimentul.");
      }
    } catch (error) {
      setItems(previousItems);

      setEventsError(
        error instanceof Error
          ? error.message
          : "Nu am putut sterge evenimentul.",
      );
    }
  }

  return (
    <main className="pxp-shell">
      <div className="pxp-container">
        <CalendarHeader
          version={version}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          viewMode={viewMode}
          setViewMode={setViewMode}
          years={years}
        />

        <CalendarStats paid={totals.paid} remaining={totals.remaining} />

        <MonthlyDashboard items={monthItems} />

        <CalendarFilters
          filters={filters}
          onToggle={toggleFilter}
          hideEmptyDays={hideEmptyDays}
          setHideEmptyDays={setHideEmptyDays}
        />

        {isLoadingEvents && (
          <div className="pxp-inline-state">Se incarca evenimentele...</div>
        )}

        {eventsError && <div className="pxp-inline-error">{eventsError}</div>}

        {viewMode === "grid" ? (
          <CalendarGrid
            daysInMonth={daysInMonth}
            groupedByDay={groupedByDay}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectItem={setSelectedItem}
          />
        ) : (
          <CalendarList
            daysInMonth={daysInMonth}
            groupedByDay={groupedByDay}
            selectedMonthLabel={String(selectedMonth + 1)}
            selectedYear={selectedYear}
            hideEmptyDays={hideEmptyDays}
            onSelectItem={setSelectedItem}
          />
        )}
      </div>

      <button
        className="pxp-fab"
        onClick={openAddDrawer}
        aria-label="Add event"
        type="button"
      >
        +
      </button>

      <AddEventDrawer
        open={showAddDrawer}
        draft={draft}
        setDraft={setDraft}
        onClose={() => {
          setEditingItemId(null);
          setShowAddDrawer(false);
        }}
        onSave={saveDraftItem}
        onOpenRepeat={() => setShowRepeatModal(true)}
        onOpenColor={() => setShowColorModal(true)}
        mode={editingItemId ? "edit" : "add"}
      />

      <RepeatModal
        open={showRepeatModal}
        repeat={draft.repeat}
        setRepeat={(value) => setDraft({ ...draft, repeat: value })}
        customRepeat={draft.customRepeat}
        setCustomRepeat={(value) => setDraft({ ...draft, customRepeat: value })}
        onClose={() => setShowRepeatModal(false)}
      />

      <ColorPickerModal
        open={showColorModal}
        value={draft.customColor}
        setValue={(value) => setDraft({ ...draft, customColor: value })}
        onClose={() => setShowColorModal(false)}
      />

      <EventDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onToggleComplete={toggleComplete}
        onDelete={deleteItem}
        onEdit={openEditDrawer}
      />
    </main>
  );
}
