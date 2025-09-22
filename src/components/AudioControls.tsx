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

// ... resto del codice invariato ...