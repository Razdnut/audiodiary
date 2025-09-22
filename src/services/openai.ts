import OpenAI from 'openai';
import { Settings } from '@/components/SettingsDialog';
import { Capacitor } from '@capacitor/core';
import type { Lang } from '@/i18n/i18n';

export const transcribeAudio = async (settings: Settings, audioFile: File): Promise<string> => {
  // Prefer backend if configured
  if (settings.backendUrl && settings.backendUrl.trim()) {
    const url = settings.backendUrl.replace(/\/$/, '') + '/transcribe';
    const form = new FormData();
    form.append('file', audioFile);
    form.append('model', settings.transcriptionModel);
    const res = await fetch(url, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Transcribe backend error');
    const data = await res.json();
    return data.text || data.transcript || '';
  }
  if (!settings.allowClientOpenAI) {
    throw new Error('Per motivi di sicurezza, configura un Backend URL nelle impostazioni per usare la trascrizione.');
  }
  if (!settings.apiKey) {
    throw new Error('La chiave API di OpenAI non è impostata.');
  }
  const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
  const response = await openai.audio.transcriptions.create({ file: audioFile, model: settings.transcriptionModel });
  return response.text;
};

export const summarizeText = async (
  settings: Settings,
  text: string,
  lang: Lang,
): Promise<string> => {
  // Prefer backend if configured
  if (settings.backendUrl && settings.backendUrl.trim()) {
    const url = settings.backendUrl.replace(/\/$/, '') + '/summarize';
    const defaultIt = 'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.';
    const defaultEn = 'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.';
    const prompt = lang === 'en' ? (settings.summaryPromptEn || settings.summaryPrompt || defaultEn) : (settings.summaryPromptIt || settings.summaryPrompt || defaultIt);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: settings.summaryModel, prompt, text, lang }),
    });
    if (!res.ok) throw new Error('Summarize backend error');
    const data = await res.json();
    return data.text || data.summary || '';
  }
  if (!settings.allowClientOpenAI) {
    throw new Error('Per motivi di sicurezza, configura un Backend URL nelle impostazioni per usare la sintesi.');
  }
  if (!settings.apiKey) {
    throw new Error('La chiave API di OpenAI non è impostata.');
  }
  const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
  const defaultIt = 'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.';
  const defaultEn = 'You are an assistant that concisely and insightfully summarizes entries from a psychological journal. Extract the main themes, emotions and key reflections in a few sentences.';
  const chosenPrompt = lang === 'en' ? (settings.summaryPromptEn || settings.summaryPrompt || defaultEn) : (settings.summaryPromptIt || settings.summaryPrompt || defaultIt);
  const response = await openai.chat.completions.create({
    model: settings.summaryModel,
    messages: [ { role: 'system', content: chosenPrompt }, { role: 'user', content: text } ],
  });
  return response.choices[0]?.message?.content || 'Nessuna sintesi generata.';
};
