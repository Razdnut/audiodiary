import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Rating from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Settings as SettingsIcon } from 'lucide-react';
import AudioControls from '@/components/AudioControls';
import SettingsDialog, { Settings } from '@/components/SettingsDialog';

interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
  rating: number;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
}

const DailyJournal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry }>({});
  const [currentContent, setCurrentContent] = useState('');
  const [currentRating, setCurrentRating] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();
  const [currentAudioFile, setCurrentAudioFile] = useState<File | undefined>();
  const [currentTranscript, setCurrentTranscript] = useState<string | undefined>();
  const [currentSummary, setCurrentSummary] = useState<string | undefined>();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    transcriptionModel: 'whisper-1',
    summaryModel: 'gpt-4o-mini',
  });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('journal-entries');
      if (savedEntries) setEntries(JSON.parse(savedEntries));

      const savedSettings = localStorage.getItem('journal-settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const entry = entries[dateKey];
    setCurrentContent(entry?.content || '');
    setCurrentRating(entry?.rating || 0);
    setCurrentAudioUrl(entry?.audioUrl);
    setCurrentTranscript(entry?.transcript);
    setCurrentSummary(entry?.summary);
    setCurrentAudioFile(undefined); // Reset audio file on date change
  }, [selectedDate, entries]);

  const handleSaveEntry = () => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newEntry: JournalEntry = {
      date: dateKey,
      content: currentContent,
      rating: currentRating,
      audioUrl: currentAudioUrl,
      transcript: currentTranscript,
      summary: currentSummary,
    };
    
    const updatedEntries = { ...entries, [dateKey]: newEntry };
    setEntries(updatedEntries);
    
    try {
      localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Failed to save entry to local storage", error);
    }
  };

  const handleAudioUpdate = (updates: { audioUrl?: string; transcript?: string; summary?: string; audioFile?: File }) => {
    if ('audioUrl' in updates) setCurrentAudioUrl(updates.audioUrl);
    if ('transcript' in updates) setCurrentTranscript(updates.transcript);
    if ('summary' in updates) setCurrentSummary(updates.summary);
    if ('audioFile' in updates) setCurrentAudioFile(updates.audioFile);
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('journal-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to local storage", error);
    }
  };

  const daysWithEntries = Object.keys(entries).map(dateStr => new Date(dateStr + 'T00:00:00'));

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-grow">Diario Psicologico</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <SettingsIcon className="h-6 w-6" />
          </Button>
        </header>

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

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Voce del Diario - {selectedDate ? format(selectedDate, 'PPP') : 'Seleziona una data'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="journal-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Come ti senti oggi?
                  </label>
                  <Textarea
                    id="journal-content"
                    placeholder="Scrivi qui i tuoi pensieri..."
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    className="min-h-[200px] text-base"
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
              </CardContent>
            </Card>

            <AudioControls
              audioUrl={currentAudioUrl}
              transcript={currentTranscript}
              summary={currentSummary}
              onUpdate={handleAudioUpdate}
              disabled={!selectedDate}
              settings={settings}
              audioFile={currentAudioFile}
            />

            <Button 
              onClick={handleSaveEntry} 
              className="w-full text-lg py-6"
              disabled={!selectedDate}
            >
              Salva Voce del Diario
            </Button>
          </div>
        </div>
      </div>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </>
  );
};

export default DailyJournal;