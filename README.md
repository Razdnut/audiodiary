# Psychological Journal (Diario Psicologico)

A modern, privacy‑friendly journaling web app built with React, TypeScript, Vite, Tailwind, and shadcn/ui. Capture daily notes, record voice memos, transcribe and summarize them with OpenAI, export your data, and track your mood over time.

Key highlights:
- Local‑first: journal data is stored in your browser (localStorage).
- Optional AI: uses your OpenAI API key client‑side for transcription and summaries.
- Mobile‑friendly: tuned header layout and safe‑area padding for Android/iOS.
- i18n: English and Italian with language switching in the UI.

## Features

- Daily notes
  - Multiple notes per day (add, select, delete a specific note)
  - Rich text area for thoughts and reflections
  - 1–5 star rating for the day (with one‑click reset)

- Audio notes and AI
  - Record audio in the browser (Web MediaRecorder)
  - Transcribe with Whisper (`whisper-1`) using your OpenAI key
  - Summarize transcripts with GPT models (configurable)
  - Editable “System Prompt” to customize summaries’ tone and content
  - Delete a note’s audio (and all audios at once from Settings)

- Export
  - Export all notes to JSON
  - Export to ICS calendar file (one event per note) with localized titles

- Calendar and statistics
  - Calendar shows only today highlighted on first load; after you pick a date, days with entries become highlighted
  - Stats moved to the bottom of the page: total entries, average rating, number of recordings
  - Reset all ratings to zero with one click (does not delete content)

- Internationalization (i18n)
  - English and Italian translations
  - Dynamic date localization (date‑fns locales)
  - Quick language switch in the header and in Settings

- Mobile polish
  - Safe‑area insets (top/bottom) for devices with cutouts
  - Responsive, centered header — controls fit on small screens

## Screenshots

Add your screenshots here (optional):
- Calendar and daily note view


   <img width="384" height="508" alt="immagine" src="https://github.com/user-attachments/assets/d226a21a-a12b-422a-af5b-b4d3e12c668d" />

- Audio controls and AI actions

  <img width="377" height="844" alt="immagine" src="https://github.com/user-attachments/assets/4cabb175-eea4-4bd3-95b5-970b0af08578" />

- Export dialog and Settings

  <img width="392" height="344" alt="immagine" src="https://github.com/user-attachments/assets/a0d8436d-9c1b-4895-a4cb-54114e7a193b" />


## Getting Started

Prerequisites:
- Node.js 18+ and pnpm (or npm/yarn)

Install and run:

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
pnpm preview
```

## Docker

Two options are provided: run the published image from GitHub Container Registry (GHCR) or build locally.

- Pull and run from GHCR (version 1.0.0):

```bash
docker run --rm -p 8080:80 ghcr.io/razdnut/audiodiary:1.0.0
# Then open http://localhost:8080
```

- Build and run locally:

```bash
docker build -t audiodiary:local .
docker run --rm -p 8080:80 audiodiary:local
```

## Docker Compose

Use the included compose file to build and run:

```bash
docker compose up --build
# Open http://localhost:8080
```

## OpenAI Setup (Optional)

All AI functionality runs in the browser. Open Settings and paste your OpenAI API key. You can choose:
- Transcription model: `whisper-1`
- Summary model: e.g., `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`
- System Prompt: customize how summaries are generated

Important: this app uses `dangerouslyAllowBrowser: true` in the OpenAI client. Do not use a production key without a trusted backend. Consider proxying requests in production.

## Data Storage and Privacy

- Notes, ratings, transcripts, summaries, and simple flags are stored in `localStorage`.
- Audio is recorded as a Blob and referenced via a temporary Object URL (blob:). As such, audio blobs are not reliably persisted across page reloads or different sessions. Use Export to save your content or a proper storage backend if you need permanent audio storage.
- You can delete audio per note or delete all audio (and related transcripts/summaries) from Settings.

## Internationalization

- The app supports Italian and English.
- Switch language from the header selector or within Settings.
- Date formatting adapts automatically via `date-fns` locales.

## Exporting

- JSON: Exports all notes as an array (date, content, rating, transcript, summary, audioUrl).
- ICS: Creates calendar events (18:00–18:30 by default) for each note.
  - Titles and calendar name are localized.

## Keyboard and UX Tips

- Save Entry: saves the currently selected note for the selected day.
- New note: creates a new blank note for the day and switches to it.
- Delete note: removes just the selected note.
- Clear: clears the current form values (does not delete saved entries until you Save).

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + Radix UI
- date‑fns for date formatting and locales
- ics for calendar export

## Project Structure

- `src/pages/DailyJournal.tsx` — main journal UI and logic (calendar, notes, stats)
- `src/components/AudioControls.tsx` — recording, transcribing, summarizing, and audio UI
- `src/components/SettingsDialog.tsx` — API key, models, system prompt, language, delete all audio
- `src/components/ExportDialog.tsx` — export to JSON/ICS
- `src/i18n/i18n.tsx` — i18n provider, translations, and date locales
- `src/services/openai.ts` — OpenAI calls (transcription and summaries)
- `src/utils/export-utils.ts` — JSON/ICS export helpers

## Roadmap Ideas

- Persistent audio storage (IndexedDB or backend upload)
- Per‑note tags and search
- Charts and insights for mood tracking over time

## License

MIT — see [LICENSE](./LICENSE) for details.
