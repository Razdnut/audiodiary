import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Rating from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Settings as SettingsIcon, Download, BarChart3 } from 'lucide-react';
import AudioControls from '@/components/AudioControls';
import SettingsDialog, { Settings } from '@/components/SettingsDialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import ExportDialog from '@/components/ExportDialog';
import { showSuccess, showError } from '@/utils/toast';
import { JournalEntryForExport } from '@/utils/export-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LanguageToggle from '@/components/LanguageToggle';
import { useI18n } from '@/i18n/i18n';

interface JournalEntry {
  date: string;
  content: string;
  rating: number;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  createdAt?: string;
}

const DailyJournal = () => {
  const { t, lang } = useI18n();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry[] }>({});
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
  const [showEntryHighlights, setShowEntryHighlights] = useState(false);
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
    summaryPromptIt:
      'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.',
    summaryPromptEn:
      'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.',
    summaryPrompt:
      'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.',
  });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('journal-entries');
      if (savedEntries) {
        const parsed = JSON.parse(savedEntries);
        const migrated: { [key: string]: JournalEntry[] } = {};
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (Array.isArray(v)) {
              migrated[k] = v as JournalEntry[];
            } else if (v && typeof v === 'object') {
              const e = v as any;
              migrated[k] = [
                {
                  date: e.date || k,
                  content: e.content || '',
                  rating: typeof e.rating === 'number' ? e.rating : 0,
                  audioUrl: e.audioUrl,
                  transcript: e.transcript,
                  summary: e.summary,
                  createdAt: e.createdAt || new Date(k + 'T00:00:00').toISOString(),
                },
              ];
            }
          }
        }
        setEntries(migrated);
      }

      const savedSettings = localStorage.getItem('journal-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          apiKey: parsed.apiKey || '',
          transcriptionModel: parsed.transcriptionModel || 'whisper-1',
          summaryModel: parsed.summaryModel || 'gpt-4o-mini',
          summaryPromptIt:
            parsed.summaryPromptIt ||
            parsed.summaryPrompt ||
            'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.',
          summaryPromptEn:
            parsed.summaryPromptEn ||
            'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.',
          summaryPrompt:
            parsed.summaryPrompt ||
            'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.',
        });
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  // Keep legacy summaryPrompt synchronized with the current language
  useEffect(() => {
    const defaultIt =
      'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.';
    const defaultEn =
      'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.';
    const target =
      lang === 'en'
        ? (settings.summaryPromptEn || defaultEn)
        : (settings.summaryPromptIt || defaultIt);
    if (settings.summaryPrompt !== target) {
      const synced = { ...settings, summaryPrompt: target };
      setSettings(synced);
      try { localStorage.setItem('journal-settings', JSON.stringify(synced)); } catch {}
    }
  }, [lang, settings.summaryPromptEn, settings.summaryPromptIt]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayEntries = entries[dateKey] || [];
    const idx = Math.min(selectedEntryIndex, Math.max(dayEntries.length - 1, 0));
    const entry = dayEntries[idx];
    setCurrentContent(entry?.content || '');
    setCurrentRating(entry?.rating || 0);
    setCurrentAudioUrl(entry?.audioUrl);
    setCurrentTranscript(entry?.transcript);
    setCurrentSummary(entry?.summary);
    setCurrentAudioFile(undefined);
    if (idx !== selectedEntryIndex) setSelectedEntryIndex(idx);
  }, [selectedDate, entries, selectedEntryIndex]);

  const handleSaveEntry = () => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    // If the main content is empty, fall back to transcript, then summary
    const contentToSave = (currentContent && currentContent.trim().length > 0)
      ? currentContent
      : (currentTranscript && currentTranscript.trim().length > 0)
        ? currentTranscript
        : (currentSummary && currentSummary.trim().length > 0)
          ? currentSummary
          : '';
    const newEntry: JournalEntry = {
      date: dateKey,
      content: contentToSave,
      rating: currentRating,
      audioUrl: currentAudioUrl,
      transcript: currentTranscript,
      summary: currentSummary,
      createdAt: new Date().toISOString(),
    };
    const dayEntries = entries[dateKey] ? [...entries[dateKey]] : [];
    if (dayEntries[selectedEntryIndex]) {
      dayEntries[selectedEntryIndex] = { ...dayEntries[selectedEntryIndex], ...newEntry };
    } else {
      dayEntries.push(newEntry);
      setSelectedEntryIndex(dayEntries.length - 1);
    }
    const updatedEntries = { ...entries, [dateKey]: dayEntries };
    setEntries(updatedEntries);
    // Reflect fallback in UI text area as well
    if (contentToSave !== currentContent) setCurrentContent(contentToSave);
    
    try {
      localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Failed to save entry to local storage", error);
    }
  };

  const handleDeleteAllAudio = () => {
    try {
      const updated: { [key: string]: JournalEntry[] } = {};
      let removedCount = 0;
      for (const [dateKey, arr] of Object.entries(entries)) {
        const newArr: JournalEntry[] = (arr || []).map((entry) => {
          if (entry.audioUrl && entry.audioUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(entry.audioUrl); } catch {}
          }
          const hadAudio = Boolean(entry.audioUrl);
          if (hadAudio) removedCount++;
          return { ...entry, audioUrl: undefined, transcript: undefined, summary: undefined };
        });
        updated[dateKey] = newArr;
      }
      setEntries(updated);
      localStorage.setItem('journal-entries', JSON.stringify(updated));

      // Clear current selection if it had audio
      if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(currentAudioUrl); } catch {}
      }
      setCurrentAudioUrl(undefined);
      setCurrentTranscript(undefined);
      setCurrentSummary(undefined);
      showSuccess(
        removedCount > 0
          ? `Eliminati audio da ${removedCount} voci. Trascrizioni e sintesi rimosse.`
          : 'Nessun audio trovato da eliminare. Trascrizioni e sintesi rimosse comunque.'
      );
    } catch (error) {
      console.error('Errore durante la rimozione massiva degli audio:', error);
      showError('Errore durante l\'eliminazione degli audio.');
    }
  };

  const handleAudioUpdate = (updates: { audioUrl?: string; transcript?: string; summary?: string; audioFile?: File }) => {
    if ('audioUrl' in updates) {
      if (currentAudioUrl && updates.audioUrl === undefined && currentAudioUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(currentAudioUrl); } catch {}
      }
      setCurrentAudioUrl(updates.audioUrl);

      // Persist immediate deletion of audio to liberate space
      if (updates.audioUrl === undefined && selectedDate) {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const dayEntries = entries[dateKey] ? [...entries[dateKey]] : [];
        if (dayEntries[selectedEntryIndex]) {
          dayEntries[selectedEntryIndex] = {
            ...dayEntries[selectedEntryIndex],
            audioUrl: undefined,
            transcript: undefined,
            summary: undefined,
          };
          const updatedEntries = { ...entries, [dateKey]: dayEntries };
          setEntries(updatedEntries);
          try { localStorage.setItem('journal-entries', JSON.stringify(updatedEntries)); } catch (error) {
            console.error('Failed to persist audio deletion', error);
          }
        }
      }
    }
    if ('transcript' in updates) {
      setCurrentTranscript(updates.transcript);
      // If the note content is empty, auto-fill it with the transcript so it's visible immediately
      const newTranscript = updates.transcript || '';
      if ((currentContent || '').trim().length === 0 && newTranscript.trim().length > 0) {
        setCurrentContent(newTranscript);
      }
    }
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

  const daysWithEntries = Object.entries(entries)
    .filter(([_, arr]) => Array.isArray(arr) && arr.length > 0)
    .map(([dateStr]) => new Date(dateStr + 'T00:00:00'));
  const allEntries: JournalEntry[] = Object.values(entries).flatMap(arr => (arr || []));
  const totalEntries = allEntries.length;
  const averageRating = totalEntries > 0
    ? (allEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / totalEntries).toFixed(1)
    : '0.0';

  return (
    <>
      <div className="min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b pb-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('header.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('header.statsCompact', { count: totalEntries, avg: averageRating })}
                </span>
              </div>
              <ThemeToggle />
              <LanguageToggle />
              <Button variant="outline" size="icon" onClick={() => setIsExportOpen(true)}>
                <Download className="h-5 w-5" />
                <span className="sr-only">{t('header.export')}</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <SettingsIcon className="h-5 w-5" />
                <span className="sr-only">{t('header.settings')}</span>
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
                    onSelect={(date) => { setSelectedDate(date); setShowEntryHighlights(true); }}
                    className="p-3"
                    modifiers={showEntryHighlights ? { hasEntry: daysWithEntries } : {}}
                    modifiersStyles={{
                      hasEntry: { 
                        color: 'hsl(var(--primary-foreground))',
                        backgroundColor: 'hsl(var(--primary))' 
                      }
                    }}
                    locale={lang === 'en' ? enUS : it}
                  />
                </CardContent>
              </Card>
            </aside>

            <section className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {selectedDate
                      ? t('daily.entryFor', { date: format(selectedDate, 'PPP', { locale: lang === 'en' ? enUS : it }) })
                      : t('daily.selectDate')}
                  </CardTitle>
                  <CardDescription>
                    {t('header.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="journal-content" className="text-base font-medium">
                      {t('daily.howFeel')}
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1">
                        <Select
                          value={String(selectedEntryIndex)}
                          onValueChange={(val) => setSelectedEntryIndex(parseInt(val))}
                          disabled={!selectedDate}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('daily.selectNote')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(entries[selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''] || []).map((e, idx) => (
                              <SelectItem key={idx} value={String(idx)}>
                                {`${t('daily.noteN', { n: idx + 1 })}${e.createdAt ? ' - ' + format(new Date(e.createdAt), 'HH:mm', { locale: lang === 'en' ? enUS : it }) : ''}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (!selectedDate) return;
                          const dateKey = format(selectedDate, 'yyyy-MM-dd');
                          const newNote: JournalEntry = {
                            date: dateKey,
                            content: '',
                            rating: 0,
                            createdAt: new Date().toISOString(),
                          };
                          const dayEntries = entries[dateKey] ? [...entries[dateKey]] : [];
                          dayEntries.push(newNote);
                          const updatedEntries = { ...entries, [dateKey]: dayEntries };
                          setEntries(updatedEntries);
                          setSelectedEntryIndex(dayEntries.length - 1);
                          setCurrentContent('');
                          setCurrentRating(0);
                          setCurrentAudioUrl(undefined);
                          setCurrentTranscript(undefined);
                          setCurrentSummary(undefined);
                          try { localStorage.setItem('journal-entries', JSON.stringify(updatedEntries)); } catch {}
                        }}
                        disabled={!selectedDate}
                      >
                        {t('daily.newNote')}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (!selectedDate) return;
                          const dateKey = format(selectedDate, 'yyyy-MM-dd');
                          const dayEntries = entries[dateKey] ? [...entries[dateKey]] : [];
                          if (dayEntries.length === 0) return;
                          const confirmDelete = window.confirm(t('daily.deleteNote.confirm'));
                          if (!confirmDelete) return;
                          const toDelete = dayEntries[selectedEntryIndex];
                          if (toDelete?.audioUrl && toDelete.audioUrl.startsWith('blob:')) {
                            try { URL.revokeObjectURL(toDelete.audioUrl); } catch {}
                          }
                          dayEntries.splice(selectedEntryIndex, 1);
                          const newIndex = Math.max(0, Math.min(selectedEntryIndex, dayEntries.length - 1));
                          const updatedEntries = { ...entries, [dateKey]: dayEntries };
                          setEntries(updatedEntries);
                          setSelectedEntryIndex(newIndex);
                          try { localStorage.setItem('journal-entries', JSON.stringify(updatedEntries)); } catch {}
                          if (dayEntries.length === 0) {
                            setCurrentContent('');
                            setCurrentRating(0);
                            setCurrentAudioUrl(undefined);
                            setCurrentTranscript(undefined);
                            setCurrentSummary(undefined);
                          }
                          showSuccess(t('daily.deleteNote'));
                        }}
                        disabled={!selectedDate || (selectedDate && (entries[format(selectedDate, 'yyyy-MM-dd')] || []).length === 0)}
                        title="Elimina nota"
                      >
                        {t('daily.deleteNote')}
                      </Button>
                    </div>
                    <Textarea
                      id="journal-content"
                      placeholder={t('daily.writePlaceholder')}
                      value={currentContent}
                      onChange={(e) => setCurrentContent(e.target.value)}
                      className="min-h-[200px] text-base mt-2 resize-none"
                      disabled={!selectedDate}
                    />
                  </div>
                  
                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-2">{t('daily.rateDay')}</h3>
                    <Rating
                      value={currentRating}
                      onValueChange={setCurrentRating}
                      max={5}
                      size="lg"
                    />
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentRating(0)}
                        disabled={!selectedDate}
                      >
                        {t('daily.resetRating')}
                      </Button>
                    </div>
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
                  {t('daily.saveEntry')}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
                      try { URL.revokeObjectURL(currentAudioUrl); } catch {}
                    }
                    setCurrentContent('');
                    setCurrentRating(0);
                    setCurrentAudioUrl(undefined);
                    setCurrentTranscript(undefined);
                    setCurrentSummary(undefined);
                  }}
                  disabled={!selectedDate}
                >
                  {t('daily.clear')}
                </Button>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t('stats.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('stats.totalEntries')}</span>
                    <span className="font-semibold">{totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('stats.avgRating')}</span>
                    <span className="font-semibold">⭐{averageRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('stats.recordings')}</span>
                    <span className="font-semibold">{allEntries.filter(e => e.audioUrl).length}</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const confirmed = window.confirm(t('stats.resetAllRatings.confirm'));
                        if (!confirmed) return;
                        try {
                          const updated: { [key: string]: JournalEntry[] } = {};
                          for (const [dateKey, arr] of Object.entries(entries)) {
                            updated[dateKey] = (arr || []).map(e => ({ ...e, rating: 0 }));
                          }
                          setEntries(updated);
                          localStorage.setItem('journal-entries', JSON.stringify(updated));
                          setCurrentRating(0);
                          showSuccess(t('stats.resetAllRatings.success'));
                        } catch (error) {
                          console.error('Errore durante il reset delle statistiche', error);
                          showError(t('stats.resetAllRatings.error'));
                        }
                      }}
                      disabled={allEntries.length === 0}
                    >
                      {t('stats.resetAllRatings')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
      
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onDeleteAllAudio={handleDeleteAllAudio}
      />
      
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        entries={Object.values(entries)
          .flat()
          .map(({ date, content, rating, transcript, summary, audioUrl }) => ({
            date,
            content,
            rating,
            transcript,
            summary,
            audioUrl,
          }) as JournalEntryForExport)}
      />
    </>
  );
};

export default DailyJournal;
