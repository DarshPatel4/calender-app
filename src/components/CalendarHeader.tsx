import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-semibold text-foreground">
        <span id="monthTitle">{monthYear}</span>
      </h1>
      <div className="flex gap-2">
        <Button
          id="prevMonth"
          variant="outline"
          size="icon"
          className="rounded-full hover:bg-calendar-hover"
          onClick={onPrevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          id="nextMonth"
          variant="outline"
          size="icon"
          className="rounded-full hover:bg-calendar-hover"
          onClick={onNextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
