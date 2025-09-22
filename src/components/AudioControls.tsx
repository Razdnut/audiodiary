"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Settings } from './SettingsDialog';
import { transcribeAudio, summarizeText } from '@/services/openai';
import { showError, showSuccess } from '@/utils/toast';
import { Label } from './ui/label';

interface AudioControlsProps {
  audioUrl: string | undefined;
  transcript: string | undefined;
  summary: string | undefined;
  onUpdate: (updates: { audioUrl?: string; transcript?: string; summary?: string; audioFile?: File }) => void;
  disabled: boolean;
  settings: Settings;
  audioFile: File | undefined;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioUrl,
  transcript,
  summary,
  onUpdate,
  disabled,
  settings,
  audioFile,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState<'transcribe' | 'summarize' | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const newAudioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          onUpdate({ audioUrl, audioFile: newAudioFile, transcript: undefined, summary: undefined });
          stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        onUpdate({ audioUrl: undefined, transcript: undefined, summary: undefined, audioFile: undefined });
      } catch (err) {
        showError("Accesso al microfono negato. Controlla i permessi del browser.");
        console.error("Errore accesso al microfono:", err);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      showError("Nessun file audio da trascrivere.");
      return;
    }
    if (!settings.apiKey) {
      showError("Per favore, imposta la tua chiave API di OpenAI nelle impostazioni.");
      return;
    }

    setIsLoading('transcribe');
    try {
      const transcriptText = await transcribeAudio(settings, audioFile);
      onUpdate({ transcript: transcriptText });
      showSuccess("Trascrizione completata!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) {
      showError("Nessuna trascrizione da sintetizzare.");
      return;
    }
     if (!settings.apiKey) {
      showError("Per favore, imposta la tua chiave API di OpenAI nelle impostazioni.");
      return;
    }

    setIsLoading('summarize');
    try {
      const summaryText = await summarizeText(settings, transcript);
      onUpdate({ summary: summaryText });
      showSuccess("Sintesi completata!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Note Vocali e Analisi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={handleToggleRecording} disabled={disabled || isLoading !== null} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? (
              <><Square className="mr-2 h-4 w-4" /> Ferma</>
            ) : (
              <><Mic className="mr-2 h-4 w-4" /> Registra</>
            )}
          </Button>
          <Button onClick={handleTranscribe} disabled={!audioFile || isLoading !== null || disabled}>
            {isLoading === 'transcribe' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Trascrivi
          </Button>
          <Button onClick={handleSummarize} disabled={!transcript || isLoading !== null || disabled}>
            {isLoading === 'summarize' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Sintetizza
          </Button>
        </div>

        {audioUrl && !isRecording && (
          <div>
            <Label className="text-sm font-medium mb-1 text-muted-foreground">Registrazione:</Label>
            <audio controls src={audioUrl} className="w-full h-10 mt-1" />
          </div>
        )}

        {transcript && (
          <div>
            <Label className="text-sm font-medium mb-1">Trascrizione:</Label>
            <Textarea value={transcript} readOnly className="bg-background mt-1" rows={4} />
          </div>
        )}

        {summary && (
          <div>
            <Label className="text-sm font-medium mb-1">Sintesi Automatica:</Label>
            <Textarea value={summary} readOnly className="bg-background mt-1" rows={3} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioControls;