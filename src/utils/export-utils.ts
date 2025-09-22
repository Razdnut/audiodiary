import { createEvent } from 'ics';
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

export const exportToIcs = async (entries: JournalEntryForExport[]): Promise<string> => {
  const events = entries.map((entry, index) => {
    const [year, month, day] = entry.date.split('-').map(Number);
    return {
      title: `Diario Psicologico - Valutazione: ${entry.rating}/5`,
      description: `Contenuto: ${entry.content}\n\nTrascrizione: ${entry.transcript || 'Nessuna'}\n\nSintesi: ${entry.summary || 'Nessuna'}`,
      start: [year, month, day, 18, 0] as [number, number, number, number, number],
      end: [year, month, day, 18, 30] as [number, number, number, number, number],
      startInputType: 'local',
      endInputType: 'local',
      calName: 'Diario Psicologico',
      uid: `diario-${entry.date}-${index}`,
    };
  });

  return new Promise((resolve, reject) => {
    createEvent(events[0], (error, value) => {
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