"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Calendar, FileText } from 'lucide-react';
import { exportToJson, exportToIcs, downloadFile, JournalEntryForExport } from '@/utils/export-utils';
import { shareContent } from '@/utils/native-share';
import { format } from 'date-fns';
import { useI18n } from '@/i18n/i18n';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntryForExport[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, entries }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { t, lang } = useI18n();

  const handleExportJson = () => {
    setIsExporting(true);
    try {
      const jsonData = exportToJson(entries);
      const filename = `diario-psicologico-${format(new Date(), 'yyyy-MM-dd')}.json`;
      // Try native share first (Android/iOS); fallback to browser download
      shareContent(jsonData, filename, 'application/json').then(shared => {
        if (!shared) downloadFile(jsonData, filename, 'application/json');
      });
    } catch (error) {
      console.error('Errore durante l\'esportazione JSON:', error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportIcs = async () => {
    setIsExporting(true);
    try {
      const icsData = await exportToIcs(entries, lang);
      const filename = `${lang === 'en' ? 'psychological-journal' : 'diario-psicologico'}-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      const mime = 'text/calendar';
      const shared = await shareContent(icsData, filename, mime);
      if (!shared) downloadFile(icsData, filename, mime);
    } catch (error) {
      console.error('Errore durante l\'esportazione ICS:', error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>
            {t('export.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleExportJson} 
              disabled={isExporting}
              variant="outline"
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('export.json')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('export.json.desc')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleExportIcs} 
              disabled={isExporting}
              variant="outline"
              className="justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t('export.ics')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('export.ics.desc')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('export.cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
