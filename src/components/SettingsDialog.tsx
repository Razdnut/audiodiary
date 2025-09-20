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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Settings {
  apiKey: string;
  transcriptionModel: string;
  summaryModel: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Impostazioni</DialogTitle>
          <DialogDescription>
            Configura la tua chiave API di OpenAI e i modelli da utilizzare. La tua chiave API è salvata solo nel tuo browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={currentSettings.apiKey}
              onChange={(e) => setCurrentSettings({ ...currentSettings, apiKey: e.target.value })}
              className="col-span-3"
              placeholder="sk-..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transcription-model" className="text-right">
              Trascrizione
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
              Sintesi
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
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salva Modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;