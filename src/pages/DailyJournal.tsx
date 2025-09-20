import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating } from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, addDays, formatISO } from 'date-fns';

interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

const DailyJournal = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry }>({});
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('journal-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    // Load current entry for selected date
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const entry = entries[dateKey];
    setCurrentEntry(entry || { date: dateKey, content: '', rating: undefined });
  }, [selectedDate, entries]);

  const handleSaveEntry = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newEntry = {
      ...currentEntry,
      date: dateKey,
      updatedAt: new Date().toISOString()
    } as JournalEntry;
    
    const updatedEntries = { ...entries, [dateKey]: newEntry };
    setEntries(updatedEntries);
    setCurrentEntry(newEntry);
    
    // Save to localStorage
    localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
  };

  const handleTextChange = (content: string) => {
    setCurrentEntry(prev => ({ ...prev, content }));
  };

  const handleRatingChange = (rating: number) => {
    setCurrentEntry(prev => ({ ...prev, rating }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Daily Journal</h1>
        <p>Selected Date: {format(selectedDate, 'yyyy-MM-dd')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                className="border rounded-md"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Journal Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write about your day..."
                value={currentEntry.content || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[200px]"
              />
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Rate your day:</h3>
                <Rating
                  value={currentEntry.rating || 0}
                  onValueChange={handleRatingChange}
                  max={5}
                />
              </div>

              <Button 
                onClick={handleSaveEntry} 
                className="mt-4 w-full"
              >
                Save Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyJournal;