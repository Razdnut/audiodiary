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
import { defaultSummaryPromptEn, defaultSummaryPromptIt } from '@/lib/defaultPrompts';

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

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, settings, onSave, onDeleteAllAudio }) => {
  const { t, lang, setLang } = useI18n();
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const handleLanguageChange = (value: string) => {
    if (value === 'en' || value === 'it') {
      setLang(value);
    } else {
      console.warn('Unsupported language selected', value);
    }
  };

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
            <Select value={lang} onValueChange={handleLanguageChange}>
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