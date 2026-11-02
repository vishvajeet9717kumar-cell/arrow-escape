import { PlayerProgress } from '../types/game';

const STORAGE_KEYS = {
  UNLOCKED_LEVEL: 'arrow_escape_unlocked_level_v1',
  CURRENT_LEVEL: 'arrow_escape_current_level_v1',
  LEVEL_STARS: 'arrow_escape_level_stars_v1',
  COINS: 'arrow_escape_coins_v1',
  SOUND_ENABLED: 'arrow_escape_sound_v1',
  MUSIC_ENABLED: 'arrow_escape_music_v1',
  SOUND_VOLUME: 'arrow_escape_sound_vol_v1',
  MUSIC_VOLUME: 'arrow_escape_music_vol_v1',
  REDUCED_MOTION: 'arrow_escape_reduced_motion_v1',
  DAILY_STREAK: 'arrow_escape_daily_streak_v1',
  LAST_CLAIM: 'arrow_escape_last_claim_v1',
  BEST_RUSH_SCORE: 'arrow_escape_best_rush_score_v1',
  RUSH_GAMES: 'arrow_escape_rush_games_v1',
  SEEN_3D_TUTORIAL: 'arrow_escape_seen_3d_v1',
  SEEN_SPECIAL: 'arrow_escape_seen_specials_v1',
};

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') {
    return {
      unlockedLevel: 1,
      currentLevel: 1,
      levelStars: {},
      coins: 60,
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.8,
      musicVolume: 0.45,
      reducedMotion: false,
      vibrationEnabled: true,
      dailyStreak: 0,
      lastClaimDate: null,
      bestRushScore: 0,
      rushGamesPlayed: 0,
      seen3DTutorial: false,
      seenSpecialTutorials: {},
    };
  }

  try {
    const unlockedRaw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL);
    const currentRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
    const coinsRaw = localStorage.getItem(STORAGE_KEYS.COINS);
    const soundRaw = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    const musicRaw = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED);
    const soundVolRaw = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
    const musicVolRaw = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    const reducedMotionRaw = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION);
    const streakRaw = localStorage.getItem(STORAGE_KEYS.DAILY_STREAK);
    const lastClaimDate = localStorage.getItem(STORAGE_KEYS.LAST_CLAIM);
    const bestRushRaw = localStorage.getItem(STORAGE_KEYS.BEST_RUSH_SCORE);
    const rushGamesRaw = localStorage.getItem(STORAGE_KEYS.RUSH_GAMES);
    const seen3D = localStorage.getItem(STORAGE_KEYS.SEEN_3D_TUTORIAL) === 'true';
    const seenSpecialsRaw = localStorage.getItem(STORAGE_KEYS.SEEN_SPECIAL);

    const unlockedLevel =
      unlockedRaw !== null && !isNaN(parseInt(unlockedRaw, 10))
        ? parseInt(unlockedRaw, 10)
        : 1;

    const currentLevel =
      currentRaw !== null && !isNaN(parseInt(currentRaw, 10))
        ? parseInt(currentRaw, 10)
        : 1;

    const coins =
      coinsRaw !== null && !isNaN(parseInt(coinsRaw, 10))
        ? parseInt(coinsRaw, 10)
        : 60;

    const soundEnabled = soundRaw !== 'false';
    const musicEnabled = musicRaw !== 'false';
    const soundVolume = soundVolRaw !== null ? Math.max(0, Math.min(1, parseFloat(soundVolRaw))) : 0.8;
    const musicVolume = musicVolRaw !== null ? Math.max(0, Math.min(1, parseFloat(musicVolRaw))) : 0.45;
    const reducedMotion = reducedMotionRaw === 'true';

    const dailyStreak =
      streakRaw !== null && !isNaN(parseInt(streakRaw, 10))
        ? parseInt(streakRaw, 10)
        : 0;

    const bestRushScore =
      bestRushRaw !== null && !isNaN(parseInt(bestRushRaw, 10))
        ? parseInt(bestRushRaw, 10)
        : 0;

    const rushGamesPlayed =
      rushGamesRaw !== null && !isNaN(parseInt(rushGamesRaw, 10))
        ? parseInt(rushGamesRaw, 10)
        : 0;

    let levelStars: Record<number, number> = {};
    const storedStars = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    if (storedStars) {
      try {
        levelStars = JSON.parse(storedStars);
      } catch {
        levelStars = {};
      }
    }

    let seenSpecialTutorials: Record<string, boolean> = {};
    if (seenSpecialsRaw) {
      try {
        seenSpecialTutorials = JSON.parse(seenSpecialsRaw);
      } catch {
        seenSpecialTutorials = {};
      }
    }

    return {
      unlockedLevel: Math.max(1, Math.min(500, unlockedLevel)),
      currentLevel: Math.max(1, Math.min(500, currentLevel)),
      levelStars,
      coins: Math.max(0, coins),
      soundEnabled,
      musicEnabled,
      soundVolume,
      musicVolume,
      reducedMotion,
      vibrationEnabled: true,
      dailyStreak,
      lastClaimDate,
      bestRushScore,
      rushGamesPlayed,
      seen3DTutorial: seen3D,
      seenSpecialTutorials,
    };
  } catch {
    return {
      unlockedLevel: 1,
      currentLevel: 1,
      levelStars: {},
      coins: 60,
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.8,
      musicVolume: 0.45,
      reducedMotion: false,
      vibrationEnabled: true,
      dailyStreak: 0,
      lastClaimDate: null,
      bestRushScore: 0,
      rushGamesPlayed: 0,
      seen3DTutorial: false,
      seenSpecialTutorials: {},
    };
  }
}

