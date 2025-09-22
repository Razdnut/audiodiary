import OpenAI from 'openai';
import { Settings } from '@/components/SettingsDialog';
import type { Lang } from '@/i18n/i18n';

export const transcribeAudio = async (settings: Settings, audioFile: File, lang: Lang = 'it'): Promise<string> => {
  const M = {
    it: { needKey: 'La chiave API di OpenAI non è impostata.' },
    en: { needKey: 'OpenAI API key is not set.' },
  } as const;

  if (!settings.apiKey) throw new Error(M[lang].needKey);

  const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
  const response = await openai.audio.transcriptions.create({ file: audioFile, model: settings.transcriptionModel });
  return response.text;
};

export const summarizeText = async (
  settings: Settings,
  text: string,
  lang: Lang,
): Promise<string> => {
  if (!settings.apiKey) throw new Error(lang === 'en' ? 'OpenAI API key is not set.' : 'La chiave API di OpenAI non è impostata.');

  const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
  const defaultIt = 'Analizza il testo fornito in e produci una pagina di diario psicologico giornaliero 📖🧠 in formato leggibile.\n\nLa pagina deve avere queste sezioni con titoli e contenuto in elenco puntato 📌 o paragrafi brevi:\n\nTitolo della giornata 🗓️\n\nRiepilogo 📝\n\nPunti principali ⭐\n\nEmozioni 💭💖😔🤯 (scegli in base al contesto)\n\nAzioni svolte ✅\n\nObiettivi futuri 🎯 (usa date in formato ISO 8601 se menzioni giorni relativi 📅)\n\nRiferimenti (libri, persone, eventi) 📚👥📅\n\nArgomentazioni interne (pro e contro) ⚖️\n\nArgomenti correlati 🔗\n\nAnalisi del tono emotivo 🎭\n\nRegole 📏:\n\nScrivi solo il testo della pagina, senza codice, senza JSON e senza spiegazioni extra.\n\nNon tralasciare dettagli su eventi relativi a persone e avvenimenti.\n\nNon dimenticare i nomi proprio di luoghi, persone.\n\nNon enfatizzare troppo gli eventi negativi ma promuovi una visione positiva e speranzosa.\n\nSe manca contenuto per una sezione, scrivi "Nessun contenuto trovato".\n\nMantieni il tono narrativo semplice e chiaro, come fosse un diario personale.\n\nNon prolungarti troppo in riflessioni psicologiche e non ipotizzare le emozioni provate ma concentrati sui fatti e su ciò che è stato detto.\n\nUsa meno di 2000 caratteri.';
  const defaultEn = 'Analyze the provided text and produce a daily psychological journal page 📖🧠 in a readable format.\n\nThe page must have these sections with titles and content in bullet points 📌 or short paragraphs:\n\nTitle of the day 🗓️\n\nSummary 📝\n\nMain points ⭐\n\nEmotions 💭💖😔🤯 (choose based on context)\n\nActions taken ✅\n\nFuture goals 🎯 (use ISO 8601 format for dates if relative days are mentioned 📅)\n\nReferences (books, people, events) 📚👥📅\n\nInternal arguments (pros and cons) ⚖️\n\nRelated topics 🔗\n\nEmotional tone analysis 🎭\n\nRules 📏:\n\nWrite only the text of the page, without code, without JSON, and without extra explanations.\n\nDo not omit details about events related to people and occurrences.\n\nDo not forget proper names of places, people.\n\nDo not overemphasize negative events but promote a positive and hopeful vision.\n\nIf content is missing for a section, write "No content found".\n\nKeep the narrative tone simple and clear, as if it were a personal diary.\n\nDo not dwell too much on psychological reflections and do not hypothesize emotions felt but focus on the facts and what was said.\n\nUse less than 2000 characters.';
  const chosenPrompt = lang === 'en' ? (settings.summaryPromptEn || settings.summaryPrompt || defaultEn) : (settings.summaryPromptIt || settings.summaryPrompt || defaultIt);
  const response = await openai.chat.completions.create({
    model: settings.summaryModel,
    messages: [ { role: 'system', content: chosenPrompt }, { role: 'user', content: text } ],
  });
  return response.choices[0]?.message?.content || (lang === 'en' ? 'No summary generated.' : 'Nessuna sintesi generata.');
};