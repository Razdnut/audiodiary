"use client";

import React, { useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Stepper, { Step } from '@/components/ui/reactbits-stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Settings } from '@/components/SettingsDialog';
import { useI18n, Lang } from '@/i18n/i18n';
import { defaultSummaryPromptEn, defaultSummaryPromptIt } from '@/lib/defaultPrompts';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onComplete: (settings: Settings) => void;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, onOpenChange, settings, onComplete }) => {
  const { t, lang } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [promptIt, setPromptIt] = useState(settings.summaryPromptIt || settings.summaryPrompt || defaultSummaryPromptIt);
  const [promptEn, setPromptEn] = useState(settings.summaryPromptEn || defaultSummaryPromptEn);
  const [promptTab, setPromptTab] = useState<Lang>(lang);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setApiKey(settings.apiKey || '');
      setPromptIt(settings.summaryPromptIt || settings.summaryPrompt || defaultSummaryPromptIt);
      setPromptEn(settings.summaryPromptEn || defaultSummaryPromptEn);
      setPromptTab(lang);
      setSessionKey(prev => prev + 1);
    }
  }, [open, settings.apiKey, settings.summaryPrompt, settings.summaryPromptEn, settings.summaryPromptIt, lang]);

  const trimmedApiKey = useMemo(() => apiKey.trim(), [apiKey]);
  const sanitizedPromptIt = promptIt.trim().length > 0 ? promptIt : defaultSummaryPromptIt;
  const sanitizedPromptEn = promptEn.trim().length > 0 ? promptEn : defaultSummaryPromptEn;
  const isNextDisabled = currentStep === 2 && trimmedApiKey.length === 0;

  const handleComplete = () => {
    const summaryPrompt = lang === 'en' ? sanitizedPromptEn : sanitizedPromptIt;
    onComplete({
      ...settings,
      apiKey: trimmedApiKey,
      summaryPromptIt: sanitizedPromptIt,
      summaryPromptEn: sanitizedPromptEn,
      summaryPrompt,
    });
    onOpenChange(false);
  };

  const handleResetPrompt = () => {
    if (promptTab === 'en') {
      setPromptEn(defaultSummaryPromptEn);
    } else {
      setPromptIt(defaultSummaryPromptIt);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('onboarding.title')}</DialogTitle>
          <DialogDescription>{t('onboarding.description')}</DialogDescription>
        </DialogHeader>

        <Stepper
          key={sessionKey}
          initialStep={1}
          onStepChange={setCurrentStep}
          onFinalStepCompleted={handleComplete}
          nextButtonText={t('onboarding.next')}
          backButtonText={t('onboarding.back')}
          completeButtonText={t('onboarding.finish')}
          nextButtonProps={{ disabled: isNextDisabled }}
          className="bg-background"
        >
          <Step>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t('onboarding.introTitle')}</h3>
              <p className="text-muted-foreground">{t('onboarding.introDescription')}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>{t('onboarding.introPoint1')}</li>
                <li>{t('onboarding.introPoint2')}</li>
                <li>{t('onboarding.introPoint3')}</li>
              </ul>
            </div>
          </Step>

          <Step>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onboarding-api-key">{t('onboarding.apiKeyTitle')}</Label>
                <Input
                  id="onboarding-api-key"
                  type="password"
                  value={apiKey}
                  onChange={event => setApiKey(event.target.value)}
                  placeholder="sk-..."
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">{t('onboarding.apiKeyHelp')}</p>
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t('onboarding.promptTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('onboarding.promptDescription')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetPrompt}>
                  {t('onboarding.resetPrompt')}
                </Button>
              </div>

              <Tabs value={promptTab} onValueChange={value => setPromptTab(value as Lang)} className="space-y-4">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="it" className="flex-1 sm:flex-none">
                    {t('onboarding.langIt')}
                  </TabsTrigger>
                  <TabsTrigger value="en" className="flex-1 sm:flex-none">
                    {t('onboarding.langEn')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="it" className="space-y-2">
                  <Textarea
                    value={promptIt}
                    onChange={event => setPromptIt(event.target.value)}
                    rows={8}
                  />
                </TabsContent>
                <TabsContent value="en" className="space-y-2">
                  <Textarea
                    value={promptEn}
                    onChange={event => setPromptEn(event.target.value)}
                    rows={8}
                  />
                </TabsContent>
              </Tabs>

              <p className="text-xs text-muted-foreground">{t('onboarding.promptNote')}</p>
            </div>
          </Step>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
