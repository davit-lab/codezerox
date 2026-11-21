import { createContext, useContext } from 'react';
import { defaultLearning } from '../lib/progress';
import type { LearningPreferences } from '../lib/types';
export const PreferencesContext=createContext<LearningPreferences>(defaultLearning);
export const useLearningPreferences=()=>useContext(PreferencesContext);
