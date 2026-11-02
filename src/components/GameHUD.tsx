import {
  Volume2,
  VolumeX,
  Music,
  Sliders,
  RotateCcw,
  Undo2,
  Lightbulb,
  Grid,
  Coins,
  ChevronLeft,
  Timer,
  Trophy,
  Lock,
  Zap,
  Box,
} from 'lucide-react';
import { Difficulty, GameMode } from '../types/game';

interface GameHUDProps {
  mode: GameMode;
  levelNumber: number;
  difficulty: Difficulty;
  archetype?: string;
  remainingArrows: number;
  totalArrows: number;
  movesCount: number;
  coins: number;
  canUndo: boolean;
  canHint: boolean;
  hintCost: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  rushTimeLeft?: number;
  rushScore?: number;
  moveLimit?: number;
  specialType?: 'locked' | 'limited_moves' | 'teleport' | 'explosive' | 'double' | 'rotating';
  is3D?: boolean;
  chapter?: number;
  chapterTitle?: string;
  specialMechanics?: string[];
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
  onUndo: () => void;
  onHint: () => void;
  onOpenLevelSelect: () => void;
  onBackToMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  levelNumber,
  difficulty,
  archetype,
  remainingArrows,
  totalArrows,
  movesCount,
  coins,
  canUndo,
  canHint,
  hintCost,
  soundEnabled,
  musicEnabled,
  rushTimeLeft = 60,
  rushScore = 0,
  moveLimit,
  specialType,
  is3D = false,
  chapter = 1,
  chapterTitle,
  onToggleSound,
  onToggleMusic,
  onOpenSettings,
  onRestart,
  onUndo,
  onHint,
  onOpenLevelSelect,
  onBackToMenu,
}) => {
  const progressPercent =
    totalArrows > 0
      ? Math.round(((totalArrows - remainingArrows) / totalArrows) * 100)
      : 0;

  const difficultyColors: Record<Difficulty, string> = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-rose-400',
  };

  const isUrgent = mode === 'RUSH' && rushTimeLeft <= 10;
  const movesRemaining = moveLimit !== undefined ? Math.max(0, moveLimit - movesCount) : null;

  return (
    <header className="w-full max-w-md mx-auto px-3 py-1 flex flex-col gap-1.5 select-none shrink-0">
      {/* Top Row: Navigation, Title & Stats */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onBackToMenu}
            aria-label="Back to Main Menu"
            className="w-8 h-8 rounded-xl bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {mode === 'CLASSIC' && (
            <button
              type="button"
              onClick={onOpenLevelSelect}
              aria-label="Level Select"
              className="w-8 h-8 rounded-xl bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <Grid className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center Title or Rush Timer */}
        {mode === 'RUSH' ? (
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center gap-1 px-3 py-0.5 rounded-full border transition-all ${
                isUrgent
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/50'
                  : 'bg-[#181c24] border-[#2b3345] text-amber-300'
              }`}
            >
              <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
              <span className="text-sm font-black tabular-nums tracking-tight">
                {rushTimeLeft}s
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="tabular-nums font-bold text-white">
                {rushScore.toLocaleString()} pts
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                Level {levelNumber}
              </h1>
              {is3D ? (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black tracking-wider flex items-center gap-0.5">
                  <Box className="w-2.5 h-2.5" /> 3D
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  {archetype && archetype !== 'Tutorial' ? `· ${archetype}` : ''}
                </span>
              )}
              {specialType === 'locked' && (
                <Lock className="w-3 h-3 text-amber-400 fill-amber-400/20" />
              )}
              {specialType === 'limited_moves' && (
                <Zap className="w-3 h-3 text-rose-400 fill-rose-400/20" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] leading-tight">
              <span className={`font-semibold capitalize ${difficultyColors[difficulty]}`}>
                {difficulty}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Ch.{chapter}</span>
              <span className="text-slate-600">·</span>
              {moveLimit !== undefined ? (
                <span
                  className={`tabular-nums font-bold ${
                    movesRemaining !== null && movesRemaining <= 2
                      ? 'text-rose-400 font-black animate-pulse'
                      : 'text-amber-300'
                  }`}
                >
                  {movesRemaining} moves left
                </span>
              ) : (
                <span className="text-slate-400 tabular-nums">{movesCount} moves</span>
              )}
            </div>
          </div>
        )}

        {/* Right Slot: Coins & Audio Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#181c24] border border-[#2b3345]">
            <Coins className="w-3 h-3 text-amber-400 fill-amber-400/20" />
            <span className="text-[11px] font-bold text-amber-300 tabular-nums">{coins}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Mute background music' : 'Play background music'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Music className={`w-3.5 h-3.5 ${musicEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar Row */}
      <div className="w-full flex items-center gap-2 px-0.5">
        <div className="flex-1 h-1.5 bg-[#181c24] rounded-full overflow-hidden border border-[#232936] p-px">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              mode === 'RUSH'
                ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-slate-400 tabular-nums shrink-0">
          {remainingArrows} left
        </span>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-3 gap-2 mt-0.5">
        <button
          type="button"
          onClick={onRestart}
          aria-label={mode === 'RUSH' ? 'Reset puzzle' : 'Restart level'}
          className="h-9 sm:h-10 rounded-xl bg-[#181c24] hover:bg-[#222836] border border-[#2b3345] flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>{mode === 'RUSH' ? 'Reset' : 'Restart'}</span>
        </button>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last move"
          className={`h-9 sm:h-10 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-sm
            ${
              canUndo
                ? 'bg-[#181c24] hover:bg-[#222836] border-[#2b3345] text-slate-200 hover:text-white cursor-pointer'
                : 'bg-[#12151d] border-[#1f2430] text-slate-600 cursor-not-allowed opacity-60'
            }
          `}
        >
          <Undo2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Undo</span>
        </button>

        <button
          type="button"
          onClick={onHint}
          disabled={!canHint}
          aria-label={`Get a hint (costs ${hintCost} coins)`}
          className={`h-9 sm:h-10 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-sm
            ${
              canHint
                ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/50 text-emerald-300 hover:text-emerald-200 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-[#12151d] border-[#1f2430] text-slate-600 cursor-not-allowed opacity-60'
            }
          `}
        >
          <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hint</span>
          <span className="text-[9px] text-amber-300 font-bold bg-black/40 px-1 py-0.2 rounded">
            {hintCost}🪙
          </span>
        </button>
      </div>
    </header>
  );
};