export function saveProgress(progress: Partial<PlayerProgress>) {
  if (typeof window === 'undefined') return;

  try {
    if (progress.unlockedLevel !== undefined) {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, progress.unlockedLevel.toString());
    }
    if (progress.currentLevel !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, progress.currentLevel.toString());
    }
    if (progress.coins !== undefined) {
      localStorage.setItem(STORAGE_KEYS.COINS, Math.max(0, progress.coins).toString());
    }
    if (progress.soundEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, progress.soundEnabled ? 'true' : 'false');
    }
    if (progress.musicEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, progress.musicEnabled ? 'true' : 'false');
    }
    if (progress.soundVolume !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, progress.soundVolume.toString());
    }
    if (progress.musicVolume !== undefined) {
      localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, progress.musicVolume.toString());
    }
    if (progress.reducedMotion !== undefined) {
      localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, progress.reducedMotion ? 'true' : 'false');
    }
    if (progress.dailyStreak !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DAILY_STREAK, progress.dailyStreak.toString());
    }
    if (progress.lastClaimDate !== undefined) {
      if (progress.lastClaimDate) {
        localStorage.setItem(STORAGE_KEYS.LAST_CLAIM, progress.lastClaimDate);
      } else {
        localStorage.removeItem(STORAGE_KEYS.LAST_CLAIM);
      }
    }
    if (progress.levelStars !== undefined) {
      localStorage.setItem(STORAGE_KEYS.LEVEL_STARS, JSON.stringify(progress.levelStars));
    }
    if (progress.bestRushScore !== undefined) {
      localStorage.setItem(STORAGE_KEYS.BEST_RUSH_SCORE, progress.bestRushScore.toString());
    }
    if (progress.rushGamesPlayed !== undefined) {
      localStorage.setItem(STORAGE_KEYS.RUSH_GAMES, progress.rushGamesPlayed.toString());
    }
    if (progress.seen3DTutorial !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SEEN_3D_TUTORIAL, progress.seen3DTutorial ? 'true' : 'false');
    }
    if (progress.seenSpecialTutorials !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SEEN_SPECIAL, JSON.stringify(progress.seenSpecialTutorials));
    }
  } catch {
    // LocalStorage quota or access error handling
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function checkDailyRewardStatus(lastClaimDate: string | null): {
  isAvailable: boolean;
  shouldResetStreak: boolean;
} {
  if (!lastClaimDate) {
    return { isAvailable: true, shouldResetStreak: false };
  }
  const today = getTodayDateString();
  if (lastClaimDate === today) {
    return { isAvailable: false, shouldResetStreak: false };
  }

  const last = new Date(lastClaimDate + 'T00:00:00');
  const curr = new Date(today + 'T00:00:00');
  const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { isAvailable: true, shouldResetStreak: false };
  } else {
    // Missed 1 or more days: streak restarts from day 1
    return { isAvailable: true, shouldResetStreak: true };
  }
}

export function isDailyRewardAvailable(lastClaimDate: string | null): boolean {
  return checkDailyRewardStatus(lastClaimDate).isAvailable;
}
