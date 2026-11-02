import React, { useState } from 'react';
import {
  Play,
  Grid,
  Gift,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Coins,
  Sparkles,
  Zap,
  Film,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MainMenuProps {
  currentLevel: number;
  unlockedLevel: number;
  coins: number;
  bestRushScore: number;
  isDailyAvailable: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
  onPlay: (level?: number) => void;
  onPlayRush: () => void;
  onWatchAdCoins?: () => void;
  onOpenLevelSelect: () => void;
  onOpenDaily: () => void;
  onOpenHowToPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentLevel,
  unlockedLevel,
  coins,
  bestRushScore,
  isDailyAvailable,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenSettings,
  onPlay,
  onPlayRush,
  onWatchAdCoins,
  onOpenLevelSelect,
  onOpenDaily,
  onOpenHowToPlay,
}) => {
  // Mini interactive toy on title screen: 4 playful arrows that fly away when clicked!
  const [toyArrows, setToyArrows] = useState<
    { id: string; dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'; label: string; active: boolean }[]
  >([
    { id: 't1', dir: 'UP', label: '▲', active: true },
    { id: 't2', dir: 'RIGHT', label: '►', active: true },
    { id: 't3', dir: 'DOWN', label: '▼', active: true },
    { id: 't4', dir: 'LEFT', label: '◄', active: true },
  ]);

  const handleToyClick = (id: string) => {
    sounds.playLaunch();
    setToyArrows((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: false } : a))
    );
    setTimeout(() => {
      setToyArrows((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: true } : a))
      );
    }, 1200);
  };

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center px-4 py-3 sm:py-5 max-w-md mx-auto select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Music Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Mute Music' : 'Unmute Music'}
            className="w-10 h-10 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Music className={`w-4 h-4 ${musicEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="w-10 h-10 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings Modal Launcher */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Audio & Motion Settings"
            className="w-10 h-10 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {onWatchAdCoins && (
            <button
              type="button"
              onClick={onWatchAdCoins}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 border border-amber-500/40 text-amber-300 active:scale-95 transition-all cursor-pointer shadow-sm animate-pulse"
              title="Watch a short ad for +50 free coins"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black">+50 🪙</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151923] border border-[#262f42]">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-bold text-amber-300 tabular-nums">
              {coins}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Branding Section */}
      <div className="w-full flex flex-col items-center text-center my-auto py-1">
        {/* Interactive Toy Logo Grid */}
        <div className="relative mb-2 sm:mb-3">
          <div className="absolute -inset-3 bg-emerald-500/10 rounded-2xl blur-xl pointer-events-none" />
          <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#11141c] border border-[#222938] rounded-2xl shadow-xl">
            {toyArrows.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleToyClick(a.id)}
                aria-label={`Interactive preview arrow ${a.dir}`}
                style={{
                  transform: a.active ? 'none' : 'scale(0.5)',
                  opacity: a.active ? 1 : 0,
                  transition: 'all 180ms cubic-bezier(0.2, 1, 0.4, 1)',
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#1a202c] hover:bg-[#252e40] border border-[#2d374d] hover:border-emerald-500/60 flex items-center justify-center text-white text-base font-black active:scale-90 transition-all cursor-pointer shadow-md group"
              >
                <span className="group-hover:text-emerald-400 transition-colors">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          ARROW <span className="text-emerald-400">ESCAPE</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-xs font-medium leading-relaxed mb-2">
          Unravel the directional web. Clear arrows with unobstructed trajectories.
        </p>

        {/* Level Progression Indicator */}
        <div className="px-3 py-1 rounded-full bg-[#161a25] border border-[#273042] text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Unlocked Level {unlockedLevel} / 500</span>
        </div>

        {/* Quick Chapter / Difficulty Jump Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#121620] rounded-xl border border-[#202738] max-w-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Jump:
          </span>
          <button
            type="button"
            onClick={() => onPlay(1)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
          >
            Ch 1 (2D)
          </button>
          <button
            type="button"
            onClick={() => onPlay(101)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all cursor-pointer"
          >
            Ch 2 (3D)
          </button>
          <button
            type="button"
            onClick={() => onPlay(201)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
          >
            Ch 3 (Special)
          </button>
        </div>
      </div>

      {/* Main Buttons Section */}
      <div className="w-full flex flex-col gap-2.5 shrink-0">
        {/* Primary Play Button */}
        <button
          type="button"
          onClick={() => onPlay()}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 stroke-none" />
          <span>PLAY LEVEL {currentLevel}</span>
        </button>

        {/* 60s Rush Mode Blitz Button */}
        <button
          type="button"
          onClick={onPlayRush}
          className="w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-extrabold text-xs sm:text-sm flex items-center justify-between px-3.5 sm:px-4 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/10 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
            </div>
            <span className="tracking-wide">60s RUSH BLITZ</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
            {bestRushScore > 0 ? `Best: ${bestRushScore.toLocaleString()} pts` : 'Rapid Challenge'}
          </div>
        </button>

        {/* Secondary Buttons Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Level Select */}
          <button
            type="button"
            onClick={onOpenLevelSelect}
            className="h-11 sm:h-12 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex flex-col items-center justify-center gap-0.5 text-slate-300 hover:text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold">500 Levels</span>
          </button>

          {/* Daily Reward with notification dot */}
          <button
            type="button"
            onClick={onOpenDaily}
            className="relative h-11 sm:h-12 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex flex-col items-center justify-center gap-0.5 text-slate-300 hover:text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold">Daily Gift</span>
            {isDailyAvailable && (
              <span className="absolute 1.5 top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d0f12] animate-ping" />
            )}
            {isDailyAvailable && (
              <span className="absolute 1.5 top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d0f12]" />
            )}
          </button>

          {/* How to Play */}
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="h-11 sm:h-12 rounded-xl bg-[#151923] hover:bg-[#1f2636] border border-[#262f42] flex flex-col items-center justify-center gap-0.5 text-slate-300 hover:text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold">Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
