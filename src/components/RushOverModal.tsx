import React, { useEffect } from 'react';
import { Timer, Trophy, Zap, Coins, RotateCcw, Home, Film, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RushOverModalProps {
  score: number;
  puzzlesSolved: number;
  maxCombo: number;
  isNewHighScore: boolean;
  bestScore: number;
  coinsEarned: number;
  onSecondChance?: () => void;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const RushOverModal: React.FC<RushOverModalProps> = ({
  score,
  puzzlesSolved,
  maxCombo,
  isNewHighScore,
  bestScore,
  coinsEarned,
  onSecondChance,
  onPlayAgain,
  onBackToMenu,
}) => {
  useEffect(() => {
    sounds.playBuzzer();
    const timer = setTimeout(() => {
      if (isNewHighScore) {
        sounds.playVictory();
      } else {
        sounds.playCoin();
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [isNewHighScore]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-sm bg-[#131720] border border-[#2b3345] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 flex flex-col items-center text-center overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Time's Up Header */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-2 shadow-lg">
          <Timer className="w-6 h-6 animate-pulse" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
          Rush Mode Finished
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          Time's Up!
        </h2>

        {/* New High Score Banner */}
        {isNewHighScore && (
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>New Best Score!</span>
          </div>
        )}

        {/* Final Score Card */}
        <div className="w-full bg-[#181d28] border border-[#262e3e] rounded-2xl p-3 mb-3 flex flex-col items-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">
            Final Rush Score
          </div>
          <div className="text-3xl font-black text-white tabular-nums tracking-tight my-0.5 text-emerald-400">
            {score.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Personal Best: {Math.max(bestScore, score).toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 py-2 px-1 mb-3 border-y border-[#1f2635] text-[11px]">
          <div>
            <div className="text-slate-400 mb-0.5">Solved</div>
            <div className="font-bold text-white tabular-nums text-sm">
              {puzzlesSolved}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Max Combo</div>
            <div className="font-bold text-amber-300 tabular-nums text-sm flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 fill-amber-300" />
              <span>x{maxCombo || 1}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Bonus</div>
            <div className="font-bold text-amber-300 tabular-nums text-sm flex items-center justify-center gap-0.5">
              <Coins className="w-3 h-3 fill-amber-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {onSecondChance && (
            <button
              type="button"
              onClick={onSecondChance}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-emerald-400/35 to-emerald-500/25 hover:from-emerald-500/40 hover:to-emerald-400/40 border border-emerald-400/60 text-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-between px-3.5 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse"
            >
              <div className="flex items-center gap-1.5">
                <Film className="w-4 h-4 text-emerald-400" />
                <span>Second Chance (+15s)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  FREE AD
                </span>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Play Rush Again</span>
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full h-10 rounded-xl bg-[#181d28] hover:bg-[#202736] border border-[#283244] text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
