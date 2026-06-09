/**
 * Notification sound system using Web Audio API
 * Generates melodic tones for different app events
 */

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

const playNote = (
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number = 0.15,
  type: OscillatorType = 'sine'
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
};

type SoundType = 
  | 'message'        // New chat message received
  | 'messageSent'    // Chat message sent
  | 'gift'           // Gift received
  | 'purchase'       // Book purchased
  | 'success'        // Generic success (save, upload, etc.)
  | 'xp'             // XP earned
  | 'notification'   // General notification
  | 'error';         // Error

const SOUND_SEQUENCES: Record<SoundType, { notes: [number, number, number][]; type?: OscillatorType }> = {
  // Warm ascending two-note chime — C5 → E5
  message: {
    notes: [
      [523.25, 0, 0.25],    // C5
      [659.25, 0.12, 0.3],  // E5
    ],
  },
  // Quick soft tap — single G5
  messageSent: {
    notes: [
      [783.99, 0, 0.12],  // G5
    ],
  },
  // Magical ascending arpeggio — C5 → E5 → G5 → C6
  gift: {
    notes: [
      [523.25, 0, 0.3],     // C5
      [659.25, 0.1, 0.3],   // E5
      [783.99, 0.2, 0.3],   // G5
      [1046.50, 0.3, 0.5],  // C6
    ],
  },
  // Triumphant — G4 → B4 → D5 → G5
  purchase: {
    notes: [
      [392.00, 0, 0.2],     // G4
      [493.88, 0.1, 0.2],   // B4
      [587.33, 0.2, 0.25],  // D5
      [783.99, 0.3, 0.45],  // G5
    ],
  },
  // Warm resolve — E5 → G5
  success: {
    notes: [
      [659.25, 0, 0.2],   // E5
      [783.99, 0.1, 0.35], // G5
    ],
  },
  // Playful XP pop — C6 → E6 (higher pitch, short)
  xp: {
    notes: [
      [1046.50, 0, 0.12],  // C6
      [1318.51, 0.08, 0.2], // E6
    ],
    type: 'triangle' as OscillatorType,
  },
  // Standard notification bell — A5 → C#6 → E6
  notification: {
    notes: [
      [880.00, 0, 0.2],     // A5
      [1108.73, 0.12, 0.25], // C#6
      [1318.51, 0.24, 0.35], // E6
    ],
  },
  // Descending minor — E5 → C5
  error: {
    notes: [
      [659.25, 0, 0.2],   // E5
      [523.25, 0.15, 0.3], // C5
    ],
  },
};

export const playSound = (sound: SoundType) => {
  try {
    const ctx = getAudioContext();
    const sequence = SOUND_SEQUENCES[sound];
    if (!sequence) return;
    
    const now = ctx.currentTime;
    const oscType = sequence.type || 'sine';
    
    for (const [freq, offset, duration] of sequence.notes) {
      playNote(ctx, freq, now + offset, duration, 0.12, oscType);
    }
  } catch (e) {
    // Silently fail — audio not critical
    console.warn('Sound playback failed:', e);
  }
};

export default playSound;
