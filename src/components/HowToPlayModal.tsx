import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  Box,
  Sparkles,
  CheckCircle2,
  Zap,
  Bomb,
  RotateCw,
  Key,
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'classic' | 'cube' | 'special'>('classic');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-md bg-[#12151d] border border-[#262d3d] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-left max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2533] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Game Guide & Mechanics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-[#1a1f2b] hover:bg-[#242b3b] border border-[#2c3447] flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#161a25] rounded-xl border border-[#242c3d] my-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('classic')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'classic'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classic 2D
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cube')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cube'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Cube
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('special')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'special'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Special Arrows
          </button>
        </div>

        {/* Content body based on active tab */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs text-slate-300">
          {activeTab === 'classic' && (
            <>
              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Find Clear Escape Paths</span>
                  Arrows can only fly out if their path straight to the boundary edge is completely clear.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Avoid Blockages</span>
                  If another arrow is blocking the way, tapping it triggers a red shake. Clear the blocker first!
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Chain Combos</span>
                  Consecutive successful taps rack up combo multipliers (x2, x3, x5) for high rush scores.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">100% Guaranteed Solvable</span>
                  Every level from 1 to 500 is tested and verified solvable by our solver engine.
                </div>
              </div>
            </>
          )}

          {activeTab === 'cube' && (
            <>
              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 text-xs">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">6 Independent Faces</span>
                  Chapters 2, 4, and 5 take Arrow Escape into true 3D space. Arrows occupy Front, Back, Left, Right, Top, and Bottom faces.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  ↺
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Smooth 360° Drag & Quick Snap</span>
                  Drag anywhere on the cube canvas to rotate freely in full 3D, or tap the quick-face buttons (F, R, B, L, T, D) at the bottom.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  ⚡
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Face-Boundary Trajectories</span>
                  Arrows on each face must escape off their own face boundary without bumping into neighboring arrows.
                </div>
              </div>
            </>
          )}

          {activeTab === 'special' && (
            <>
              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  ◎
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Teleport Arrow (Violet)</span>
                  Passes through a designated warp coordinate, escaping obstacles in between.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Bomb className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Explosive Arrow (Orange)</span>
                  When launched, detonates adjacent arrows that have clear exit paths, clearing tight clusters.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Double Arrow (Cyan)</span>
                  Requires two actions: 1st tap charges energy (x1), 2nd tap launches the arrow out.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Rotating Arrow (Teal)</span>
                  Ratchet mechanism: rotates 90° clockwise when tapped until aligned with an open escape vector.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#181d28] p-3 rounded-2xl border border-[#242c3d]">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block mb-0.5">Locked & Key Arrows</span>
                  Locked arrow (red padlock) is shielded until its corresponding Key arrow (golden key) is safely escaped.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1f2533] mt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Got It, Let's Play!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
