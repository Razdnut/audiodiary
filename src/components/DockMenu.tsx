import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Check,
  Download,
  FileClock,
  Languages,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

interface DockMenuProps {
  statsSummary: string;
  totalEntries: number;
  averageRating: string;
  audioRecordings: number;
  onOpenExport: () => void;
  onOpenSettings: () => void;
}

const dockButtonClass =
  "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-primary/80 via-primary/70 to-primary/60 text-primary-foreground shadow-[0_20px_40px_-24px_rgba(37,99,235,0.9)] transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_20px_55px_-25px_rgba(37,99,235,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const DockMenu: React.FC<DockMenuProps> = ({
  statsSummary,
  totalEntries,
  averageRating,
  audioRecordings,
  onOpenExport,
  onOpenSettings,
}) => {
  const { t, lang, setLang } = useI18n();
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderTooltip = (label: string) => (
    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 group-hover:-translate-y-2 group-hover:opacity-100">
      {label}
    </span>
  );

  return (
    <div className="flex w-full justify-center sm:w-auto sm:justify-end">
      <div className="flex items-end gap-3 rounded-[28px] border border-white/10 bg-background/70 px-4 py-3 shadow-[0_25px_60px_-30px_rgba(15,118,110,0.45)] backdrop-blur-xl dark:border-white/5">
        <div className="hidden min-w-[200px] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 via-background to-background/60 px-5 py-4 shadow-inner sm:flex">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("stats.title")}
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">{statsSummary}</div>
          <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
            <p>
              {t("stats.totalEntries")} {" "}
              <span className="font-semibold text-foreground">{totalEntries}</span>
            </p>
            <p>
              {t("stats.avgRating")} {" "}
              <span className="font-semibold text-foreground">{averageRating}</span>
            </p>
            <p>
              {t("stats.recordings")} {" "}
              <span className="font-semibold text-foreground">{audioRecordings}</span>
            </p>
          </div>
        </div>

        <div className="group relative flex items-end">
          {renderTooltip(t("header.recent"))}
          <Link
            to="/recent"
            className={cn(
              dockButtonClass,
              "bg-gradient-to-br from-sky-500/90 via-sky-500/80 to-sky-600/75"
            )}
          >
            <FileClock className="h-5 w-5" />
            <span className="sr-only">{t("header.recent")}</span>
          </Link>
        </div>

        <div className="group relative flex items-end">
          {renderTooltip(t("header.export"))}
          <button
            type="button"
            onClick={onOpenExport}
            className={cn(
              dockButtonClass,
              "bg-gradient-to-br from-emerald-500/90 via-emerald-500/80 to-emerald-600/75"
            )}
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">{t("header.export")}</span>
          </button>
        </div>

        <div className="group relative flex items-end">
          {renderTooltip(t("header.settings"))}
          <button
            type="button"
            onClick={onOpenSettings}
            className={cn(
              dockButtonClass,
              "bg-gradient-to-br from-purple-500/90 via-purple-500/80 to-purple-600/75"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t("header.settings")}</span>
          </button>
        </div>

        <div className="group relative flex items-end">
          {renderTooltip(t("dock.theme"))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  dockButtonClass,
                  "relative overflow-hidden bg-gradient-to-br from-amber-500/90 via-amber-500/80 to-orange-500/75"
                )}
              >
                <Sun
                  className={cn(
                    "h-5 w-5 text-white transition-all",
                    mounted && resolvedTheme === "dark"
                      ? "translate-y-5 opacity-0"
                      : "translate-y-0 opacity-100"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute h-5 w-5 text-white transition-all",
                    mounted && resolvedTheme === "dark"
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-5 opacity-0"
                  )}
                />
                <span className="sr-only">{t("dock.theme")}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                {t("theme.light")}
                {mounted && theme === "light" ? <Check className="ml-auto h-4 w-4" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                {t("theme.dark")}
                {mounted && theme === "dark" ? <Check className="ml-auto h-4 w-4" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                {t("theme.system")}
                {mounted && theme === "system" ? <Check className="ml-auto h-4 w-4" /> : null}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="group relative flex items-end">
          {renderTooltip(t("dock.language"))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  dockButtonClass,
                  "flex-col bg-gradient-to-br from-indigo-500/90 via-indigo-500/80 to-indigo-600/75 text-sm font-semibold"
                )}
              >
                <Languages className="mb-0.5 h-4 w-4" />
                <span>{lang.toUpperCase()}</span>
                <span className="sr-only">{t("dock.language")}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => setLang("it")}>
                {t("dock.language.it")}
                {lang === "it" ? <Check className="ml-auto h-4 w-4" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")}>
                {t("dock.language.en")}
                {lang === "en" ? <Check className="ml-auto h-4 w-4" /> : null}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DockMenu;
