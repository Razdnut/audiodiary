import { createEvents, type EventAttributes } from 'ics';
import { type Lang } from '@/i18n/i18n';
import { format } from 'date-fns';

export interface JournalEntryForExport {
  date: string;
  content: string;
  rating: number;
  transcript?: string;
  summary?: string;
  audioUrl?: string;
}

export const exportToJson = (entries: JournalEntryForExport[]): string => {
  const dataStr = JSON.stringify(entries, null, 2);
  return dataStr;
};

export const exportToIcs = async (entries: JournalEntryForExport[], lang: Lang = 'it'): Promise<string> => {
  const t = (key: 'calendarName' | 'rating' | 'none') => {
    const map = {
      it: { calendarName: 'Diario Psicologico', rating: 'Valutazione', none: 'Nessuna' },
      en: { calendarName: 'Psychological Journal', rating: 'Rating', none: 'None' },
    } as const;
    return map[lang][key];
  };
  const events: EventAttributes[] = entries.map((entry, index) => {
    const [year, month, day] = entry.date.split('-').map(Number);
    const event: EventAttributes = {
      title: `${t('calendarName')} - ${t('rating')}: ${entry.rating}/5`,
      description: `Contenuto: ${entry.content}\n\nTrascrizione: ${entry.transcript || t('none')}\n\nSintesi: ${entry.summary || t('none')}`,
      start: [year, month, day, 18, 0],
      end: [year, month, day, 18, 30],
      startInputType: 'local',
      endInputType: 'local',
      calName: t('calendarName'),
      uid: `diario-${entry.date}-${index}`,
    };
    return event;
  });

  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
