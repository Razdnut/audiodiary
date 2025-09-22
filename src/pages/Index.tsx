import DailyJournal from "./DailyJournal";
import { useI18n } from "@/i18n/i18n";

export default function Index() {
  useI18n();
  return (
    <main className="min-h-screen">
      <DailyJournal />
    </main>
  );
}
