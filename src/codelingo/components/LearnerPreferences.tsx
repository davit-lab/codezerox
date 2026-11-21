import {createContext} from 'react';
import {defaultLearner} from '../lib/learner';
export const LearnerContext=createContext(defaultLearner());
