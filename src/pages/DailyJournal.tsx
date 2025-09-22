import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Rating from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Settings as SettingsIcon, Download, BarChart3 } from 'lucide-react';
import AudioControls from '@/components/AudioControls';
import SettingsDialog, { Settings } from '@/components/SettingsDialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import ExportDialog from '@/components/ExportDialog';
import { JournalEntryForExport } from '@/utils/export-utils';

interface JournalEntry {
  date: string;
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
  const [isExportOpen, setIsExportOpen] = useState(false);
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
    setCurrentAudioFile(undefined);
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
  const totalEntries = Object.keys(entries).length;
  const averageRating = totalEntries > 0 
    ? (Object.values(entries).reduce((sum, entry) => sum + entry.rating, 0) / totalEntries).toFixed(1)
    : '0.0';

  return (
    <>
      <div className="min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Diario Psicologico
              </h1>
              <p className="text-muted-foreground mt-1">
                Le tue riflessioni quotidiane, in un unico posto.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {totalEntries} voci • ⭐{averageRating}
                </span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={() => setIsExportOpen(true)}>
                <Download className="h-5 w-5" />
                <span className="sr-only">Esporta</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <SettingsIcon className="h-5 w-5" />
                <span className="sr-only">Impostazioni</span>
              </Button>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-0 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-3"
                    modifiers={{ hasEntry: daysWithEntries }}
                    modifiersStyles={{
                      hasEntry: { 
                        color: 'hsl(var(--primary-foreground))',
                        backgroundColor: 'hsl(var(--primary))' 
                      }
                    }}
                    locale={it}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Statistiche</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voci totali:</span>
                    <span className="font-semibold">{totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valutazione media:</span>
                    <span className="font-semibold">⭐{averageRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audio registrati:</span>
                    <span className="font-semibold">
                      {Object.values(entries).filter(e => e.audioUrl).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Voce del {selectedDate ? format(selectedDate, 'PPP', { locale: it }) : 'Seleziona una data'}
                  </CardTitle>
                  <CardDescription>
                    Scrivi i tuoi pensieri, registra una nota vocale e valuta la tua giornata.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="journal-content" className="text-base font-medium">
                      Come ti senti oggi?
                    </Label>
                    <Textarea
                      id="journal-content"
                      placeholder="Scrivi qui i tuoi pensieri, emozioni e riflessioni..."
                      value={currentContent}
                      onChange={(e) => setCurrentContent(e.target.value)}
                      className="min-h-[200px] text-base mt-2 resize-none"
                      disabled={!selectedDate}
                    />
                  </div>
                  
                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-2">Valuta la tua giornata:</h3>
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

              <div className="flex gap-4">
                <Button 
                  onClick={handleSaveEntry} 
                  size="lg"
                  className="flex-1 text-lg"
                  disabled={!selectedDate}
                >
                  Salva Voce
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCurrentContent('');
                    setCurrentRating(0);
                    setCurrentAudioUrl(undefined);
                    setCurrentTranscript(undefined);
                    setCurrentSummary(undefined);
                  }}
                  disabled={!selectedDate}
                >
                  Pulisci
                </Button>
              </div>
            </section>
          </main>
        </div>
      </div>
      
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
      
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        entries={entries as unknown as JournalEntryForExport}
      />
    </>
  );
};

export default DailyJournal;