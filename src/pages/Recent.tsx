import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { useI18n } from '@/i18n/i18n';
import { ArrowLeft } from 'lucide-react';
import AnimatedList from '@/components/AnimatedList';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface JournalEntry {
  date: string;
  content: string;
  rating: number;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  createdAt?: string;
}

const RecentPage = () => {
  const { t, lang } = useI18n();
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry[] }>({});
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('journal-entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to load entries from local storage", error);
    }
  }, []);

  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const list = Object.entries(entries)
    .flatMap(([dateKey, arr]) => (arr || []).map((e, idx) => ({ ...e, dateKey, idx })))
    .map((e) => {
      const when = e.createdAt ? new Date(e.createdAt) : new Date(e.date + 'T00:00:00');
      return { ...e, when };
    })
    .filter((e) => e.when >= cutoff)
    .sort((a, b) => b.when.getTime() - a.when.getTime());

  useEffect(() => {
    if (list.length === 0) {
      if (selectedIndex !== -1) {
        setSelectedIndex(-1);
      }
      return;
    }

    if (selectedIndex < 0 || selectedIndex >= list.length) {
      setSelectedIndex(0);
    }
  }, [list.length, selectedIndex]);

  const locale = lang === 'en' ? enUS : it;

  const items = useMemo(
    () => list.map((entry) => format(entry.when, 'PPP', { locale })),
    [list, locale]
  );

  const selectedEntry = selectedIndex >= 0 && selectedIndex < list.length ? list[selectedIndex] : undefined;

  const displayText = selectedEntry
    ? (selectedEntry.content && selectedEntry.content.trim().length > 0)
      ? selectedEntry.content
      : (selectedEntry.summary && selectedEntry.summary.trim().length > 0)
        ? selectedEntry.summary
        : (selectedEntry.transcript || '')
    : '';

  const hasSecondarySummary = selectedEntry
    ? selectedEntry.summary && selectedEntry.summary.trim().length > 0 && selectedEntry.summary.trim() !== displayText.trim()
    : false;

  const hasTranscript = selectedEntry
    ? selectedEntry.transcript && selectedEntry.transcript.trim().length > 0 && selectedEntry.transcript.trim() !== displayText.trim()
    : false;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex items-center gap-4 mb-8 border-b pb-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('recent.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('recent.description')}</p>
        </div>
      </header>
      <main>
        <Card>
          <CardContent className="pt-6">
            {list.length === 0 ? (
              <div className="text-sm text-muted-foreground">{t('recent.empty')}</div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,240px),1fr]">
                <AnimatedList
                  items={items}
                  selectedIndex={selectedIndex}
                  onSelectedIndexChange={(index) => setSelectedIndex(index)}
                  showGradients
                  enableArrowNavigation
                  className="lg:sticky lg:top-6"
                />
                <div className="rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur">
                  {selectedEntry ? (
                    <>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="text-lg font-semibold text-foreground">
                          {format(selectedEntry.when, 'PPP', { locale })}
                        </span>
                        {selectedEntry.createdAt && (
                          <span>{format(selectedEntry.when, 'p', { locale })}</span>
                        )}
                        <Badge variant="outline" className="uppercase tracking-tight">
                          {t('ics.rating')}: {selectedEntry.rating}/5
                        </Badge>
                      </div>
                      <div className="mt-5 rounded-2xl bg-background/90 p-5 shadow-inner ring-1 ring-border/40">
                        <p className="whitespace-pre-wrap text-base leading-8 text-foreground">{displayText}</p>
                      </div>
                      {hasSecondarySummary && selectedEntry?.summary && (
                        <div className="mt-5 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">{t('audio.summaryLabel')}</Label>
                          <div className="rounded-xl border bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                            {selectedEntry.summary}
                          </div>
                        </div>
                      )}
                      {hasTranscript && selectedEntry?.transcript && (
                        <div className="mt-5 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">{t('audio.transcriptLabel')}</Label>
                          <div className="rounded-xl border bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                            {selectedEntry.transcript}
                          </div>
                        </div>
                      )}
                      {selectedEntry.audioUrl && (
                        <div className="mt-6 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">{t('audio.recordingLabel')}</Label>
                          <audio controls src={selectedEntry.audioUrl} className="w-full rounded-lg" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t('recent.empty')}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RecentPage;