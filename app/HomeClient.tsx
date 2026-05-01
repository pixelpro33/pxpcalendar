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
import {
  buildDraft,
  buildGroupedByDay,
  createItemFromDraft,
  filterMonthItems,
  getDaysInMonth,
  getMonthPayTotals,
} from "@/components/calendar/utils";
import {
  CalendarItem,
  DraftEvent,
  EventType,
  FiltersState,
  ViewMode,
} from "@/components/calendar/types";

type Props = {
  version: string;
};

type DbEvent = {
  id: string;
  title: string;
  event_at: string;
  created_at: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalCalendarItem(row: DbEvent): CalendarItem {
  const date = new Date(row.event_at);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return {
    id: row.id,
    title: row.title,
    type: "event",
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    allDay: false,
    completed: false,
    repeat: "none",
  };
}

function draftToEventAt(draft: DraftEvent) {
  return `${draft.date}T${draft.allDay ? "00:00" : draft.time}:00`;
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

  const years = Array.from(
    { length: 7 },
    (_, index) => today.getFullYear() - 2 + index,
  );

  const monthItems = useMemo(
    () => filterMonthItems(items, selectedYear, selectedMonth, filters),
    [items, selectedYear, selectedMonth, filters],
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
    setDraft(buildDraft(selectedYear, selectedMonth));
    setShowAddDrawer(true);
  }

  async function saveDraftItem() {
    if (!draft.title.trim()) return;

    try {
      setEventsError("");

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title.trim(),
          eventAt: draftToEventAt(draft),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut salva evenimentul.");
      }

      if (data?.event) {
        setItems((prev) => [...prev, toLocalCalendarItem(data.event)]);
      } else {
        const fallbackItem = createItemFromDraft(draft);
        setItems((prev) => [...prev, fallbackItem]);
      }

      setShowAddDrawer(false);
    } catch (error) {
      setEventsError(
        error instanceof Error
          ? error.message
          : "Nu am putut salva evenimentul.",
      );
    }
  }

  function toggleComplete(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    );

    setSelectedItem((prev) =>
      prev && prev.id === itemId
        ? { ...prev, completed: !prev.completed }
        : prev,
    );
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
      >
        +
      </button>

      <AddEventDrawer
        open={showAddDrawer}
        draft={draft}
        setDraft={setDraft}
        onClose={() => setShowAddDrawer(false)}
        onSave={saveDraftItem}
        onOpenRepeat={() => setShowRepeatModal(true)}
        onOpenColor={() => setShowColorModal(true)}
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
      />
    </main>
  );
}
