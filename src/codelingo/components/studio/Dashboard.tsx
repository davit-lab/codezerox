import Avatar from '../Avatar';
import LearningCoach from '../LearningCoach';
import {useState} from 'react';
import {Check,LockKeyhole,Play,ArrowRight,BookOpen,Target,Star,Code2} from 'lucide-react';
import {lessons,modules} from '../../lib/curriculum';
import {canOpen,dayKey} from '../../lib/progress';
import {skillLabs,labKey} from '../../lib/skill-labs';
import {terms} from '../../lib/terms';
import type {Progress} from '../../lib/types';

export default function Dashboard({p}:{p:Progress}) {
