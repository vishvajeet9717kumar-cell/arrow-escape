import React from 'react';
import {
  Box,
  Radio,
  Flame,
  ChevronsUp,
  RotateCw,
  Lock,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

export type TutorialType =
  | '3D_CUBE'
  | 'TELEPORT'
  | 'EXPLOSIVE'
  | 'DOUBLE'
  | 'ROTATING'
  | 'LOCKED';

interface TutorialModalProps {
  type: TutorialType;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ type, onClose }) => {
  const getTutorialContent = () => {
    switch (type) {
      case '3D_CUBE':
        return {
          title: '3D Cube Mode',
          subtitle: 'Welcome to Chapter 2: The Cube Dimension',
          badge: 'New Dimension',
          icon: <Box className="w-8 h-8 text-emerald-400 animate-pulse" />,
          steps: [
            {
              title: 'Six Distinct Faces',
              desc: 'Puzzles are now distributed across 6 interconnected faces: FRONT, BACK, LEFT, RIGHT, TOP & BOTTOM.',
            },
            {
              title: '360° Touch Drag',
              desc: 'Touch and drag anywhere on screen to smoothly spin the cube and inspect every angle.',
            },
            {
              title: 'Quick Face Navigator',
              desc: 'Tap any face button at the bottom to snap the camera directly to that side.',
            },
            {
              title: 'Face Boundary Escape',
              desc: 'Arrows escape when their direct route to their current face boundary is clear of other arrows.',
            },
          ],
        };

      case 'TELEPORT':
        return {
          title: 'Teleport Arrow',
          subtitle: 'Chapter 3: Quantum Mechanics',
          badge: 'Warp Portal',
          icon: <Radio className="w-8 h-8 text-purple-400 animate-pulse" />,
          steps: [
            {
              title: 'Warp Mechanics',
              desc: 'Teleport arrows possess quantum portal relays that allow them to bypass standard obstacles.',
            },
            {
              title: 'Linked Coordinates',
              desc: 'When launched, teleport arrows instantly phase through space and exit via their designated warp portal.',
            },
            {
              title: 'Clear Exit Path',
              desc: 'Both the launch vector and the exit portal trajectory must be unobstructed.',
            },
          ],
        };

      case 'EXPLOSIVE':
        return {
          title: 'Explosive Arrow',
          subtitle: 'Chapter 3: EMP Demolition',
          badge: 'Blast Radius',
          icon: <Flame className="w-8 h-8 text-orange-400 animate-pulse" />,
          steps: [
            {
              title: 'EMP Shockwave',
              desc: 'Explosive arrows are fitted with high-frequency kinetic detonators.',
            },
            {
              title: 'Clear Blockades',
              desc: 'When successfully launched, their shockwave automatically dislodges 1 adjacent blocking obstacle.',
            },
            {
              title: 'Chain Reactions',
              desc: 'Use explosive arrows strategically to crack open previously locked dependency chains.',
            },
          ],
        };

      case 'DOUBLE':
        return {
          title: 'Double Arrow',
          subtitle: 'Chapter 3: Two-Stage Propulsion',
          badge: 'Dual Charge',
          icon: <ChevronsUp className="w-8 h-8 text-cyan-400 animate-pulse" />,
          steps: [
            {
              title: 'Two-Stage Discharge',
              desc: 'Double arrows require two independent actions to fully clear the board.',
            },
            {
              title: 'Stage 1: Charge',
              desc: 'The first tap charges the secondary ignition thruster (status 1/2).',
            },
            {
              title: 'Stage 2: Launch',
              desc: 'The second tap launches the arrow out once its exit vector is completely unobstructed.',
            },
          ],
        };

      case 'ROTATING':
        return {
          title: 'Rotating Arrow',
          subtitle: 'Chapter 3: Directional Compass',
          badge: 'Ratchet Turn',
          icon: <RotateCw className="w-8 h-8 text-teal-400 animate-spin-slow" />,
          steps: [
            {
              title: 'Tactical Realignment',
              desc: 'Rotating arrows feature a 90° clockwise ratchet mechanism.',
            },
            {
              title: 'Tap to Turn',
              desc: 'If blocked, tapping the arrow rotates it 90 degrees to search for a new escape corridor.',
            },
            {
              title: 'Launch on Clear',
              desc: 'Once rotated to face an unobstructed boundary, clicking it triggers immediate flight.',
            },
          ],
        };

      case 'LOCKED':
        return {
          title: 'Key & Locked Arrow',
          subtitle: 'Chapter 3: Security Vault',
          badge: 'Vault Key',
          icon: <Lock className="w-8 h-8 text-amber-400 animate-pulse" />,
          steps: [
            {
              title: 'Encrypted Vault',
              desc: 'Locked arrows are secured behind heavy cybernetic padlocks and cannot move initially.',
            },
            {
              title: 'Find the Key',
              desc: 'Locate and escape the golden Key Arrow to release the security lock.',
            },
            {
              title: 'Unlock & Escape',
              desc: 'Once the key is collected, the vault arrow unlocks and can fly to freedom.',
            },
          ],
        };
    }
  };

  const content = getTutorialContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-sm bg-[#131720] border border-[#2b3345] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222a3a]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1b2230] border border-[#2c374d] flex items-center justify-center shadow-inner">
              {content.icon}
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {content.badge}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {content.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Tutorial"
            className="w-8 h-8 rounded-xl bg-[#1a202c] hover:bg-[#252e40] border border-[#2b3447] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-3 font-medium">
          {content.subtitle}
        </p>

        {/* Instructions Steps */}
        <div className="flex flex-col gap-2.5 my-1">
          {content.steps.map((s, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-[#171c26] border border-[#252e40] flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{s.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start / Got It Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <span>Got It · Let's Play</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
