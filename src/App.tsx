/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowTile,
  LevelData,
  PlayerProgress,
  UndoStep,
  GameMode,
  RushStats,
  CubeFace,
  AdType,
  RewardReason,
} from './types/game';
import {
  generateLevel,
  generateRushLevel,
  checkArrowClearance,
  getClearArrows,
  calculateStars,
  calculateReward,
  DIRECTIONS,
} from './utils/puzzleEngine';
import {
  loadProgress,
  saveProgress,
  checkDailyRewardStatus,
  isDailyRewardAvailable,
  getTodayDateString,
} from './utils/storage';
import { sounds } from './utils/audio';
import { adManager } from './utils/adManager';
import { GameBoard } from './components/GameBoard';
import { CubeBoard } from './components/CubeBoard';
import { GameHUD } from './components/GameHUD';
import { VictoryModal } from './components/VictoryModal';
import { RushOverModal } from './components/RushOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal, TutorialType } from './components/TutorialModal';
import { MainMenu } from './components/MainMenu';
import { AdModal } from './components/AdModal';
import { BannerAd } from './components/BannerAd';
import { MobilePublishModal } from './components/MobilePublishModal';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const HINT_COST = 15;

export default function App() {
  // Player state persisted in localStorage
  const [profile, setProfile] = useState<PlayerProgress>(() => loadProgress());

  // Navigation views & modes
  const [view, setView] = useState<'MENU' | 'PLAYING'>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showRushOverModal, setShowRushOverModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishHub, setShowPublishHub] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<TutorialType | null>(null);

  // Ad Modal state & victory doubled status
  const [activeAd, setActiveAd] = useState<{
    type: AdType;
    reason?: RewardReason;
    onComplete?: () => void;
  } | null>(null);
  const [isVictoryCoinsDoubled, setIsVictoryCoinsDoubled] = useState<boolean>(false);

  // Active level data and board state
  const [currentLevelData, setCurrentLevelData] = useState<LevelData>(() =>
    generateLevel(profile.currentLevel)
  );
  const [activeArrows, setActiveArrows] = useState<ArrowTile[]>([]);
  const [undoHistory, setUndoHistory] = useState<UndoStep[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);

  // Special challenge states
  const [moveLimitFailed, setMoveLimitFailed] = useState<boolean>(false);

  // Rush mode state
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(60);
  const [rushScore, setRushScore] = useState<number>(0);
  const [rushPuzzleIndex, setRushPuzzleIndex] = useState<number>(0);
  const [rushMaxCombo, setRushMaxCombo] = useState<number>(1);
  const [rushPuzzlesSolved, setRushPuzzlesSolved] = useState<number>(0);
  const [rushStats, setRushStats] = useState<RushStats | null>(null);

  // Interaction feedback states
  const [flyingArrowId, setFlyingArrowId] = useState<string | null>(null);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [blockedCoord, setBlockedCoord] = useState<{ row: number; col: number; face?: CubeFace } | null>(null);
  const [hintedArrowId, setHintedArrowId] = useState<string | null>(null);

  // Victory celebration metrics
  const [victoryStats, setVictoryStats] = useState<{
    stars: number;
    coinsEarned: number;
  }>({ stars: 3, coinsEarned: 25 });

  const lastMoveTimeRef = useRef<number>(0);
  const comboDecayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusyRef = useRef<boolean>(false);
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const victoryProcessedRef = useRef<boolean>(false);

  // Sync sound & music muted and volume status with SoundSystem
  useEffect(() => {
    sounds.setMuted(!profile.soundEnabled);
    sounds.setSoundVolume(profile.soundVolume ?? 0.8);
    sounds.setMusicMuted(!profile.musicEnabled);
    sounds.setMusicVolume(profile.musicVolume ?? 0.45);
  }, [profile.soundEnabled, profile.soundVolume, profile.musicEnabled, profile.musicVolume]);

  // Manage Background Music lifecycle (Ambient vs Rush)
  useEffect(() => {
    if (!profile.musicEnabled) {
      sounds.stopMusic();
      return;
    }

    if (view === 'PLAYING' && gameMode === 'RUSH' && !showRushOverModal) {
      sounds.startMusic('RUSH');
    } else {
      sounds.startMusic('AMBIENT');
    }
  }, [view, gameMode, profile.musicEnabled, showRushOverModal]);

  // Load Classic level into board and trigger tutorials when appropriate
  const loadClassicLevel = useCallback((lvlNum: number) => {
    const data = generateLevel(lvlNum);
    setCurrentLevelData(data);
    setActiveArrows(data.arrows.map((a) => ({ ...a, status: 'idle' })));
    setUndoHistory([]);
    setMovesCount(0);
    setHintsUsed(0);
    setCombo(0);
    setFlyingArrowId(null);
    setBlockedArrowId(null);
    setBlockedCoord(null);
    setHintedArrowId(null);
    setShowVictoryModal(false);
    setIsVictoryCoinsDoubled(false);
    setMoveLimitFailed(false);
    isBusyRef.current = false;
    victoryProcessedRef.current = false;
    if (blockedTimerRef.current) {
      clearTimeout(blockedTimerRef.current);
      blockedTimerRef.current = null;
    }

    // Check for tutorial triggers
    if (lvlNum >= 101 && lvlNum <= 200 && !profile.seen3DTutorial) {
      setActiveTutorial('3D_CUBE');
    } else if (lvlNum === 201 && !profile.seenSpecialTutorials?.['teleport']) {
      setActiveTutorial('TELEPORT');
    } else if (lvlNum === 221 && !profile.seenSpecialTutorials?.['explosive']) {
      setActiveTutorial('EXPLOSIVE');
    } else if (lvlNum === 241 && !profile.seenSpecialTutorials?.['double']) {
      setActiveTutorial('DOUBLE');
    } else if (lvlNum === 261 && !profile.seenSpecialTutorials?.['rotating']) {
      setActiveTutorial('ROTATING');
    } else if (lvlNum === 281 && !profile.seenSpecialTutorials?.['locked']) {
      setActiveTutorial('LOCKED');
    }
  }, [profile.seen3DTutorial, profile.seenSpecialTutorials]);

  // Close active tutorial and record completion in storage
  const handleCloseTutorial = () => {
    if (activeTutorial === '3D_CUBE') {
      saveProgress({ seen3DTutorial: true });
      setProfile((p) => ({ ...p, seen3DTutorial: true }));
    } else if (activeTutorial) {
      const key = activeTutorial.toLowerCase();
      const updated = { ...(profile.seenSpecialTutorials || {}), [key]: true };
      saveProgress({ seenSpecialTutorials: updated });
      setProfile((p) => ({ ...p, seenSpecialTutorials: updated }));
    }
    setActiveTutorial(null);
  };

  // Start / Change Classic Level
  const handleStartClassicLevel = (lvlNum: number) => {
    sounds.resumeAudio();
    setGameMode('CLASSIC');
    setProfile((prev) => {
      const next = { ...prev, currentLevel: lvlNum };
      saveProgress({ currentLevel: lvlNum });
      return next;
    });
    loadClassicLevel(lvlNum);
    setView('PLAYING');
  };

  // Start Rush Blitz Mode
  const handleStartRush = () => {
    sounds.resumeAudio();
    setGameMode('RUSH');
    setRushTimeLeft(60);
    setRushScore(0);
    setRushPuzzleIndex(0);
    setRushMaxCombo(1);
    setRushPuzzlesSolved(0);
    setShowRushOverModal(false);
    setRushStats(null);
    setMoveLimitFailed(false);

    const firstRush = generateRushLevel(0);
    setCurrentLevelData(firstRush);
    setActiveArrows(firstRush.arrows.map((a) => ({ ...a, status: 'idle' })));
    setUndoHistory([]);
    setMovesCount(0);
    setHintsUsed(0);
    setCombo(0);
    setFlyingArrowId(null);
    setBlockedArrowId(null);
    setBlockedCoord(null);
    setHintedArrowId(null);
    isBusyRef.current = false;
    victoryProcessedRef.current = false;
    if (blockedTimerRef.current) {
      clearTimeout(blockedTimerRef.current);
      blockedTimerRef.current = null;
    }
    setView('PLAYING');
  };

  // Rush Mode 60s countdown timer
  useEffect(() => {
    if (view !== 'PLAYING' || gameMode !== 'RUSH' || showRushOverModal) return;

    if (rushTimeLeft <= 0) {
      const isNewHighScore = rushScore > profile.bestRushScore;
      const coinsEarned = Math.max(10, Math.floor(rushScore / 150));
      const updatedBest = Math.max(profile.bestRushScore, rushScore);
      const updatedGames = profile.rushGamesPlayed + 1;
      const updatedCoins = profile.coins + coinsEarned;

      saveProgress({
        bestRushScore: updatedBest,
        rushGamesPlayed: updatedGames,
        coins: updatedCoins,
      });

      setProfile((p) => ({
        ...p,
        bestRushScore: updatedBest,
        rushGamesPlayed: updatedGames,
        coins: updatedCoins,
      }));

      setRushStats({
        score: rushScore,
        puzzlesSolved: rushPuzzlesSolved,
        maxCombo: rushMaxCombo,
        isNewHighScore,
        coinsEarned,
      });
      setShowRushOverModal(true);
      return;
    }

    const timer = setInterval(() => {
      setRushTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= 11) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    view,
    gameMode,
    showRushOverModal,
    rushTimeLeft,
    rushScore,
    rushPuzzlesSolved,
    rushMaxCombo,
    profile.bestRushScore,
    profile.rushGamesPlayed,
    profile.coins,
  ]);

  // Sound toggle
  const handleToggleSound = () => {
    const nextVal = !profile.soundEnabled;
    sounds.setMuted(!nextVal);
    if (nextVal) sounds.playTap();
    setProfile((prev) => {
      const next = { ...prev, soundEnabled: nextVal };
      saveProgress({ soundEnabled: nextVal });
      return next;
    });
  };

  // Music toggle
  const handleToggleMusic = () => {
    sounds.resumeAudio();
    const nextVal = !profile.musicEnabled;
    sounds.setMusicMuted(!nextVal);
    if (nextVal) sounds.playTap();
    setProfile((prev) => {
      const next = { ...prev, musicEnabled: nextVal };
      saveProgress({ musicEnabled: nextVal });
      return next;
    });
  };

  // Sound volume change
  const handleChangeSoundVolume = (vol: number) => {
    sounds.setSoundVolume(vol);
    setProfile((prev) => {
      const next = { ...prev, soundVolume: vol };
      saveProgress({ soundVolume: vol });
      return next;
    });
  };

  // Music volume change
  const handleChangeMusicVolume = (vol: number) => {
    sounds.setMusicVolume(vol);
    setProfile((prev) => {
      const next = { ...prev, musicVolume: vol };
      saveProgress({ musicVolume: vol });
      return next;
    });
  };

  // Reduced motion toggle
  const handleToggleReducedMotion = () => {
    const nextVal = !profile.reducedMotion;
    sounds.playTap();
    setProfile((prev) => {
      const next = { ...prev, reducedMotion: nextVal };
      saveProgress({ reducedMotion: nextVal });
      return next;
    });
  };

  // Register Combo hit and decay
  const registerComboHit = (now: number): number => {
    const timeDelta = now - lastMoveTimeRef.current;
    lastMoveTimeRef.current = now;

    const nextCombo = timeDelta < 1800 ? combo + 1 : 1;
    setCombo(nextCombo);

    if (comboDecayTimerRef.current) {
      clearTimeout(comboDecayTimerRef.current);
    }
    comboDecayTimerRef.current = setTimeout(() => {
      setCombo(0);
      comboDecayTimerRef.current = null;
    }, 2000);

    const prevMultiplier = combo >= 6 ? 5 : combo >= 4 ? 3 : combo >= 2 ? 2 : 1;
    const nextMultiplier = nextCombo >= 6 ? 5 : nextCombo >= 4 ? 3 : nextCombo >= 2 ? 2 : 1;

    if (nextMultiplier >= 2 && nextMultiplier > prevMultiplier) {
      sounds.playCombo(nextMultiplier);
    }

    return nextMultiplier;
  };

  // Handle Arrow Tile Click (Supports 2D, 3D, and Special Arrows)
  const handleTileClick = (arrow: ArrowTile) => {
    sounds.resumeAudio();
    if (isBusyRef.current || flyingArrowId || moveLimitFailed) return;

    // 1. ROTATING ARROW: If blocked in current direction, rotate 90° clockwise!
    if (arrow.specialType === 'rotating') {
      const { isClear } = checkArrowClearance(
        arrow,
        activeArrows,
        currentLevelData.gridSize
      );
      if (!isClear) {
        sounds.playRotate();
        const nextDirIdx = (DIRECTIONS.indexOf(arrow.direction) + 1) % 4;
        const nextDir = DIRECTIONS[nextDirIdx];
        setActiveArrows((prev) =>
          prev.map((a) =>
            a.id === arrow.id
              ? { ...a, direction: nextDir, rotationCount: (a.rotationCount || 0) + 1 }
              : a
          )
        );
        return;
      }
    }

    // 2. DOUBLE ARROW: First stage charge
    if (arrow.specialType === 'double' && (arrow.doubleStage ?? 0) === 0) {
      const { isClear, blockedBy } = checkArrowClearance(
        arrow,
        activeArrows,
        currentLevelData.gridSize
      );
      if (!isClear) {
        sounds.playBlocked();
        setCombo(0);
        setBlockedArrowId(arrow.id);
        setBlockedCoord(blockedBy);
        if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current);
        blockedTimerRef.current = setTimeout(() => {
          setBlockedArrowId(null);
          setBlockedCoord(null);
        }, 450);
        return;
      }

      sounds.playDoubleStage();
      setActiveArrows((prev) =>
        prev.map((a) => (a.id === arrow.id ? { ...a, doubleStage: 1 } : a))
      );
      return;
    }

    // Standard & Remaining Clearance Check
    const { isClear, blockedBy } = checkArrowClearance(
      arrow,
      activeArrows,
      currentLevelData.gridSize
    );

    if (!isClear) {
      sounds.playBlocked();
      setCombo(0);
      setBlockedArrowId(arrow.id);
      setBlockedCoord(blockedBy);

      if (blockedTimerRef.current) {
        clearTimeout(blockedTimerRef.current);
      }

      blockedTimerRef.current = setTimeout(() => {
        setBlockedArrowId(null);
        setBlockedCoord(null);
        blockedTimerRef.current = null;
      }, 450);
      return;
    }

    // Arrow is CLEAR and will escape
    isBusyRef.current = true;

    if (hintedArrowId) {
      setHintedArrowId(null);
    }

    const nextMoves = movesCount + 1;
    setMovesCount(nextMoves);

    const multiplier = registerComboHit(Date.now());

    if (gameMode === 'RUSH') {
      const arrowPoints = 100 * multiplier;
      setRushScore((s) => s + arrowPoints);
      setRushMaxCombo((m) => Math.max(m, multiplier));
    }

    // Save snapshot before removal for robust Undo
    setUndoHistory((prev) => [
      ...prev,
      {
        arrow: { ...arrow },
        arrowsSnapshot: activeArrows.map((a) => ({ ...a })),
        movesCount: movesCount,
      },
    ]);

    // Play appropriate launch SFX for special type
    if (arrow.specialType === 'teleport') {
      sounds.playTeleport();
    } else if (arrow.specialType === 'explosive') {
      sounds.playExplosion();
    } else {
      sounds.playLaunch(combo);
    }

    setFlyingArrowId(arrow.id);

    setTimeout(() => {
      let remaining = activeArrows.filter((a) => a.id !== arrow.id);

      // Explosive Arrow EMP blast: dislodges 1 adjacent obstacle
      if (arrow.specialType === 'explosive') {
        const neighbor = remaining.find(
          (a) =>
            a.face === arrow.face &&
            Math.abs(a.row - arrow.row) <= 1 &&
            Math.abs(a.col - arrow.col) <= 1
        );
        if (neighbor) {
          remaining = remaining.filter((a) => a.id !== neighbor.id);
        }
      }

      // Key Arrow: unlock matching or threshold locked arrows
      let unlockedAny = false;
      const updatedRemaining = remaining.map((a) => {
        if (a.isLocked) {
          if (arrow.isKey || (a.unlocksAtRemaining && remaining.length <= a.unlocksAtRemaining)) {
            unlockedAny = true;
            return { ...a, isLocked: false };
          }
        }
        return a;
      });

      if (unlockedAny) {
        sounds.playUnlock();
      }

      setActiveArrows(updatedRemaining);
      setFlyingArrowId(null);
      isBusyRef.current = false;

      // Victory Condition check
      if (updatedRemaining.length === 0 && !victoryProcessedRef.current) {
        if (gameMode === 'RUSH') {
          const puzzleBonus = 1000 * multiplier;
          setRushScore((s) => s + puzzleBonus);
          setRushPuzzlesSolved((cnt) => cnt + 1);
          setRushTimeLeft((t) => Math.min(60, t + 5));
          sounds.playStar(3);

          const nextIdx = rushPuzzleIndex + 1;
          setRushPuzzleIndex(nextIdx);
          const nextData = generateRushLevel(nextIdx);
          setCurrentLevelData(nextData);
          setActiveArrows(nextData.arrows.map((a) => ({ ...a, status: 'idle' })));
          setMovesCount(0);
          setUndoHistory([]);
          setFlyingArrowId(null);
          isBusyRef.current = false;
          return;
        }

        // Classic mode Victory celebration
        victoryProcessedRef.current = true;

        const stars = calculateStars(
          nextMoves,
          currentLevelData.parMoves,
          undoHistory.length,
          hintsUsed
        );

        const prevStars = profile.levelStars[currentLevelData.levelNumber] || 0;
        const isFirstClear = prevStars === 0;

        let coinsEarned = 0;
        if (isFirstClear) {
          coinsEarned = calculateReward(currentLevelData.levelNumber, stars);
        } else if (stars > prevStars) {
          coinsEarned = (stars - prevStars) * 10;
        } else {
          coinsEarned = 3;
        }

        setVictoryStats({ stars, coinsEarned });

        // PROGRESSIVE UNLOCK UP TO 500 LEVELS
        const nextUnlocked = Math.max(
          profile.unlockedLevel,
          Math.min(500, currentLevelData.levelNumber + 1)
        );
        const updatedStars = {
          ...profile.levelStars,
          [currentLevelData.levelNumber]: Math.max(prevStars, stars),
        };
        const updatedCoins = profile.coins + coinsEarned;

        saveProgress({
          unlockedLevel: nextUnlocked,
          levelStars: updatedStars,
          coins: updatedCoins,
        });

        setProfile((p) => ({
          ...p,
          unlockedLevel: nextUnlocked,
          levelStars: updatedStars,
          coins: updatedCoins,
        }));

        setShowVictoryModal(true);
        return;
      }

      // Check move limit challenge exhaustion
      if (
        gameMode === 'CLASSIC' &&
        currentLevelData.moveLimit &&
        nextMoves >= currentLevelData.moveLimit &&
        updatedRemaining.length > 0
      ) {
        sounds.playBuzzer();
        setMoveLimitFailed(true);
      }
    }, 280);
  };

  // Undo Last Move
  const handleUndo = () => {
    if (undoHistory.length === 0 || isBusyRef.current || flyingArrowId) return;

    sounds.playUndo();
    const lastStep = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));
    setActiveArrows(lastStep.arrowsSnapshot.map((a) => ({ ...a, status: 'idle' })));
    setMovesCount(lastStep.movesCount);
    setBlockedArrowId(null);
    setBlockedCoord(null);
    setHintedArrowId(null);
    setFlyingArrowId(null);
    setMoveLimitFailed(false);
    isBusyRef.current = false;
    if (blockedTimerRef.current) {
      clearTimeout(blockedTimerRef.current);
      blockedTimerRef.current = null;
    }
  };

  // Restart Level
  const handleRestart = () => {
    sounds.playTap();
    setActiveArrows(currentLevelData.arrows.map((a) => ({ ...a, status: 'idle' })));
    setUndoHistory([]);
    setMovesCount(0);
    setHintsUsed(0);
    setCombo(0);
    setFlyingArrowId(null);
    setBlockedArrowId(null);
    setBlockedCoord(null);
    setHintedArrowId(null);
    setShowVictoryModal(false);
    setIsVictoryCoinsDoubled(false);
    setMoveLimitFailed(false);
    isBusyRef.current = false;
    victoryProcessedRef.current = false;
    if (blockedTimerRef.current) {
      clearTimeout(blockedTimerRef.current);
      blockedTimerRef.current = null;
    }
  };

  // Hint
  const handleHint = () => {
    if (isBusyRef.current || flyingArrowId) return;

    if (hintedArrowId && activeArrows.some((a) => a.id === hintedArrowId)) {
      sounds.playHint();
      return;
    }

    if (profile.coins < HINT_COST) {
      sounds.playBlocked();
      return;
    }

    const clearArrows = getClearArrows(activeArrows, currentLevelData.gridSize);
    if (clearArrows.length === 0) return;

    const nextCoins = Math.max(0, profile.coins - HINT_COST);
    saveProgress({ coins: nextCoins });
    setProfile((prev) => ({ ...prev, coins: nextCoins }));

    const target = clearArrows[0];
    setHintedArrowId(target.id);
    setHintsUsed((h) => h + 1);
    sounds.playHint();
  };

  // Daily Reward Claim
  const handleClaimDaily = (amount: number) => {
    const status = checkDailyRewardStatus(profile.lastClaimDate);
    if (!status.isAvailable) return;

    const today = getTodayDateString();
    const nextStreak = status.shouldResetStreak ? 1 : profile.dailyStreak + 1;
    const nextCoins = profile.coins + amount;

    saveProgress({
      coins: nextCoins,
      dailyStreak: nextStreak,
      lastClaimDate: today,
    });

    setProfile((prev) => ({
      ...prev,
      coins: nextCoins,
      dailyStreak: nextStreak,
      lastClaimDate: today,
    }));

    setShowDailyModal(false);
  };

  // Ad Handlers (Rewarded & Interstitial)
  const handleWatchAdCoins = () => {
    sounds.resumeAudio();
    setActiveAd({
      type: 'rewarded',
      reason: 'coins_50',
      onComplete: () => {
        const nextCoins = profile.coins + 50;
        saveProgress({ coins: nextCoins });
        setProfile((p) => ({ ...p, coins: nextCoins }));
        sounds.playCoin();
      },
    });
  };

  const handleWatchAdHint = () => {
    sounds.resumeAudio();
    setActiveAd({
      type: 'rewarded',
      reason: 'free_hint',
      onComplete: () => {
        const clearArrows = getClearArrows(activeArrows, currentLevelData.gridSize);
        if (clearArrows.length > 0) {
          setHintedArrowId(clearArrows[0].id);
          setHintsUsed((h) => h + 1);
          sounds.playHint();
        }
      },
    });
  };

  const handleDoubleVictoryCoins = () => {
    if (isVictoryCoinsDoubled) return;
    sounds.resumeAudio();
    setActiveAd({
      type: 'rewarded',
      reason: 'double_victory_coins',
      onComplete: () => {
        const bonus = victoryStats.coinsEarned;
        const nextCoins = profile.coins + bonus;
        saveProgress({ coins: nextCoins });
        setProfile((p) => ({ ...p, coins: nextCoins }));
        setIsVictoryCoinsDoubled(true);
        sounds.playCoin();
      },
    });
  };

  const handleRushSecondChance = () => {
    sounds.resumeAudio();
    setActiveAd({
      type: 'rewarded',
      reason: 'rush_second_chance',
      onComplete: () => {
        setShowRushOverModal(false);
        setRushTimeLeft(15);
        sounds.playStar(2);
      },
    });
  };

  // Next level navigation from victory modal with Interstitial Ad check
  const handleNextLevel = () => {
    const nextLvl = Math.min(500, currentLevelData.levelNumber + 1);
    const shouldShowInterstitial = adManager.onLevelCompleted(currentLevelData.levelNumber);

    if (shouldShowInterstitial) {
      setActiveAd({
        type: 'interstitial',
        onComplete: () => {
          handleStartClassicLevel(nextLvl);
        },
      });
    } else {
      handleStartClassicLevel(nextLvl);
    }
  };

  const isDailyAvailable = isDailyRewardAvailable(profile.lastClaimDate);

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] bg-[#0d0f12] text-[#f3f4f6] flex flex-col items-center justify-between overflow-hidden">
      {view === 'MENU' ? (
        <MainMenu
          currentLevel={profile.currentLevel}
          unlockedLevel={profile.unlockedLevel}
          coins={profile.coins}
          bestRushScore={profile.bestRushScore || 0}
          isDailyAvailable={isDailyAvailable}
          soundEnabled={profile.soundEnabled}
          musicEnabled={profile.musicEnabled}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onOpenSettings={() => setShowSettings(true)}
          onPlay={(lvl) => handleStartClassicLevel(lvl ?? profile.currentLevel)}
          onPlayRush={handleStartRush}
          onWatchAdCoins={handleWatchAdCoins}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenDaily={() => setShowDailyModal(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenPublishHub={() => setShowPublishHub(true)}
        />
      ) : (
        <div className="w-full max-w-md h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center py-1 sm:py-2 px-3 select-none relative overflow-hidden">
          {/* Top HUD Controls */}
          <GameHUD
            mode={gameMode}
            levelNumber={currentLevelData.levelNumber}
            difficulty={currentLevelData.difficulty}
            archetype={currentLevelData.archetype}
            remainingArrows={activeArrows.length}
            totalArrows={currentLevelData.arrows.length}
            movesCount={movesCount}
            coins={profile.coins}
            canUndo={undoHistory.length > 0}
            canHint={profile.coins >= HINT_COST && activeArrows.length > 0}
            hintCost={HINT_COST}
            soundEnabled={profile.soundEnabled}
            musicEnabled={profile.musicEnabled}
            rushTimeLeft={rushTimeLeft}
            rushScore={rushScore}
            moveLimit={currentLevelData.moveLimit}
            specialType={currentLevelData.specialType}
            is3D={currentLevelData.is3D}
            chapter={currentLevelData.chapter}
            chapterTitle={currentLevelData.chapterTitle}
            specialMechanics={currentLevelData.specialMechanics}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onOpenSettings={() => setShowSettings(true)}
            onRestart={handleRestart}
            onUndo={handleUndo}
            onHint={handleHint}
            onWatchAdHint={handleWatchAdHint}
            onWatchAdCoins={handleWatchAdCoins}
            onOpenLevelSelect={() => setShowLevelSelect(true)}
            onBackToMenu={() => setView('MENU')}
          />

          {/* Move Limit Exhaustion Banner */}
          {moveLimitFailed && (
            <div className="w-full bg-rose-950/80 border border-rose-500/80 rounded-2xl p-2.5 my-1 flex items-center justify-between text-xs animate-shake">
              <div className="flex items-center gap-2 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold">Move limit exceeded!</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Center Puzzle Board: 3D Cube vs 2D Matrix */}
          <main className="w-full flex-1 flex items-center justify-center min-h-0 my-auto">
            {currentLevelData.is3D ? (
              <CubeBoard
                faceGridSize={currentLevelData.gridSize}
                arrows={activeArrows}
                hintedArrowId={hintedArrowId}
                blockedArrowId={blockedArrowId}
                blockedCoord={blockedCoord}
                flyingArrowId={flyingArrowId}
                combo={combo}
                reducedMotion={profile.reducedMotion}
                onTileClick={handleTileClick}
              />
            ) : (
              <GameBoard
                gridSize={currentLevelData.gridSize}
                arrows={activeArrows}
                hintedArrowId={hintedArrowId}
                blockedArrowId={blockedArrowId}
                blockedCoord={blockedCoord}
                flyingArrowId={flyingArrowId}
                combo={combo}
                reducedMotion={profile.reducedMotion}
                onTileClick={handleTileClick}
              />
            )}
          </main>

          {/* Quick Helper Subtext */}
          <footer className="w-full text-center py-1 text-[11px] text-slate-500 shrink-0">
            {hintedArrowId ? (
              <span className="text-emerald-400 font-semibold animate-pulse">
                Escape route located! Tap the glowing arrow.
              </span>
            ) : gameMode === 'RUSH' ? (
              <span className="text-amber-400/80 font-medium">
                Blitz Mode: clear arrows in rapid succession for combo multipliers!
              </span>
            ) : currentLevelData.is3D ? (
              <span className="text-emerald-400/90 font-medium">
                Drag 360° to inspect all 6 faces · Clear arrows to solve the Cube
              </span>
            ) : currentLevelData.specialType === 'rotating' ? (
              <span className="text-teal-300 font-medium">
                Tap rotating compass arrows to turn them toward an open boundary
              </span>
            ) : currentLevelData.specialType === 'double' ? (
              <span className="text-cyan-300 font-medium">
                Double arrows require 2 taps to charge and launch out
              </span>
            ) : currentLevelData.specialType === 'explosive' ? (
              <span className="text-orange-300 font-medium">
                Explosive arrows dislodge adjacent obstacle arrows upon exit
              </span>
            ) : currentLevelData.specialType === 'teleport' ? (
              <span className="text-purple-300 font-medium">
                Teleport arrows warp across space through quantum portals
              </span>
            ) : (
              <span>Tap arrows that have a clear path to escape the grid</span>
            )}
          </footer>

          {/* Non-intrusive Sponsor Banner Ad */}
          <BannerAd />
        </div>
      )}

      {/* Level Select Modal (500 levels across 5 chapters) */}
      {showLevelSelect && (
        <LevelSelectModal
          unlockedLevel={profile.unlockedLevel}
          currentLevel={currentLevelData.levelNumber}
          levelStars={profile.levelStars}
          onSelectLevel={handleStartClassicLevel}
          onUnlockAll={() => {
            saveProgress({ unlockedLevel: 500 });
            setProfile((p) => ({ ...p, unlockedLevel: 500 }));
          }}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Daily Reward Modal */}
      {showDailyModal && (
        <DailyRewardModal
          dailyStreak={profile.dailyStreak}
          isAvailable={isDailyAvailable}
          onClaim={handleClaimDaily}
          onClose={() => setShowDailyModal(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          soundEnabled={profile.soundEnabled}
          musicEnabled={profile.musicEnabled}
          soundVolume={profile.soundVolume ?? 0.8}
          musicVolume={profile.musicVolume ?? 0.45}
          reducedMotion={profile.reducedMotion}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onChangeSoundVolume={handleChangeSoundVolume}
          onChangeMusicVolume={handleChangeMusicVolume}
          onToggleReducedMotion={handleToggleReducedMotion}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Mobile Publish & Direct Install Hub */}
      {showPublishHub && (
        <MobilePublishModal onClose={() => setShowPublishHub(false)} />
      )}

      {/* Interactive Tutorial Modal for 3D Cube & Special Arrows */}
      {activeTutorial && (
        <TutorialModal type={activeTutorial} onClose={handleCloseTutorial} />
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <VictoryModal
          levelNumber={currentLevelData.levelNumber}
          archetype={currentLevelData.archetype}
          stars={victoryStats.stars}
          coinsEarned={victoryStats.coinsEarned}
          movesCount={movesCount}
          parMoves={currentLevelData.parMoves}
          hintsUsed={hintsUsed}
          undoCount={undoHistory.length}
          isCoinsDoubled={isVictoryCoinsDoubled}
          onDoubleCoins={handleDoubleVictoryCoins}
          onNextLevel={handleNextLevel}
          onReplay={handleRestart}
          onLevelSelect={() => {
            setShowVictoryModal(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Rush Mode Over Modal */}
      {showRushOverModal && rushStats && (
        <RushOverModal
          score={rushStats.score}
          puzzlesSolved={rushStats.puzzlesSolved}
          maxCombo={rushStats.maxCombo}
          isNewHighScore={rushStats.isNewHighScore}
          bestScore={profile.bestRushScore}
          coinsEarned={rushStats.coinsEarned}
          onSecondChance={handleRushSecondChance}
          onPlayAgain={handleStartRush}
          onBackToMenu={() => {
            setShowRushOverModal(false);
            setView('MENU');
          }}
        />
      )}

      {/* Interactive Video Ad Player Modal (Rewarded & Interstitial) */}
      {activeAd && (
        <AdModal
          type={activeAd.type}
          rewardReason={activeAd.reason}
          onReward={(_reason) => {
            activeAd.onComplete?.();
          }}
          onClose={() => {
            const onComp = activeAd.onComplete;
            const isInterstitial = activeAd.type === 'interstitial';
            setActiveAd(null);
            if (isInterstitial && onComp) {
              onComp();
            }
          }}
        />
      )}
    </div>
  );
}
