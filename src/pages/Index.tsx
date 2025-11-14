import { useState, useEffect } from "react";
import CalendarHeader from "@/components/CalendarHeader";
import CalendarGrid from "@/components/CalendarGrid";
import AddEventModal from "@/components/AddEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
}

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const handleAddEvent = (title: string, description: string) => {
    if (!selectedDate) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      description,
      date: formatDate(selectedDate),
    };

    setEvents([...events, newEvent]);
    setIsAddModalOpen(false);
    setSelectedDate(null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDate(date);
    return events.filter((event) => event.date === dateStr);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarGrid
          currentDate={currentDate}
          onDateClick={handleDateClick}
          getEventsForDate={getEventsForDate}
          onEventClick={handleEventClick}
        />
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        selectedDate={selectedDate}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDate(null);
        }}
        onAddEvent={handleAddEvent}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};

export default Index;
