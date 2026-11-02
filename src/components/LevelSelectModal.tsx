import React, { useState } from 'react';
import { X, Lock, Star, Unlock, Box, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { CHAPTERS, ChapterInfo } from '../types/game';

interface LevelSelectModalProps {
  unlockedLevel: number;
  currentLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
  onUnlockAll: () => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevel,
  currentLevel,
  levelStars,
  onSelectLevel,
  onUnlockAll,
  onClose,
}) => {
  // Determine starting chapter from currentLevel
  const initialChapter = Math.min(5, Math.max(1, Math.ceil(currentLevel / 100)));
  const [activeChapter, setActiveChapter] = useState<number>(initialChapter);

  // Pagination inside the active chapter (20 levels per sub-page)
  const currentChapterInfo = CHAPTERS.find((c) => c.number === activeChapter) || CHAPTERS[0];
  const [startLvl, endLvl] = currentChapterInfo.levelRange; // e.g. [1, 100]

  const initialSubPage = Math.floor((Math.max(startLvl, Math.min(currentLevel, endLvl)) - startLvl) / 20);
  const [subPage, setSubPage] = useState<number>(initialSubPage);

  const totalSubPages = Math.ceil((endLvl - startLvl + 1) / 20); // 5 sub-pages of 20 levels
  const pageStartLvl = startLvl + subPage * 20;
  const pageEndLvl = Math.min(endLvl, pageStartLvl + 19);

  const levelsOnPage = Array.from(
    { length: pageEndLvl - pageStartLvl + 1 },
    (_, i) => pageStartLvl + i
  );

  const getGridTag = (lvl: number) => {
    if (lvl <= 100) {
      if (lvl <= 10) return '4×4';
      if (lvl <= 20) return '5×5';
      if (lvl <= 35) return '6×6';
      if (lvl <= 50) return '7×7';
      if (lvl <= 75) return '8×8';
      return '9×9';
    } else if (lvl <= 200) {
      return lvl <= 140 ? '3D 3×3' : '3D 4×4';
    } else if (lvl <= 300) {
      if (lvl <= 220) return '2D Warp';
      if (lvl <= 240) return '2D Blast';
      if (lvl <= 260) return '2D Dual';
      if (lvl <= 280) return '2D Turn';
      return '2D Lock';
    } else if (lvl <= 400) {
      return '3D Special';
    } else {
      return lvl === 500 ? 'OMNICUBE' : '3D Expert';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-md h-[88vh] max-h-[660px] bg-[#12151d] border border-[#262d3d] rounded-3xl p-4 sm:p-5 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">Select Level</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                500 Levels
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              5 Chapters · 2D Classic & 3D Cube Puzzles
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unlockedLevel < 500 && (
              <button
                type="button"
                onClick={onUnlockAll}
                title="Unlock all 500 levels for testing"
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlock All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Level Select"
              className="w-9 h-9 rounded-xl bg-[#1a1f2b] hover:bg-[#242b3b] border border-[#2c3447] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Chapters Selector Carousel / Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#181d28] rounded-xl border border-[#232938] my-2.5 shrink-0">
          {CHAPTERS.map((ch) => {
            const isChUnlocked = unlockedLevel >= ch.levelRange[0];
            const isChActive = activeChapter === ch.number;

            return (
              <button
                key={ch.number}
                type="button"
                onClick={() => {
                  setActiveChapter(ch.number);
                  setSubPage(0);
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center
                  ${
                    isChActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : isChUnlocked
                      ? 'text-slate-300 hover:text-white bg-[#1a202c]/50'
                      : 'text-slate-500 opacity-60'
                  }
                `}
              >
                <div className="text-[10px] font-black uppercase flex items-center gap-0.5">
                  <span>Ch.{ch.number}</span>
                  {ch.is3D && <Box className="w-2.5 h-2.5 text-emerald-400" />}
                </div>
                <div className="text-[8px] text-slate-400 truncate max-w-full">
                  {ch.levelRange[0]}-{ch.levelRange[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Info Banner */}
        <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#232a3b] mb-2 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              {currentChapterInfo.is3D ? <Box className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentChapterInfo.title}</span>
                {currentChapterInfo.is3D && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    3D CUBE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">{currentChapterInfo.subtitle}</div>
            </div>
          </div>

          {/* Sub-pagination navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={subPage === 0}
              onClick={() => setSubPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
              className="w-7 h-7 rounded-lg bg-[#1a202c] hover:bg-[#252e40] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-10 text-center">
              {subPage + 1}/{totalSubPages}
            </span>
            <button
              type="button"
              disabled={subPage >= totalSubPages - 1}
              onClick={() => setSubPage((p) => Math.min(totalSubPages - 1, p + 1))}
              aria-label="Next page"
              className="w-7 h-7 rounded-lg bg-[#1a202c] hover:bg-[#252e40] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 20 Levels Grid for the current sub-page */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 pb-2 content-start">
          {levelsOnPage.map((lvl) => {
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === currentLevel;
            const stars = levelStars[lvl] || 0;
            const gridTag = getGridTag(lvl);

            return (
              <button
                key={lvl}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all active:scale-95
                  ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 font-bold'
                      : isUnlocked
                      ? 'bg-[#181d28] hover:bg-[#202738] border-[#293245] text-white hover:border-emerald-500/50 cursor-pointer shadow-md'
                      : 'bg-[#10131a]/60 border-[#1c2230] text-slate-600 cursor-not-allowed'
                  }
                `}
              >
                {/* Level Tag (Grid size / Mode) */}
                <div className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-400 leading-none">
                  {gridTag}
                </div>

                {/* Level Number */}
                <span className="text-sm sm:text-base font-black mt-1">{lvl}</span>

                {/* Star Rating or Padlock */}
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {isUnlocked ? (
                    [1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-2.5 h-2.5 ${
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
