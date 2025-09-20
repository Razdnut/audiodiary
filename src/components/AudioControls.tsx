"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AudioControlsProps {
  audioUrl: string | undefined;
  transcript: string | undefined;
  summary: string | undefined;
  onUpdate: (updates: { audioUrl?: string; transcript?: string; summary?: string }) => void;
  disabled: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioUrl,
  transcript,
  summary,
  onUpdate,
  disabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState<'transcribe' | 'summarize' | null>(null);

  // Questa è una simulazione. In un'app reale, useresti l'API MediaRecorder.
  const handleToggleRecording = () => {
    if (isRecording) {
      // Ferma la registrazione
      setIsRecording(false);
      // Simula l'ottenimento di un URL blob
      const fakeAudioUrl = '/fake-audio.mp3'; 
      onUpdate({ audioUrl: fakeAudioUrl });
    } else {
      // Inizia la registrazione
      setIsRecording(true);
      // Pulisce i dati audio precedenti
      onUpdate({ audioUrl: undefined, transcript: undefined, summary: undefined });
    }
  };

  const handleTranscribe = () => {
    setIsLoading('transcribe');
    setTimeout(() => {
      const fakeTranscript = "Questo è un testo di trascrizione simulato. L'utente ha parlato della sua giornata, menzionando una passeggiata e un incontro interessante. Il tono sembrava riflessivo.";
      onUpdate({ transcript: fakeTranscript });
      setIsLoading(null);
    }, 2000); // Simula una chiamata API
  };

  const handleSummarize = () => {
    setIsLoading('summarize');
    setTimeout(() => {
      const fakeSummary = "Sintesi: La giornata è stata caratterizzata da una passeggiata riflessiva e un incontro degno di nota.";
      onUpdate({ summary: fakeSummary });
      setIsLoading(null);
    }, 2000); // Simula una chiamata API
  };

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg">Note Vocali e Analisi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={handleToggleRecording} disabled={disabled || isLoading !== null} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" /> Ferma
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Registra
              </>
            )}
          </Button>
          <Button onClick={handleTranscribe} disabled={!audioUrl || isLoading !== null || disabled}>
            {isLoading === 'transcribe' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Trascrivi
          </Button>
          <Button onClick={handleSummarize} disabled={!transcript || isLoading !== null || disabled}>
            {isLoading === 'summarize' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Sintetizza
          </Button>
        </div>

        {audioUrl && !isRecording && (
          <div>
            <p className="text-sm font-medium mb-1 text-gray-600">Registrazione:</p>
            <audio controls src={audioUrl} className="w-full h-10">
              Il tuo browser non supporta l'elemento audio.
            </audio>
            <p className="text-xs text-gray-500 mt-1">Nota: Questo è un file audio fittizio per la demo.</p>
          </div>
        )}

        {transcript && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Trascrizione:</label>
            <Textarea value={transcript} readOnly className="bg-white" rows={4} />
          </div>
        )}

        {summary && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Sintesi Automatica:</label>
            <Textarea value={summary} readOnly className="bg-white" rows={3} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioControls;