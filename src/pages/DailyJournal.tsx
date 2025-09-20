import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Rating from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
  rating: number;
}

const DailyJournal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry }>({});
  const [currentContent, setCurrentContent] = useState('');
  const [currentRating, setCurrentRating] = useState(0);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('journal-entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to load journal entries from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const entry = entries[dateKey];
    setCurrentContent(entry?.content || '');
    setCurrentRating(entry?.rating || 0);
  }, [selectedDate, entries]);

  const handleSaveEntry = () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newEntry: JournalEntry = {
      date: dateKey,
      content: currentContent,
      rating: currentRating,
    };
    
    const updatedEntries = { ...entries, [dateKey]: newEntry };
    setEntries(updatedEntries);
    
    try {
      localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Failed to save journal entry to local storage", error);
    }
  };

  const daysWithEntries = Object.keys(entries).map(dateStr => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Diario Psicologico</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{ hasEntry: daysWithEntries }}
                modifiersStyles={{ hasEntry: { textDecoration: 'underline', textDecorationColor: '#3b82f6', fontWeight: 'bold' } }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Voce del Diario - {selectedDate ? format(selectedDate, 'PPP') : 'Seleziona una data'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label htmlFor="journal-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Come ti senti oggi?
                  </label>
                  <Textarea
                    id="journal-content"
                    placeholder="Scrivi qui i tuoi pensieri..."
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    className="min-h-[250px] text-base"
                    disabled={!selectedDate}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Valuta la tua giornata:</h3>
                  <Rating
                    value={currentRating}
                    onValueChange={setCurrentRating}
                    max={5}
                    size="lg"
                  />
                </div>

                <Button 
                  onClick={handleSaveEntry} 
                  className="w-full text-lg py-6"
                  disabled={!selectedDate}
                >
                  Salva Voce
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyJournal;