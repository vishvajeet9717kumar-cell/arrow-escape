import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Eye,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SettingsModalProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onChangeSoundVolume: (vol: number) => void;
  onChangeMusicVolume: (vol: number) => void;
  onToggleReducedMotion: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  musicEnabled,
  soundVolume,
  musicVolume,
  reducedMotion,
  onToggleSound,
  onToggleMusic,
  onChangeSoundVolume,
  onChangeMusicVolume,
  onToggleReducedMotion,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-sm bg-[#131720] border border-[#2b3345] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#222a3a] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Audio & Motion Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings"
            className="w-8 h-8 rounded-xl bg-[#1a202c] hover:bg-[#252e40] border border-[#2b3447] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings List */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Background Music Card */}
          <div className="p-3 rounded-2xl bg-[#171c26] border border-[#252e40] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className={`w-4 h-4 ${musicEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-white">Background Music</div>
                  <div className="text-[10px] text-slate-400">Original Cyberpunk Ambient</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMusic}
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  musicEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {musicEnabled && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#202738]">
                <span className="text-[10px] text-slate-400 font-semibold w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => onChangeMusicVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer h-1.5 bg-[#252e40] rounded-lg"
                />
                <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Sound Effects Card */}
          <div className="p-3 rounded-2xl bg-[#171c26] border border-[#252e40] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="font-bold text-white">Sound Effects</div>
                  <div className="text-[10px] text-slate-400">Taps, whooshes, combos & chimes</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleSound}
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {soundEnabled && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#202738]">
                <span className="text-[10px] text-slate-400 font-semibold w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => onChangeSoundVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer h-1.5 bg-[#252e40] rounded-lg"
                />
                <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Reduced Motion Toggle Card */}
          <div className="p-3 rounded-2xl bg-[#171c26] border border-[#252e40] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${reducedMotion ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold text-white">Reduced Motion</div>
                <div className="text-[10px] text-slate-400">Soft transitions & minimal shakes</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleReducedMotion}
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                reducedMotion
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sound Preview Lab */}
          <div className="p-3 rounded-2xl bg-[#11141c] border border-[#202636] flex flex-col gap-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>SFX Preview Lab</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sounds.resumeAudio();
                  sounds.playTap();
                }}
                className="py-1 px-1.5 rounded-lg bg-[#181d28] hover:bg-[#202736] text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Tap
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.resumeAudio();
                  sounds.playLaunch(1);
                }}
                className="py-1 px-1.5 rounded-lg bg-[#181d28] hover:bg-[#202736] text-[10px] font-bold text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer text-center"
              >
                Exit
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.resumeAudio();
                  sounds.playCombo(3);
                }}
                className="py-1 px-1.5 rounded-lg bg-[#181d28] hover:bg-[#202736] text-[10px] font-bold text-sky-300 hover:text-sky-200 transition-all cursor-pointer text-center"
              >
                Combo
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.resumeAudio();
                  sounds.playVictory();
                }}
                className="py-1 px-1.5 rounded-lg bg-[#181d28] hover:bg-[#202736] text-[10px] font-bold text-amber-300 hover:text-amber-200 transition-all cursor-pointer text-center"
              >
                Victory
              </button>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};
