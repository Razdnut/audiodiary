import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { useI18n } from '@/i18n/i18n';
import { ArrowLeft } from 'lucide-react';

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
              <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                {list.map((e, i) => {
                  const display = (e.content && e.content.trim().length > 0)
                    ? e.content
                    : (e.summary && e.summary.trim().length > 0)
                      ? e.summary
                      : (e.transcript || '');
                  return (
                    <div key={`${e.dateKey}-${e.idx}-${i}`} className="p-3 rounded-md border bg-card">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{format(new Date(e.dateKey + 'T00:00:00'), 'PPP', { locale: lang === 'en' ? enUS : it })}</span>
                        {e.createdAt && (
                          <span>{format(e.when, 'HH:mm', { locale: lang === 'en' ? enUS : it })}</span>
                        )}
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed line-clamp-5">{display}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RecentPage;