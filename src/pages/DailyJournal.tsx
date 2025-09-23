import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Rating from '@/components/ui/rating';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import AudioControls from '@/components/AudioControls';
import SettingsDialog, { Settings } from '@/components/SettingsDialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import ExportDialog from '@/components/ExportDialog';
import { showSuccess, showError } from '@/utils/toast';
import { JournalEntryForExport } from '@/utils/export-utils';
import { defaultSummaryPromptEn, defaultSummaryPromptIt } from '@/lib/defaultPrompts';
import OnboardingDialog from '@/components/OnboardingDialog';
import DockMenu from '@/components/DockMenu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const JOURNAL_ENTRIES_STORAGE_KEY = 'journal-entries';
const JOURNAL_SETTINGS_STORAGE_KEY = 'journal-settings';
const ONBOARDING_STORAGE_KEY = 'journal-onboarding-complete';

const toJournalEntry = (dateKey: string, raw: unknown): JournalEntry => {
  if (raw && typeof raw === 'object') {
    const candidate = raw as Partial<JournalEntry>;
    return {
      date: typeof candidate.date === 'string' ? candidate.date : dateKey,
      content: typeof candidate.content === 'string' ? candidate.content : '',
      rating: typeof candidate.rating === 'number' ? candidate.rating : 0,
      audioUrl: typeof candidate.audioUrl === 'string' ? candidate.audioUrl : undefined,
      transcript: typeof candidate.transcript === 'string' ? candidate.transcript : undefined,
      summary: typeof candidate.summary === 'string' ? candidate.summary : undefined,
      createdAt:
        typeof candidate.createdAt === 'string'
          ? candidate.createdAt
          : new Date(`${dateKey}T00:00:00`).toISOString(),
    };
  }

  return {
    date: dateKey,
    content: '',
    rating: 0,
    createdAt: new Date(`${dateKey}T00:00:00`).toISOString(),
  };
};

const persistEntries = (data: Record<string, JournalEntry[]>) => {
  try {
    localStorage.setItem(JOURNAL_ENTRIES_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist journal entries', error);
  }
};

const persistSettings = (data: Settings) => {
  try {
    localStorage.setItem(JOURNAL_SETTINGS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist settings', error);
  }
};

const markOnboardingComplete = () => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Failed to persist onboarding completion flag', error);
  }
};

const revokeBlobUrl = (url?: string) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke blob URL', error);
    }
  }
};

