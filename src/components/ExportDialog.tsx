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
import { format } from 'date-fns';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: { [key: string]: JournalEntryForExport };
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, entries }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJson = () => {
    setIsExporting(true);
    try {
      const entriesArray = Object.values(entries);
      const jsonData = exportToJson(entriesArray);
      const filename = `diario-psicologico-${format(new Date(), 'yyyy-MM-dd')}.json`;
      downloadFile(jsonData, filename, 'application/json');
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
      const entriesArray = Object.values(entries);
      const icsData = await exportToIcs(entriesArray);
      const filename = `diario-psicologico-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      downloadFile(icsData, filename, 'text/calendar');
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
          <DialogTitle>Esporta Dati</DialogTitle>
          <DialogDescription>
            Scegli il formato per esportare le tue voci del diario.
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
              Esporta in JSON
            </Button>
            <p className="text-sm text-muted-foreground">
              Formato universale per backup e analisi dati.
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
              Esporta in Calendar (ICS)
            </Button>
            <p className="text-sm text-muted-foreground">
              Importa le tue voci nel calendario preferito.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;