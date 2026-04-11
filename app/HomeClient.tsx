"use client";

import { useMemo, useState } from "react";
import AddEventDrawer from "@/components/calendar/AddEventDrawer";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarList from "@/components/calendar/CalendarList";
import CalendarStats from "@/components/calendar/CalendarStats";
import ColorPickerModal from "@/components/calendar/ColorPickerModal";
import EventDetailsModal from "@/components/calendar/EventDetailsModal";
import RepeatModal from "@/components/calendar/RepeatModal";
import { INITIAL_ITEMS, MONTHS } from "@/components/calendar/mockData";
import {
  buildDraft,
  buildGroupedByDay,
  createItemFromDraft,
  filterMonthItems,
  getDaysInMonth,
  getMonthPayTotals,
} from "@/components/calendar/utils";
import { CalendarItem, DraftEvent, EventType, FiltersState, ViewMode } from "@/components/calendar/types";

type Props = {
  version: string;
};

export default function HomeClient({ version }: Props) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<CalendarItem[]>(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

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

  const [draft, setDraft] = useState<DraftEvent>(buildDraft(today.getFullYear(), today.getMonth()));

  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const years = Array.from({ length: 7 }, (_, index) => today.getFullYear() - 2 + index);

  const monthItems = useMemo(
    () => filterMonthItems(items, selectedYear, selectedMonth, filters),
    [items, selectedYear, selectedMonth, filters]
  );

  const groupedByDay = useMemo(
    () => buildGroupedByDay(monthItems, daysInMonth),
    [monthItems, daysInMonth]
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

  function saveDraftItem() {
    if (!draft.title.trim()) return;

    const newItem = createItemFromDraft(draft);
    setItems((prev) => [...prev, newItem]);
    setShowAddDrawer(false);
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

  function deleteItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItem(null);
  }

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

        {viewMode === "grid" ? (
          <CalendarGrid
            daysInMonth={daysInMonth}
            groupedByDay={groupedByDay}
            onSelectItem={setSelectedItem}
          />
        ) : (
          <CalendarList
            daysInMonth={daysInMonth}
            groupedByDay={groupedByDay}
            selectedMonthLabel={MONTHS[selectedMonth]}
            selectedYear={selectedYear}
            hideEmptyDays={hideEmptyDays}
            onSelectItem={setSelectedItem}
          />
        )}
      </div>

      <button
        onClick={openAddDrawer}
        style={{
          position: "fixed",
          right: 22,
          bottom: 22,
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(180deg, rgba(59,130,246,1), rgba(37,99,235,1))",
          color: "white",
          fontSize: 34,
          cursor: "pointer",
          boxShadow: "0 22px 40px rgba(37,99,235,0.35)",
          zIndex: 20,
        }}
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