const DailyJournal = () => {
  const { t, lang } = useI18n();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<Record<string, JournalEntry[]>>({});
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
  const [currentContent, setCurrentContent] = useState('');
  const [currentRating, setCurrentRating] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();
  const [currentAudioFile, setCurrentAudioFile] = useState<File | undefined>();
  const [currentTranscript, setCurrentTranscript] = useState<string | undefined>();
  const [currentSummary, setCurrentSummary] = useState<string | undefined>();
  const [contentAutoFilled, setContentAutoFilled] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const onboardingTriggeredRef = useRef(false);
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    transcriptionModel: 'whisper-1',
    summaryModel: 'gpt-4o-mini',
    summaryPromptIt: defaultSummaryPromptIt,
    summaryPromptEn: defaultSummaryPromptEn,
    summaryPrompt: defaultSummaryPromptIt,
  });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(JOURNAL_ENTRIES_STORAGE_KEY);
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries) as unknown;
        if (parsedEntries && typeof parsedEntries === 'object') {
          const migrated: Record<string, JournalEntry[]> = {};
          Object.entries(parsedEntries as Record<string, unknown>).forEach(([dateKey, value]) => {
            if (Array.isArray(value)) {
              migrated[dateKey] = value.map((item) => toJournalEntry(dateKey, item));
            } else {
              migrated[dateKey] = [toJournalEntry(dateKey, value)];
            }
          });
          setEntries(migrated);
        }
      }

      const savedSettings = localStorage.getItem(JOURNAL_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as Partial<Settings> & { summaryPrompt?: string };
        setSettings({
          apiKey: typeof parsedSettings.apiKey === 'string' ? parsedSettings.apiKey : '',
          transcriptionModel: typeof parsedSettings.transcriptionModel === 'string'
            ? parsedSettings.transcriptionModel
            : 'whisper-1',
          summaryModel: typeof parsedSettings.summaryModel === 'string'
            ? parsedSettings.summaryModel
            : 'gpt-4o-mini',
          summaryPromptIt:
            typeof parsedSettings.summaryPromptIt === 'string'
              ? parsedSettings.summaryPromptIt
              : typeof parsedSettings.summaryPrompt === 'string'
                ? parsedSettings.summaryPrompt
                : defaultSummaryPromptIt,
          summaryPromptEn:
            typeof parsedSettings.summaryPromptEn === 'string'
              ? parsedSettings.summaryPromptEn
              : defaultSummaryPromptEn,
          summaryPrompt:
            typeof parsedSettings.summaryPrompt === 'string'
              ? parsedSettings.summaryPrompt
              : defaultSummaryPromptIt,
        });
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    } finally {
      setSettingsInitialized(true);
    }
  }, []);

  // Keep legacy summaryPrompt synchronized with the current language
  useEffect(() => {
    setSettings((prev) => {
      const target =
        lang === 'en'
          ? prev.summaryPromptEn || defaultSummaryPromptEn
          : prev.summaryPromptIt || defaultSummaryPromptIt;
      if (prev.summaryPrompt === target) {
        return prev;
      }
      const updated: Settings = {
        ...prev,
        summaryPrompt: target,
      };
      persistSettings(updated);
      return updated;
    });
  }, [lang]);

  useEffect(() => {
    if (!settingsInitialized || onboardingTriggeredRef.current) return;
    let completed = false;
    try {
      completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch (error) {
      console.warn('Failed to read onboarding completion flag', error);
    }
    if (!completed && (!settings.apiKey || settings.apiKey.trim().length === 0)) {
      setIsOnboardingOpen(true);
      onboardingTriggeredRef.current = true;
    }
  }, [settingsInitialized, settings.apiKey]);

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
    setContentAutoFilled(false);
    setCurrentAudioFile(undefined);
    if (idx !== selectedEntryIndex) setSelectedEntryIndex(idx);
  }, [selectedDate, entries, selectedEntryIndex]);

  const handleSaveEntry = () => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    // If the main content is empty, fall back to transcript, then summary
    const contentToSave = (currentContent && currentContent.trim().length > 0)
      ? currentContent
      : (currentSummary && currentSummary.trim().length > 0)
        ? currentSummary
        : (currentTranscript && currentTranscript.trim().length > 0)
          ? currentTranscript
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
    // Reflect fallback in UI first for immediacy
    if (contentToSave !== currentContent) {
      setCurrentContent(contentToSave);
      setContentAutoFilled(false);
    }
    setEntries(updatedEntries);
    persistEntries(updatedEntries);
  };

  const handleDeleteAllAudio = () => {
    try {
      const updated: Record<string, JournalEntry[]> = {};
      let removedCount = 0;
      Object.entries(entries).forEach(([dateKey, arr]) => {
        const sanitizedEntries = (arr || []).map((entry) => {
          if (entry.audioUrl) {
            revokeBlobUrl(entry.audioUrl);
            removedCount += 1;
          }
          return { ...entry, audioUrl: undefined, transcript: undefined, summary: undefined };
        });
        updated[dateKey] = sanitizedEntries;
      });

      setEntries(updated);
      persistEntries(updated);

      revokeBlobUrl(currentAudioUrl);
      setCurrentAudioUrl(undefined);
      setCurrentTranscript(undefined);
      setCurrentSummary(undefined);
      setContentAutoFilled(false);

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
      if (currentAudioUrl && updates.audioUrl === undefined) {
        revokeBlobUrl(currentAudioUrl);
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
          persistEntries(updatedEntries);
        }
      }
    }
    if ('transcript' in updates) {
      setCurrentTranscript(updates.transcript);
    }
    if ('summary' in updates) {
      setCurrentSummary(updates.summary);
      const newSummary = updates.summary || '';
      if ((contentAutoFilled || (currentContent || '').trim().length === 0) && newSummary.trim().length > 0) {
        setCurrentContent(newSummary);
        setContentAutoFilled(true);
      }
    }
    if ('audioFile' in updates) setCurrentAudioFile(updates.audioFile);
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    persistSettings(newSettings);
  };

  const handleOnboardingOpenChange = (open: boolean) => {
    setIsOnboardingOpen(open);
    if (!open) onboardingTriggeredRef.current = true;
  };

  const handleCompleteOnboarding = (newSettings: Settings) => {
    handleSaveSettings(newSettings);
    markOnboardingComplete();
    setIsOnboardingOpen(false);
    showSuccess(t('onboarding.completed'));
  };

  const daysWithEntries = useMemo(
    () =>
      Object.entries(entries)
        .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
        .map(([dateStr]) => new Date(`${dateStr}T00:00:00`)),
    [entries],
  );

  const allEntries: JournalEntry[] = useMemo(
    () => Object.values(entries).flatMap((arr) => (Array.isArray(arr) ? arr : [])),
    [entries],
  );

  const totalEntries = allEntries.length;
  const averageRating = totalEntries > 0
    ? (allEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / totalEntries).toFixed(1)
    : '0.0';
  const audioRecordings = useMemo(
    () => allEntries.filter((entry) => Boolean(entry.audioUrl)).length,
    [allEntries],
  );
  const exportEntries = useMemo<JournalEntryForExport[]>(
    () =>
      Object.values(entries)
        .flatMap((arr) => (Array.isArray(arr) ? arr : []))
        .map(({ date, content, rating, transcript, summary, audioUrl }) => ({
          date,
          content,
          rating,
          transcript,
          summary,
          audioUrl,
        })),
    [entries],
  );

  return (
    <>
      <OnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={handleOnboardingOpenChange}
        settings={settings}
        onComplete={handleCompleteOnboarding}
      />
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
            <DockMenu
              statsSummary={t('header.statsCompact', { count: totalEntries, avg: averageRating })}
              totalEntries={totalEntries}
              averageRating={averageRating}
              audioRecordings={audioRecordings}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
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
                    modifiersClassNames={{ hasEntry: 'has-entry' }}
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
                          onValueChange={(value) => {
                            const parsedIndex = Number.parseInt(value, 10);
                            if (!Number.isNaN(parsedIndex)) {
                              setSelectedEntryIndex(parsedIndex);
                            }
                          }}
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
                          setContentAutoFilled(false);
                          persistEntries(updatedEntries);
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
                          revokeBlobUrl(toDelete?.audioUrl);
                          dayEntries.splice(selectedEntryIndex, 1);
                          const newIndex = Math.max(0, Math.min(selectedEntryIndex, dayEntries.length - 1));
                          const updatedEntries = { ...entries, [dateKey]: dayEntries };
                          setEntries(updatedEntries);
                          setSelectedEntryIndex(newIndex);
                          persistEntries(updatedEntries);
                          if (dayEntries.length === 0) {
                            setCurrentContent('');
                            setCurrentRating(0);
                            setCurrentAudioUrl(undefined);
                            setCurrentTranscript(undefined);
                            setCurrentSummary(undefined);
                            setContentAutoFilled(false);
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
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setCurrentContent(e.target.value); setContentAutoFilled(false); }}
                      className="min-h-[200px] text-base mt-2 resize-none"
                      disabled={!selectedDate}
                    />
                    <div className="mt-3 flex gap-3">
                      <Button
                        onClick={handleSaveEntry}
                        size="lg"
                        className="flex-1 text-lg"
                        disabled={!selectedDate}
                      >
                        {t('daily.saveNote')}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          revokeBlobUrl(currentAudioUrl);
                          setCurrentContent('');
                          setCurrentRating(0);
                          setCurrentAudioUrl(undefined);
                          setCurrentTranscript(undefined);
                          setCurrentSummary(undefined);
                          setContentAutoFilled(false);
                        }}
                        disabled={!selectedDate}
                      >
                        {t('daily.clear')}
                      </Button>
                    </div>
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
                onCopySummaryToNote={() => { const s = (currentSummary || '').trim(); if (!s) return; setCurrentContent(s); setContentAutoFilled(true); }}
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
                    revokeBlobUrl(currentAudioUrl);
                    setCurrentContent('');
                    setCurrentRating(0);
                    setCurrentAudioUrl(undefined);
                    setCurrentTranscript(undefined);
                    setCurrentSummary(undefined);
                    setContentAutoFilled(false);
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
                    <span className="font-semibold">{averageRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('stats.recordings')}</span>
                    <span className="font-semibold">{audioRecordings}</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const confirmed = window.confirm(t('stats.resetAllRatings.confirm'));
                        if (!confirmed) return;
                        try {
                          const updated: Record<string, JournalEntry[]> = {};
                          Object.entries(entries).forEach(([dateKey, arr]) => {
                            updated[dateKey] = (arr || []).map((entry) => ({ ...entry, rating: 0 }));
                          });
                          setEntries(updated);
                          persistEntries(updated);
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
        entries={exportEntries}
      />
    </>
  );
};

export default DailyJournal;