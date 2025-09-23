"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, FileText, Sparkles, Loader2, Trash2, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Settings } from './SettingsDialog';
import { transcribeAudio, summarizeText } from '@/services/openai';
import { showError, showSuccess } from '@/utils/toast';
import { Label } from './ui/label';
import { useI18n } from '@/i18n/i18n';
import { Capacitor } from '@capacitor/core';

interface AudioControlsProps {
  audioUrl: string | undefined;
  transcript: string | undefined;
  summary: string | undefined;
  onUpdate: (updates: { audioUrl?: string; transcript?: string; summary?: string; audioFile?: File }) => void;
  disabled: boolean;
  settings: Settings;
  audioFile: File | undefined;
  onCopySummaryToNote?: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioUrl,
  transcript,
  summary,
  onUpdate,
  disabled,
  settings,
  audioFile,
  onCopySummaryToNote,
}) => {
  const { t, lang } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState<'transcribe' | 'summarize' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canPause, setCanPause] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isMediaRecorderSupported =
    typeof window !== 'undefined'
    && 'MediaRecorder' in window
    && typeof navigator.mediaDevices?.getUserMedia === 'function';

  const startFallbackFileCapture = () => {
    try {
      fileInputRef.current?.click();
    } catch (error) {
      showError(t('audio.micDenied'));
      console.error('Fallback audio capture failed', error);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === 'paused') {
        try {
          recorder.resume();
        } catch (resumeError: unknown) {
          console.warn('Failed to resume recorder before stopping', resumeError);
        }
      }
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setIsPaused(false);
      setCanPause(false);
    } else {
      if (!isMediaRecorderSupported) {
        // WebView/device doesn't support MediaRecorder → fallback to native file capture
        setIsPaused(false);
        setCanPause(false);
        startFallbackFileCapture();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Pick a supported mime type when possible
        let options: MediaRecorderOptions | undefined;
        const mediaRecorderCtor =
          typeof window !== 'undefined' && 'MediaRecorder' in window
            ? (window.MediaRecorder as typeof MediaRecorder)
            : undefined;

        if (mediaRecorderCtor && typeof mediaRecorderCtor.isTypeSupported === 'function') {
          if (mediaRecorderCtor.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
          } else if (mediaRecorderCtor.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (mediaRecorderCtor.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          }
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options);
        audioChunksRef.current = [];

        const supportsPause =
          typeof mediaRecorderRef.current.pause === 'function' &&
          typeof mediaRecorderRef.current.resume === 'function';
        setCanPause(supportsPause);
        setIsPaused(false);

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blobType = options?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          const fileExt = blobType.includes('mp4') ? 'm4a' : 'webm';
          const newAudioFile = new File([audioBlob], `recording.${fileExt}`, { type: blobType });
          const audioUrl = URL.createObjectURL(audioBlob);
          onUpdate({ audioUrl, audioFile: newAudioFile, transcript: undefined, summary: undefined });
          stream.getTracks().forEach(track => track.stop()); // Stop microphone access
          setIsRecording(false);
          setIsPaused(false);
          setCanPause(false);
          mediaRecorderRef.current = null;
        };

        mediaRecorderRef.current.onpause = () => {
          setIsPaused(true);
        };

        mediaRecorderRef.current.onresume = () => {
          setIsPaused(false);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        onUpdate({ audioUrl: undefined, transcript: undefined, summary: undefined, audioFile: undefined });
      } catch (err: unknown) {
        // If permission is denied or recording not supported, try fallback capture on Android
        const name = err instanceof Error ? err.name : '';
        console.warn('getUserMedia/MediaRecorder error:', name, err);
        const shouldFallback =
          Capacitor.isNativePlatform()
          || name === 'NotAllowedError'
          || name === 'NotFoundError'
          || name === 'NotSupportedError';
        if (shouldFallback) {
          setIsPaused(false);
          setCanPause(false);
          startFallbackFileCapture();
        } else {
          showError(t('audio.micDenied'));
        }
        setIsRecording(false);
        setIsPaused(false);
        setCanPause(false);
      }
    }
  };

  const handlePauseResume = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !canPause) {
      return;
    }

    try {
      if (recorder.state === 'paused') {
        recorder.resume();
      } else if (recorder.state === 'recording') {
        recorder.pause();
      }
    } catch (error) {
      console.error('Failed to toggle recorder pause state', error);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      onUpdate({ audioUrl: url, audioFile: file, transcript: undefined, summary: undefined });
    } catch (err: unknown) {
      console.error('Failed to load selected audio file', err);
      showError(t('audio.micDenied'));
    } finally {
      setIsRecording(false);
      setIsPaused(false);
      setCanPause(false);
      // reset input so selecting the same file again triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      const transcriptText = await transcribeAudio(settings, audioFile, lang);
      onUpdate({ transcript: transcriptText });
      showSuccess(t('audio.transcribed'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('audio.micDenied');
      showError(message);
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
      const summaryText = await summarizeText(settings, transcript, lang);
      onUpdate({ summary: summaryText });
      showSuccess(t('audio.summarized'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('audio.micDenied');
      showError(message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteAudio = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (error) {
        console.warn('Failed to revoke audio URL', error);
      }
    }
    setIsPaused(false);
    setCanPause(false);
    setIsRecording(false);
    onUpdate({ audioUrl: undefined, transcript: undefined, summary: undefined, audioFile: undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('audio.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden input used as Android fallback when MediaRecorder/getUserMedia is unavailable */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          capture="user"
          className="hidden"
          onChange={handleFileSelected}
        />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Button onClick={handleToggleRecording} disabled={disabled || isLoading !== null} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? (
              <><Square className="mr-2 h-4 w-4" /> {t('audio.stop')}</>
            ) : (
              <><Mic className="mr-2 h-4 w-4" /> {t('audio.record')}</>
            )}
          </Button>
          <Button
            onClick={handlePauseResume}
            disabled={!isRecording || !canPause || isLoading !== null || disabled}
            variant={isPaused ? "default" : "secondary"}
          >
            {isPaused ? (
              <><Play className="mr-2 h-4 w-4" /> {t('audio.resume')}</>
            ) : (
              <><Pause className="mr-2 h-4 w-4" /> {t('audio.pause')}</>
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
            <div className="mt-2">
              <Button
                type="button"
                onClick={() => onCopySummaryToNote && onCopySummaryToNote()}
                disabled={disabled || !summary}
              >
                {t('daily.copySummaryToNote')}
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