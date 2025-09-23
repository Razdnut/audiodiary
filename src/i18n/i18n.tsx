import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { it as dfIt, enUS as dfEnUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export type Lang = 'it' | 'en';

type Dict = Record<string, string>;
type Translations = Record<Lang, Dict>;

const translations: Translations = {
  it: {
    'app.title': 'Diario Psicologico',
    'header.subtitle': 'Le tue riflessioni quotidiane, in un unico posto.',
    'header.export': 'Esporta',
    'header.settings': 'Impostazioni',
    'header.statsCompact': '{count} voci ⭐ {avg}',
    'header.recent': 'Recenti',
    'dock.theme': 'Tema',
    'dock.language': 'Lingua',
    'dock.language.it': 'Italiano',
    'dock.language.en': 'Inglese',
    'theme.light': 'Chiaro',
    'theme.dark': 'Scuro',
    'theme.system': 'Sistema',

    'daily.entryFor': 'Voce del {date}',
    'daily.selectDate': 'Seleziona una data',
    'daily.howFeel': 'Come ti senti oggi?',
    'daily.selectNote': 'Seleziona una nota',
    'daily.newNote': 'Nuova nota',
    'daily.deleteNote': 'Elimina nota',
    'daily.deleteNote.confirm': 'Eliminare definitivamente questa nota? L\'eventuale audio sarà rimosso.',
    'daily.noteN': 'Nota {n}',
    'daily.writePlaceholder': 'Scrivi qui i tuoi pensieri, emozioni e riflessioni...',
    'daily.rateDay': 'Valuta la tua giornata:',
    'daily.resetRating': 'Azzera voto',
    'daily.saveNote': 'Salva Nota',
    'daily.saveEntry': 'Salva Voce',
    'daily.clear': 'Pulisci',
    'daily.copySummaryToNote': 'Salva in Nota',

    'stats.title': 'Statistiche',
    'stats.totalEntries': 'Voci totali:',
    'stats.avgRating': 'Valutazione media:',
    'stats.recordings': 'Audio registrati:',
    'stats.resetAllRatings': 'Resetta statistiche (azzera voti)',
    'stats.resetAllRatings.confirm': 'Azzera tutti i voti (stelle) di tutte le note?',
    'stats.resetAllRatings.success': 'Statistiche azzerate: tutti i voti sono stati impostati a 0.',
    'stats.resetAllRatings.error': 'Errore durante il reset delle statistiche.',

    'audio.title': 'Note Vocali e Analisi',
    'audio.record': 'Registra',
    'audio.stop': 'Ferma',
    'audio.pause': 'Pausa',
    'audio.resume': 'Riprendi',
    'audio.transcribe': 'Trascrivi',
    'audio.summarize': 'Sintetizza',
    'audio.recordingLabel': 'Registrazione:',
    'audio.transcriptLabel': 'Trascrizione:',
    'audio.summaryLabel': 'Sintesi Automatica:',
    'audio.delete': 'Elimina audio',
    'audio.micDenied': 'Accesso al microfono negato. Controlla i permessi del browser.',
    'audio.noAudio': 'Nessun file audio da trascrivere.',
    'audio.noApiKey': 'Per favore, imposta la tua chiave API di OpenAI nelle impostazioni.',
    'audio.noTranscript': 'Nessuna trascrizione da sintetizzare.',
    'audio.transcribed': 'Trascrizione completata!',
    'audio.summarized': 'Sintesi completata!',

    'settings.title': 'Impostazioni',
    'settings.description': 'Configura la tua chiave API di OpenAI e i modelli da utilizzare. La tua chiave API è salvata solo nel tuo browser.',
    'settings.apiKey': 'API Key',
    'settings.backendUrl': 'URL Backend',
    'settings.backendUrl.placeholder': 'https://tuo-api.esempio.com',
    'settings.transcription': 'Trascrizione',
    'settings.summary': 'Sintesi',
    'settings.systemPrompt': 'Prompt di Sistema',
    'settings.save': 'Salva Modifiche',
    'settings.lang': 'Lingua',
    'settings.deleteAllAudio': 'Elimina tutti gli audio salvati',
    'settings.deleteAllAudio.confirm': 'Sei sicuro di voler eliminare TUTTI i file audio, trascrizioni e sintesi salvate? Questa azione non può essere annullata.',

    'export.title': 'Esporta Dati',
    'export.description': 'Scegli il formato per esportare le tue voci del diario.',
    'export.json': 'Esporta in JSON',
    'export.json.desc': 'Formato universale per backup e analisi dati.',
    'export.ics': 'Esporta in Calendar (ICS)',
    'export.ics.desc': 'Importa le tue voci nel calendario preferito.',
    'export.cancel': 'Annulla',
    'export.includeSensitive': 'Includi contenuti/testi sensibili in export',

    'ics.calendarName': 'Diario Psicologico',
    'ics.rating': 'Valutazione',
    'ics.none': 'Nessuna',
    'ics.content': 'Contenuto',
    'ics.transcript': 'Trascrizione',
    'ics.summary': 'Sintesi',

    'recent.title': 'Riepilogo ultimi 30 giorni',
    'recent.description': 'Le note create negli ultimi 30 giorni.',
    'recent.empty': 'Nessuna nota negli ultimi 30 giorni.',
  },
  en: {
    'app.title': 'Psychological Journal',
    'header.subtitle': 'Your daily reflections, in one place.',
    'header.export': 'Export',
    'header.settings': 'Settings',
    'header.statsCompact': '{count} entries ⭐ {avg}',
    'header.recent': 'Recent',
    'dock.theme': 'Theme',
    'dock.language': 'Language',
    'dock.language.it': 'Italian',
    'dock.language.en': 'English',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',

    'daily.entryFor': 'Entry for {date}',
    'daily.selectDate': 'Select a date',
    'daily.howFeel': 'How do you feel today?',
    'daily.selectNote': 'Select a note',
    'daily.newNote': 'New note',
    'daily.deleteNote': 'Delete note',
    'daily.deleteNote.confirm': 'Permanently delete this note? Any audio will be removed.',
    'daily.noteN': 'Note {n}',
    'daily.writePlaceholder': 'Write your thoughts, emotions and reflections here...',
    'daily.rateDay': 'Rate your day:',
    'daily.resetRating': 'Reset rating',
    'daily.saveNote': 'Save Note',
    'daily.saveEntry': 'Save Entry',
    'daily.clear': 'Clear',
    'daily.copySummaryToNote': 'Save to Note',

    'stats.title': 'Statistics',
    'stats.totalEntries': 'Total entries:',
    'stats.avgRating': 'Average rating:',
    'stats.recordings': 'Audio recordings:',
    'stats.resetAllRatings': 'Reset statistics (clear ratings)',
    'stats.resetAllRatings.confirm': 'Reset all ratings (stars) for all notes?',
    'stats.resetAllRatings.success': 'Statistics reset: all ratings have been set to 0.',
    'stats.resetAllRatings.error': 'Error while resetting statistics.',

    'audio.title': 'Voice Notes and Analysis',
    'audio.record': 'Record',
    'audio.stop': 'Stop',
    'audio.pause': 'Pause',
    'audio.resume': 'Resume',
    'audio.transcribe': 'Transcribe',
    'audio.summarize': 'Summarize',
    'audio.recordingLabel': 'Recording:',
    'audio.transcriptLabel': 'Transcript:',
    'audio.summaryLabel': 'Automatic Summary:',
    'audio.delete': 'Delete audio',
    'audio.micDenied': 'Microphone access denied. Check browser permissions.',
    'audio.noAudio': 'No audio file to transcribe.',
    'audio.noApiKey': 'Please set your OpenAI API key in settings.',
    'audio.noTranscript': 'No transcript to summarize.',
    'audio.transcribed': 'Transcription completed!',
    'audio.summarized': 'Summary completed!',

    'settings.title': 'Settings',
    'settings.description': 'Configure your OpenAI API key and models. Your API key is saved only in your browser.',
    'settings.apiKey': 'API Key',
    'settings.backendUrl': 'Backend URL',
    'settings.backendUrl.placeholder': 'https://your-api.example.com',
    'settings.transcription': 'Transcription',
    'settings.summary': 'Summary',
    'settings.systemPrompt': 'System Prompt',
    'settings.save': 'Save Changes',
    'settings.lang': 'Language',
    'settings.deleteAllAudio': 'Delete all saved audio',
    'settings.deleteAllAudio.confirm': 'Are you sure you want to delete ALL saved audio files, transcripts and summaries? This cannot be undone.',

    'export.title': 'Export Data',
    'export.description': 'Choose the format to export your journal entries.',
    'export.json': 'Export as JSON',
    'export.json.desc': 'Universal format for backups and data analysis.',
    'export.ics': 'Export to Calendar (ICS)',
    'export.ics.desc': 'Import your entries into your favorite calendar.',
    'export.cancel': 'Cancel',
    'export.includeSensitive': 'Include sensitive content/texts in export',

    'ics.calendarName': 'Psychological Journal',
    'ics.rating': 'Rating',
    'ics.none': 'None',
    'ics.content': 'Content',
    'ics.transcript': 'Transcript',
    'ics.summary': 'Summary',

    'recent.title': 'Last 30 Days',
    'recent.description': 'Notes created in the last 30 days.',
    'recent.empty': 'No notes in the last 30 days.',
  },
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dateLocale: Locale;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const storageKey = 'journal-language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('it');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as Lang | null;
      if (saved === 'en' || saved === 'it') setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(storageKey, l); } catch {}
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    const dict = translations[lang] || translations.it;
    let str = dict[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  const dateLocale = useMemo(() => (lang === 'en' ? dfEnUS : dfIt), [lang]);

  const value: I18nContextValue = useMemo(() => ({ lang, setLang, t, dateLocale }), [lang, dateLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};