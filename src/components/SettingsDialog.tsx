"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/i18n';

export interface Settings {
  apiKey: string;
  transcriptionModel: string;
  summaryModel: string;
  summaryPrompt?: string;
  summaryPromptIt?: string;
  summaryPromptEn?: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  onDeleteAllAudio?: () => void;
}

const defaultSummaryPromptIt = 'Analizza il testo fornito in e produci una pagina di diario psicologico giornaliero 📖🧠 in formato leggibile.\n\nLa pagina deve avere queste sezioni con titoli e contenuto in elenco puntato 📌 o paragrafi brevi:\n\nTitolo della giornata 🗓️\n\nRiepilogo 📝\n\nPunti principali ⭐\n\nEmozioni 💭💖😔🤯 (scegli in base al contesto)\n\nAzioni svolte ✅\n\nObiettivi futuri 🎯 (usa date in formato ISO 8601 se menzioni giorni relativi 📅)\n\nRiferimenti (libri, persone, eventi) 📚👥📅\n\nArgomentazioni interne (pro e contro) ⚖️\n\nArgomenti correlati 🔗\n\nAnalisi del tono emotivo 🎭\n\nRegole 📏:\n\nScrivi solo il testo della pagina, senza codice, senza JSON e senza spiegazioni extra.\n\nNon tralasciare dettagli su eventi relativi a persone e avvenimenti.\n\nNon dimenticare i nomi proprio di luoghi, persone.\n\nNon enfatizzare troppo gli eventi negativi ma promuovi una visione positiva e speranzosa.\n\nSe manca contenuto per una sezione, scrivi "Nessun contenuto trovato".\n\nMantieni il tono narrativo semplice e chiaro, come fosse un diario personale.\n\nNon prolungarti troppo in riflessioni psicologiche e non ipotizzare le emozioni provate ma concentrati sui fatti e su ciò che è stato detto.\n\nUsa meno di 2000 caratteri.';
const defaultSummaryPromptEn = 'Analyze the provided text and produce a daily psychological journal page 📖🧠 in a readable format.\n\nThe page must have these sections with titles and content in bullet points 📌 or short paragraphs:\n\nTitle of the day 🗓️\n\nSummary 📝\n\nMain points ⭐\n\nEmotions 💭💖😔🤯 (choose based on context)\n\nActions taken ✅\n\nFuture goals 🎯 (use ISO 8601 format for dates if relative days are mentioned 📅)\n\nReferences (books, people, events) 📚👥📅\n\nInternal arguments (pros and cons) ⚖️\n\nRelated topics 🔗\n\nEmotional tone analysis 🎭\n\nRules 📏:\n\nWrite only the text of the page, without code, without JSON, and without extra explanations.\n\nDo not omit details about events related to people and occurrences.\n\nDo not forget proper names of places, people.\n\nDo not overemphasize negative events but promote a positive and hopeful vision.\n\nIf content is missing for a section, write "No content found".\n\nKeep the narrative tone simple and clear, as if it were a personal diary.\n\nDo not dwell too much on psychological reflections and do not hypothesize emotions felt but focus on the facts and what was said.\n\nUse less than 2000 characters.';

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, settings, onSave, onDeleteAllAudio }) => {
  const { t, lang, setLang } = useI18n();
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  useEffect(() => {
    const migrated: Settings = {
      apiKey: settings.apiKey || '',
      transcriptionModel: settings.transcriptionModel || 'whisper-1',
      summaryModel: settings.summaryModel || 'gpt-4o-mini',
      summaryPromptIt:
        settings.summaryPromptIt ??
        (settings.summaryPrompt ? settings.summaryPrompt : defaultSummaryPromptIt),
      summaryPromptEn: settings.summaryPromptEn ?? defaultSummaryPromptEn,
      summaryPrompt: settings.summaryPrompt,
    };
    setCurrentSettings(migrated);
  }, [settings]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              {t('settings.apiKey')}
            </Label>
            <Input
              id="api-key"
              type="password"
              value={currentSettings.apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentSettings({ ...currentSettings, apiKey: e.target.value })}
              className="col-span-3"
              placeholder="sk-..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transcription-model" className="text-right">
              {t('settings.transcription')}
            </Label>
            <Select
              value={currentSettings.transcriptionModel}
              onValueChange={(value) => setCurrentSettings({ ...currentSettings, transcriptionModel: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona un modello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whisper-1">whisper-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="summary-model" className="text-right">
              {t('settings.summary')}
            </Label>
            <Select
              value={currentSettings.summaryModel}
              onValueChange={(value) => setCurrentSettings({ ...currentSettings, summaryModel: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona un modello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              {t('settings.lang')}
            </Label>
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="summary-prompt" className="text-right pt-2">
              {t('settings.systemPrompt')}
            </Label>
            <Textarea
              id="summary-prompt"
              value={
                (lang === 'en'
                  ? currentSettings.summaryPromptEn
                  : currentSettings.summaryPromptIt) || (lang === 'en' ? defaultSummaryPromptEn : defaultSummaryPromptIt)
              }
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCurrentSettings((prev) =>
                  lang === 'en'
                    ? { ...prev, summaryPromptEn: e.target.value }
                    : { ...prev, summaryPromptIt: e.target.value },
                )
              }
              className="col-span-3"
              rows={4}
              placeholder={lang === 'en' ? defaultSummaryPromptEn : defaultSummaryPromptIt}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              onClick={() => {
                const legacy =
                  lang === 'en'
                    ? currentSettings.summaryPromptEn || defaultSummaryPromptEn
                    : currentSettings.summaryPromptIt || defaultSummaryPromptIt;
                const payload: Settings = { ...currentSettings, summaryPrompt: legacy };
                onSave(payload);
                onClose();
              }}
            >
              {t('settings.save')}
            </Button>
            {onDeleteAllAudio && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const confirmed = window.confirm(t('settings.deleteAllAudio.confirm'));
                  if (confirmed) onDeleteAllAudio();
                }}
              >
                {t('settings.deleteAllAudio')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;