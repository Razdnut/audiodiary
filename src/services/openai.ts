import OpenAI from 'openai';
import { Settings } from '@/components/SettingsDialog';

export const transcribeAudio = async (settings: Settings, audioFile: File): Promise<string> => {
  if (!settings.apiKey) {
    throw new Error('La chiave API di OpenAI non è impostata.');
  }

  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true, // Attenzione: non usare in produzione senza un backend
  });

  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: settings.transcriptionModel,
    });
    return response.text;
  } catch (error) {
    console.error('Errore durante la trascrizione:', error);
    throw new Error('Trascrizione fallita. Controlla la console per i dettagli.');
  }
};

export const summarizeText = async (
  settings: Settings,
  text: string,
  fallbackPrompt?: string,
): Promise<string> => {
  if (!settings.apiKey) {
    throw new Error('La chiave API di OpenAI non è impostata.');
  }

  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true, // Attenzione: non usare in produzione senza un backend
  });

  try {
    const response = await openai.chat.completions.create({
      model: settings.summaryModel,
      messages: [
        {
          role: 'system',
          content:
            settings.summaryPrompt ||
            fallbackPrompt ||
            'Sei un assistente che riassume in modo conciso e perspicace le voci di un diario psicologico. Estrai i temi principali, le emozioni e le riflessioni chiave in poche frasi.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });
    return response.choices[0]?.message?.content || 'Nessuna sintesi generata.';
  } catch (error) {
    console.error('Errore durante la sintesi:', error);
    throw new Error('Sintesi fallita. Controlla la console per i dettagli.');
  }
};
