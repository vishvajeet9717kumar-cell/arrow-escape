import React from 'react';
import { X, Gift, Check, Coins } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DailyRewardModalProps {
  dailyStreak: number;
  isAvailable: boolean;
  onClaim: (amount: number) => void;
  onClose: () => void;
}

const REWARDS = [50, 75, 100, 150, 200, 300, 500];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  dailyStreak,
  isAvailable,
  onClaim,
  onClose,
}) => {
  const currentDayIndex = dailyStreak % 7; // 0 to 6
  const todayReward = REWARDS[currentDayIndex];

  const handleClaim = () => {
    if (!isAvailable) return;
    sounds.playCoin();
    sounds.triggerHaptic('success');
    onClaim(todayReward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-sm bg-[#12151d] border border-[#262d3d] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#1a1f2b] hover:bg-[#242b3b] border border-[#2c3447] flex items-center justify-center text-slate-300 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gift Icon Header */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Gift className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          Daily Rewards
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Claim free coins each day to unlock hints and assists!
        </p>

        {/* 7-Day Cycle Cards */}
        <div className="w-full grid grid-cols-4 gap-2 mb-3">
          {REWARDS.slice(0, 4).map((amt, idx) => {
            const isToday = isAvailable && idx === currentDayIndex;
            const isClaimed = idx < currentDayIndex;

            return (
              <div
                key={idx}
                className={`p-2 rounded-2xl border flex flex-col items-center justify-center relative transition-all
                  ${
                    isToday
                      ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/40 text-emerald-300'
                      : isClaimed
                      ? 'bg-[#151923] border-[#222938] text-slate-500'
                      : 'bg-[#181d28] border-[#242c3d] text-slate-300'
                  }
                `}
              >
                <span className="text-[10px] font-semibold text-slate-400 mb-1">
                  Day {idx + 1}
                </span>
                <Coins className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-xs font-bold tabular-nums">+{amt}</span>
                {isClaimed && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full grid grid-cols-3 gap-2 mb-5">
          {REWARDS.slice(4, 7).map((amt, idx) => {
            const realIdx = idx + 4;
            const isToday = isAvailable && realIdx === currentDayIndex;
            const isClaimed = realIdx < currentDayIndex;

            return (
              <div
                key={realIdx}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center relative transition-all
                  ${
                    isToday
                      ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/40 text-emerald-300'
                      : isClaimed
                      ? 'bg-[#151923] border-[#222938] text-slate-500'
                      : 'bg-[#181d28] border-[#242c3d] text-slate-300'
                  }
                  ${realIdx === 6 ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent' : ''}
                `}
              >
                <span className="text-[10px] font-semibold text-slate-400 mb-1">
                  Day {realIdx + 1} {realIdx === 6 ? '🔥' : ''}
                </span>
                <Coins className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-xs font-bold tabular-nums">+{amt}</span>
                {isClaimed && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <button
          type="button"
          onClick={handleClaim}
          disabled={!isAvailable}
          className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
            ${
              isAvailable
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-emerald-500/25 active:scale-[0.98] cursor-pointer'
                : 'bg-[#181d28] text-slate-500 border border-[#262e3e] cursor-not-allowed'
            }
          `}
        >
          {isAvailable ? `Claim +${todayReward} Coins` : 'Already Claimed Today'}
        </button>
      </div>
    </div>
  );
};
