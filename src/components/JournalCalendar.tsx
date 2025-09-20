import React from 'react';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';

interface JournalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  entries: { [key: string]: any };
}

const JournalCalendar: React.FC<JournalCalendarProps> = ({
  selectedDate,
  onDateSelect,
  entries
}) => {
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const weeks = [];
  let week = [];
  
  // Fill first week with empty days
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }
  
  // Fill the rest
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  
  // Fill last week with empty days
  while (week.length < 7) {
    week.push(null);
  }
  weeks.push(week);
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {weeks.map((week, weekIndex) => (
        <React.Fragment key={weekIndex}>
          {week.map((date, dayIndex) => (
            <div
              key={dayIndex}
              className={`p-2 text-center cursor-pointer ${
                date 
                  ? entries[format(date, 'yyyy-MM-dd')] 
                    ? 'bg-green-100' 
                    : 'hover:bg-gray-100'
                  : ''
              }`}
              onClick={() => date && onDateSelect(date)}
            >
              {date ? date.getDate() : ''}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default JournalCalendar;