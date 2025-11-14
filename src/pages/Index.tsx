import { useState, useEffect, useCallback } from "react";
import { Menu, Search, CircleUserRound } from "lucide-react";
import CalendarHeader from "@/components/CalendarHeader";
import CalendarGrid from "@/components/CalendarGrid";
import AddEventModal from "@/components/AddEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";
import { supabase } from "@/lib/supabaseClient";
import CalendarSidebar from "@/components/CalendarSidebar";
import { Input } from "@/components/ui/input";
import AddTaskModal from "@/components/AddTaskModal";
import AppointmentScheduleModal from "@/components/AppointmentScheduleModal";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  meetingLink?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  notes: string;
}

export interface AppointmentSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
}

type SupabaseBookingRow = {
  id: string;
  product_name: string | null;
  summary: string | null;
  booking_time: string;
  meet_link: string | null;
};

const normalizeEvents = (rows: SupabaseBookingRow[]): CalendarEvent[] =>
  rows.map((row) => {
    // Extract date from booking_time (TIMESTAMPTZ format)
    const bookingDate = row.booking_time ? new Date(row.booking_time) : new Date();
    // Format date as YYYY-MM-DD
    const year = bookingDate.getFullYear();
    const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
    const day = String(bookingDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    return {
      id: row.id,
      title: row.product_name ?? "",
      description: row.summary ?? "",
      date: dateStr,
      meetingLink: row.meet_link ?? "",
    };
  });

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSchedule[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const formatDate = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const loadEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, product_name, summary, booking_time, meet_link")
      .order("booking_time", { ascending: true });

    if (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events", {
        description: error.message || "Please check your connection and try again.",
      });
      setEvents([]);
      return [];
    }

    const normalized = data ? normalizeEvents(data) : [];
    setEvents(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const openEventModal = (date: Date) => {
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    openEventModal(date);
  };

  const handleSidebarDateSelect = (date: Date) => {
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  const handleCreateAction = (type: "event" | "task" | "appointment") => {
    if (type === "event") {
      openEventModal(currentDate);
      return;
    }
    if (type === "task") {
      setIsTaskModalOpen(true);
      return;
    }
    setIsAppointmentModalOpen(true);
  };

  const saveEvent = useCallback(
    async (title: string, description: string, date: string): Promise<CalendarEvent | null> => {
      const meetingInput =
        typeof document !== "undefined"
          ? (document.getElementById("eventMeetingLink") as HTMLInputElement | null)
          : null;
      const meetingLink = meetingInput?.value?.trim() ?? "";

      // Convert date string (YYYY-MM-DD) to TIMESTAMPTZ format
      // Append time 00:00:00 and timezone to make it a proper timestamp
      const bookingTime = `${date}T00:00:00Z`;

      setIsSavingEvent(true);
      
      try {
        const { data, error } = await supabase
          .from("bookings")
          .insert({ 
            product_name: title, 
            summary: description, 
            booking_time: bookingTime, 
            meet_link: meetingLink || null 
          })
          .select()
          .single();

        setIsSavingEvent(false);

        if (error) {
          console.error("Failed to save event:", error);
          
          // Provide user-friendly error messages
          let errorMessage = "Failed to save event. ";
          if (error.code === "42501" || error.message.includes("permission") || error.message.includes("policy")) {
            errorMessage += "Permission denied. Please check your Supabase Row Level Security (RLS) policies.";
          } else if (error.code === "PGRST116" || error.message.includes("JWT")) {
            errorMessage += "Authentication error. Please check your Supabase credentials.";
          } else if (error.message.includes("network") || error.message.includes("fetch")) {
            errorMessage += "Network error. Please check your internet connection.";
          } else {
            errorMessage += error.message || "Unknown error occurred.";
          }
          
          toast.error("Error Saving Event", {
            description: errorMessage,
            duration: 5000,
          });
          return null;
        }

        if (!data) {
          toast.error("Error Saving Event", {
            description: "No data returned from server.",
          });
          return null;
        }

        const normalized = normalizeEvents([data as SupabaseBookingRow])[0];
        setEvents((prev) => [...prev, normalized]);
        toast.success("Event saved successfully!");
        return normalized;
      } catch (err) {
        setIsSavingEvent(false);
        console.error("Unexpected error saving event:", err);
        toast.error("Error Saving Event", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
        return null;
      }
    },
    []
  );

  const handleAddEvent = async (title: string, description: string) => {
    if (!selectedDate) {
      toast.error("No date selected", {
        description: "Please select a date for the event.",
      });
      return;
    }
    const dateString = formatDate(selectedDate);
    const newEvent = await saveEvent(title, description, dateString);
    if (newEvent) {
      setIsAddModalOpen(false);
      setSelectedDate(null);
    }
    // Error handling is done in saveEvent, so we don't need to show another error here
  };

  const renderEvents = useCallback(
    (date: Date): CalendarEvent[] => {
      const dateStr = formatDate(date);
      return events.filter((event) => event.date === dateStr);
    },
    [events, formatDate]
  );

  const showEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleAddTask = (title: string, dueDate: string, notes: string) => {
    setTasks((prev) => [...prev, { id: generateId(), title, dueDate, notes }]);
    setIsTaskModalOpen(false);
  };

  const handleAddAppointment = (
    title: string,
    date: string,
    time: string,
    duration: string,
    location: string,
    notes: string
  ) => {
    setAppointments((prev) => [
      ...prev,
      { id: generateId(), title, date, time, duration, location, notes },
    ]);
    setIsAppointmentModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-[#e0e3eb] bg-white px-4 py-3 shadow-sm md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-full p-2 text-[#5f6368] hover:bg-[#f1f3f4]"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d2d6e3] bg-white text-lg font-semibold text-[#1a73e8]">
                14
              </div>
              <span className="text-xl font-semibold text-[#5f6368]">Calendar</span>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-[#d2d6e3] bg-[#f1f3f4] px-4 py-2 text-sm text-[#5f6368] md:flex">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search people and events"
              className="h-auto border-none bg-transparent p-0 text-sm placeholder:text-[#5f6368] focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden rounded-full border border-[#d2d6e3] px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] md:inline-flex"
            >
              Support
            </button>
            <CircleUserRound className="h-9 w-9 text-[#5f6368]" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <CalendarSidebar
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            appointments={appointments}
            onSelectDate={handleSidebarDateSelect}
            onCreate={handleCreateAction}
          />

          <main className="flex-1 min-w-0 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
            <CalendarGrid
              currentDate={currentDate}
              onDateClick={handleDateClick}
              renderEvents={renderEvents}
              onEventClick={showEventDetails}
            />
          </main>
        </div>
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        selectedDate={selectedDate}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDate(null);
        }}
        onAddEvent={handleAddEvent}
        isSaving={isSavingEvent}
      />

      <AddTaskModal
        isOpen={isTaskModalOpen}
        selectedDate={currentDate}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <AppointmentScheduleModal
        isOpen={isAppointmentModalOpen}
        selectedDate={currentDate}
        onClose={() => setIsAppointmentModalOpen(false)}
        onAddAppointment={handleAddAppointment}
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
