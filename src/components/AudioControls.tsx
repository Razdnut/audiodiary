"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, FileText, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Settings } from './SettingsDialog';
import { transcribeAudio, summarizeText } from '@/services/openai';
import { showError, showSuccess } from '@/utils/toast';
import { Label } from './ui/label';
import { useI18n } from '@/i18n/i18n';

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
  const { t, lang } = useI18n();
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
        showError(t('audio.micDenied'));
        console.error("Errore accesso al microfono:", err);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      showError(t('audio.noAudio'));
      return;
    }
    if (!settings.apiKey) {
      showError(t('audio.noApiKey'));
      return;
    }

    setIsLoading('transcribe');
    try {
      const transcriptText = await transcribeAudio(settings, audioFile);
      onUpdate({ transcript: transcriptText });
      showSuccess(t('audio.transcribed'));
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) {
      showError(t('audio.noTranscript'));
      return;
    }
     if (!settings.apiKey) {
      showError(t('audio.noApiKey'));
      return;
    }

    setIsLoading('summarize');
    try {
      const fallbackPrompt =
        lang === 'en'
          ? 'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.'
          : 'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.';
      const summaryText = await summarizeText(settings, transcript, fallbackPrompt);
      onUpdate({ summary: summaryText });
      showSuccess(t('audio.summarized'));
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteAudio = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(audioUrl); } catch {}
    }
    onUpdate({ audioUrl: undefined, transcript: undefined, summary: undefined, audioFile: undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('audio.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={handleToggleRecording} disabled={disabled || isLoading !== null} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? (
              <><Square className="mr-2 h-4 w-4" /> {t('audio.stop')}</>
            ) : (
              <><Mic className="mr-2 h-4 w-4" /> {t('audio.record')}</>
            )}
          </Button>
          <Button onClick={handleTranscribe} disabled={!audioFile || isLoading !== null || disabled}>
            {isLoading === 'transcribe' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {t('audio.transcribe')}
          </Button>
          <Button onClick={handleSummarize} disabled={!transcript || isLoading !== null || disabled}>
            {isLoading === 'summarize' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('audio.summarize')}
          </Button>
        </div>

        {audioUrl && !isRecording && (
          <div>
            <Label className="text-sm font-medium mb-1 text-muted-foreground">{t('audio.recordingLabel')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <audio controls src={audioUrl} className="w-full h-10" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDeleteAudio}
                title={t('audio.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {transcript && (
          <div>
            <Label className="text-sm font-medium mb-1">{t('audio.transcriptLabel')}</Label>
            <Textarea value={transcript} readOnly className="bg-background mt-1" rows={4} />
          </div>
        )}

        {summary && (
          <div>
            <Label className="text-sm font-medium mb-1">{t('audio.summaryLabel')}</Label>
            <Textarea value={summary} readOnly className="bg-background mt-1" rows={3} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioControls;
