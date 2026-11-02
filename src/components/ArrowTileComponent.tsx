import React from 'react';
import {
  Lock,
  Key,
  Flame,
  RotateCw,
  ChevronsUp,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { ArrowTile, Direction } from '../types/game';

interface ArrowTileProps {
  arrow: ArrowTile;
  gridSize: number;
  isHinted: boolean;
  isBlocked: boolean;
  isFlying: boolean;
  combo?: number;
  reducedMotion?: boolean;
  onClick: (arrow: ArrowTile) => void;
}

const ROTATION_MAP: Record<Direction, string> = {
  UP: 'rotate(0deg)',
  RIGHT: 'rotate(90deg)',
  DOWN: 'rotate(180deg)',
  LEFT: 'rotate(270deg)',
};

export const ArrowTileComponent: React.FC<ArrowTileProps> = ({
  arrow,
  gridSize,
  isHinted,
  isBlocked,
  isFlying,
  combo = 0,
  reducedMotion = false,
  onClick,
}) => {
  const rotation = ROTATION_MAP[arrow.direction];

  // Trajectory calculation on escape
  const getFlyTransform = () => {
    if (reducedMotion) {
      switch (arrow.direction) {
        case 'UP':
          return 'translate3d(0, -60%, 0) scale(0.9)';
        case 'DOWN':
          return 'translate3d(0, 60%, 0) scale(0.9)';
        case 'LEFT':
          return 'translate3d(-60%, 0, 0) scale(0.9)';
        case 'RIGHT':
          return 'translate3d(60%, 0, 0) scale(0.9)';
      }
    }

    switch (arrow.direction) {
      case 'UP':
        return `translate3d(0, -${(arrow.row + 3) * 125}%, 0) scaleY(1.35) scaleX(0.72)`;
      case 'DOWN':
        return `translate3d(0, ${(gridSize - arrow.row + 2) * 125}%, 0) scaleY(1.35) scaleX(0.72)`;
      case 'LEFT':
        return `translate3d(-${(arrow.col + 3) * 125}%, 0, 0) scaleX(1.35) scaleY(0.72)`;
      case 'RIGHT':
        return `translate3d(${(gridSize - arrow.col + 2) * 125}%, 0, 0) scaleX(1.35) scaleY(0.72)`;
    }
  };

  const flyTransform = getFlyTransform();

  // Dynamic glow and trail colors reflecting combo tier or special arrow type
  let glowColor = 'rgba(34, 197, 94, 0.95)';
  let neonStroke = '#34d399';

  if (arrow.specialType === 'teleport') {
    glowColor = 'rgba(192, 132, 252, 0.95)';
    neonStroke = '#c084fc';
  } else if (arrow.specialType === 'explosive') {
    glowColor = 'rgba(249, 115, 22, 0.95)';
    neonStroke = '#f97316';
  } else if (arrow.specialType === 'double') {
    glowColor = 'rgba(6, 182, 212, 0.95)';
    neonStroke = '#06b6d4';
  } else if (arrow.specialType === 'rotating') {
    glowColor = 'rgba(20, 184, 166, 0.95)';
    neonStroke = '#14b8a6';
  } else if (arrow.isKey) {
    glowColor = 'rgba(250, 204, 21, 0.95)';
    neonStroke = '#facc15';
  } else if (arrow.isLocked) {
    glowColor = 'rgba(251, 191, 36, 0.95)';
    neonStroke = '#fbbf24';
  } else if (combo >= 5) {
    glowColor = 'rgba(251, 191, 36, 0.95)';
    neonStroke = '#fbbf24';
  } else if (combo >= 2) {
    glowColor = 'rgba(56, 189, 248, 0.95)';
    neonStroke = '#38bdf8';
  }

  // Border & background themes based on special mechanics
  const getContainerTheme = () => {
    if (isHinted) return 'bg-[#1b2b22] border-2 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)]';
    if (isBlocked) return 'bg-[#311419] border-2 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.8)] animate-shake';
    if (arrow.isLocked) return 'bg-[#221c12] border-2 border-amber-400/80 shadow-[0_0_14px_rgba(251,191,36,0.35)]';
    if (arrow.isKey) return 'bg-[#26210f] border-2 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.4)]';
    if (arrow.specialType === 'teleport') return 'bg-[#221430] border-2 border-purple-400/80 shadow-[0_0_16px_rgba(192,132,252,0.35)]';
    if (arrow.specialType === 'explosive') return 'bg-[#2d150b] border-2 border-orange-500/80 shadow-[0_0_16px_rgba(249,115,22,0.4)]';
    if (arrow.specialType === 'double') {
      return arrow.doubleStage === 1
        ? 'bg-[#0f2d33] border-2 border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.5)]'
        : 'bg-[#0e2229] border-2 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
    }
    if (arrow.specialType === 'rotating') return 'bg-[#0e2725] border-2 border-teal-400/80 shadow-[0_0_14px_rgba(20,184,166,0.35)]';
    if (isFlying) return 'bg-emerald-950 border-2 border-emerald-400';
    return 'bg-[#181c24] hover:bg-[#202734] border border-[#2b3345] hover:border-emerald-500/50 shadow-md shadow-black/40';
  };

  return (
    <button
      type="button"
      onClick={() => onClick(arrow)}
      aria-label={`Arrow pointing ${arrow.direction} at row ${arrow.row + 1}, col ${arrow.col + 1}${
        arrow.face ? ` on ${arrow.face} face` : ''
      }${arrow.isLocked ? ' (Locked)' : ''}${arrow.specialType ? ` (${arrow.specialType})` : ''}`}
      style={{
        transform: isFlying ? flyTransform : 'none',
        opacity: isFlying ? 0 : 1,
        transition: isFlying
          ? reducedMotion
            ? 'transform 200ms ease-out, opacity 180ms ease-out'
            : 'transform 280ms cubic-bezier(0.35, 0, 0.7, 0.1), opacity 230ms cubic-bezier(0.4, 0, 1, 1)'
          : 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        willChange: isFlying ? 'transform, opacity' : 'auto',
      }}
      className={`w-full h-full p-0.5 sm:p-1 flex items-center justify-center cursor-pointer select-none active:scale-[0.93] touch-manipulation group z-10 relative
        ${isHinted ? 'hint-glow' : ''}
        ${isFlying ? 'z-30 pointer-events-none' : ''}
      `}
    >
      {/* Motion Trail Behind Flying Arrow */}
      {isFlying && !reducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            filter: `drop-shadow(0 0 16px ${glowColor})`,
          }}
        >
          <div
            className="absolute inset-0 rounded-xl md:rounded-2xl border-2 opacity-60"
            style={{
              borderColor: neonStroke,
              transform:
                arrow.direction === 'UP'
                  ? 'translate3d(0, 30%, 0) scale(0.92)'
                  : arrow.direction === 'DOWN'
                  ? 'translate3d(0, -30%, 0) scale(0.92)'
                  : arrow.direction === 'LEFT'
                  ? 'translate3d(30%, 0, 0) scale(0.92)'
                  : 'translate3d(-30%, 0, 0) scale(0.92)',
              backgroundColor: glowColor,
            }}
          />
        </div>
      )}

      {/* Main Arrow Container Tile */}
      <div
        className={`w-full h-full rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-200 z-10 ${getContainerTheme()}`}
        style={
          isFlying
            ? {
                boxShadow: `0 0 25px ${glowColor}`,
                borderColor: neonStroke,
              }
            : undefined
        }
      >
        {/* Blocked mini indicator badge */}
        {isBlocked && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-black uppercase tracking-tighter pointer-events-none z-20 flex items-center gap-0.5 shadow-md animate-pulse">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>{arrow.isLocked ? 'Locked' : 'Blocked'}</span>
          </div>
        )}

        {/* Locked padlock badge */}
        {arrow.isLocked && !isBlocked && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-md bg-amber-500/30 border border-amber-400/60 flex items-center justify-center text-amber-300 pointer-events-none z-20 shadow-sm animate-pulse">
            <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Key Arrow Badge */}
        {arrow.isKey && !isBlocked && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-md bg-yellow-400/25 border border-yellow-400/70 flex items-center justify-center text-yellow-300 pointer-events-none z-20 shadow-sm animate-bounce">
            <Key className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Teleport Arrow Portal Badge */}
        {arrow.specialType === 'teleport' && !isBlocked && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-md bg-purple-500/30 border border-purple-400/70 flex items-center justify-center text-purple-300 pointer-events-none z-20 shadow-sm animate-pulse">
            <Radio className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Explosive Arrow Blast Badge */}
        {arrow.specialType === 'explosive' && !isBlocked && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-md bg-orange-500/30 border border-orange-400/70 flex items-center justify-center text-orange-300 pointer-events-none z-20 shadow-sm animate-pulse">
            <Flame className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Double Arrow Badge */}
        {arrow.specialType === 'double' && !isBlocked && (
          <div className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-cyan-500/30 border border-cyan-400/70 flex items-center gap-0.5 text-cyan-300 pointer-events-none z-20 shadow-sm">
            <ChevronsUp className="w-2.5 h-2.5 stroke-[2.5]" />
            <span className="text-[7px] font-black">{arrow.doubleStage === 1 ? '2/2' : '1/2'}</span>
          </div>
        )}

        {/* Rotating Arrow Compass Badge */}
        {arrow.specialType === 'rotating' && !isBlocked && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-md bg-teal-500/30 border border-teal-400/70 flex items-center justify-center text-teal-300 pointer-events-none z-20 shadow-sm">
            <RotateCw className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Arrow Vector Core */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-250 group-hover:scale-105"
          style={{ transform: rotation }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[62%] h-[62%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            fill="none"
            stroke="currentColor"
          >
            {/* Arrow Stem */}
            <path
              d="M12 20V5"
              stroke={
                isHinted || isFlying
                  ? neonStroke
                  : isBlocked
                  ? '#fb7185'
                  : arrow.isLocked
                  ? '#fbbf24'
                  : arrow.isKey
                  ? '#facc15'
                  : arrow.specialType
                  ? neonStroke
                  : '#f9fafb'
              }
              strokeWidth="2.75"
              strokeLinecap="round"
            />
            {/* Arrow Head */}
            <path
              d="M6 11L12 4L18 11"
              stroke={
                isHinted || isFlying
                  ? neonStroke
                  : isBlocked
                  ? '#fb7185'
                  : arrow.isLocked
                  ? '#fbbf24'
                  : arrow.isKey
                  ? '#facc15'
                  : arrow.specialType
                  ? neonStroke
                  : '#f9fafb'
              }
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Double Arrow Second Chevrons */}
            {arrow.specialType === 'double' && (
              <path
                d="M6 17L12 10L18 17"
                stroke={arrow.doubleStage === 1 ? '#22d3ee' : '#0891b2'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Glow Accent Dot on Arrow Tip */}
            <circle
              cx="12"
              cy="4"
              r="2"
              fill={
                isHinted || isFlying
                  ? neonStroke
                  : isBlocked
                  ? '#f43f5e'
                  : arrow.isLocked
                  ? '#f59e0b'
                  : arrow.isKey
                  ? '#facc15'
                  : arrow.specialType
                  ? neonStroke
                  : '#22c55e'
              }
              className="transition-colors duration-150"
            />
          </svg>
        </div>

        {/* Direction marker notch on border */}
        <div
          className={`absolute pointer-events-none transition-colors
            ${
              isHinted || isFlying
                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                : isBlocked
                ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]'
                : arrow.isLocked
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : arrow.specialType
                ? 'shadow-[0_0_8px_currentColor]'
                : 'bg-emerald-500/40 group-hover:bg-emerald-400'
            }
            ${arrow.direction === 'UP' ? 'top-0 left-1/2 -translate-x-1/2 w-4 h-[2px]' : ''}
            ${arrow.direction === 'DOWN' ? 'bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px]' : ''}
            ${arrow.direction === 'LEFT' ? 'left-0 top-1/2 -translate-y-1/2 h-4 w-[2px]' : ''}
            ${arrow.direction === 'RIGHT' ? 'right-0 top-1/2 -translate-y-1/2 h-4 w-[2px]' : ''}
          `}
          style={arrow.specialType ? { backgroundColor: neonStroke } : undefined}
        />
      </div>
    </button>
  );
};
