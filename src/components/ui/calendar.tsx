// This would be a simplified calendar component for date selection
// For a production app, you might want to use a more complete library
import React from 'react';

interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  mode?: 'single' | 'range';
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  mode = 'single'
}) => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-medium">{day}</div>
      ))}
      
      {Array.from({ length: firstDay }, (_, index) => (
        <div key={`empty-${index}`} className="h-8" />
      ))}
      
      {Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = new Date(year, month, day);
        const isSelected = selected && selected.getDate() === day && selected.getMonth() === month;
        
        return (
          <button
            key={day}
            onClick={() => onSelect(date)}
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};

export default Calendar;