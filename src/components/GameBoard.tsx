import React, { useMemo, useState, useEffect } from 'react';
import { ArrowTile } from '../types/game';
import { ArrowTileComponent } from './ArrowTileComponent';
import { Zap, Flame, Sparkles } from 'lucide-react';

interface SparkParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface GameBoardProps {
  gridSize: number;
  arrows: ArrowTile[];
  hintedArrowId: string | null;
  blockedArrowId: string | null;
  blockedCoord: { row: number; col: number } | null;
  flyingArrowId: string | null;
  combo?: number;
  reducedMotion?: boolean;
  onTileClick: (arrow: ArrowTile) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gridSize,
  arrows,
  hintedArrowId,
  blockedArrowId,
  blockedCoord,
  flyingArrowId,
  combo = 0,
  reducedMotion = false,
  onTileClick,
}) => {
  const [particles, setParticles] = useState<SparkParticle[]>([]);

  // Spawn small glowing particles when an arrow successfully escapes
  useEffect(() => {
    if (!flyingArrowId || reducedMotion) return;

    const target = arrows.find((a) => a.id === flyingArrowId);
    if (!target) return;

    // Origin percentage inside grid
    const originX = ((target.col + 0.5) / gridSize) * 100;
    const originY = ((target.row + 0.5) / gridSize) * 100;

    const particleColor =
      combo >= 5
        ? '#fbbf24'
        : combo >= 2
        ? '#38bdf8'
        : '#22c55e';

    const count = 9;
    const newSparks: SparkParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 25 + Math.random() * 35;
      newSparks.push({
        id: `sp_${Date.now()}_${i}`,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        size: 3 + Math.random() * 3,
      });
    }

    setParticles(newSparks);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 380);

    return () => clearTimeout(timer);
  }, [flyingArrowId, gridSize, combo, reducedMotion, arrows]);

  // Generate grid matrix coordinates
  const boardCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        cells.push({ row: r, col: c, key: `${r}-${c}` });
      }
    }
    return cells;
  }, [gridSize]);

  // Arrow lookup map by coordinate
  const arrowMap = useMemo(() => {
    const map = new Map<string, ArrowTile>();
    for (const a of arrows) {
      map.set(`${a.row},${a.col}`, a);
    }
    return map;
  }, [arrows]);

  // Determine blocked arrow object if currently blocked
  const blockedArrow = useMemo(() => {
    if (!blockedArrowId) return null;
    return arrows.find((a) => a.id === blockedArrowId) || null;
  }, [blockedArrowId, arrows]);

  // Calculate combo multiplier
  const multiplier = combo >= 6 ? 5 : combo >= 4 ? 3 : combo >= 2 ? 2 : 1;

  return (
    <div className="w-full flex items-center justify-center select-none py-1 relative">
      {/* Outer responsive frame container: fits Android mobile viewports without vertical overflow */}
      <div
        className={`relative w-[min(88vw,calc(100dvh-200px),390px)] aspect-square bg-[#101217] rounded-3xl p-2.5 sm:p-3 border transition-all duration-300 flex items-center justify-center
          ${
            multiplier >= 5
              ? 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.45)]'
              : multiplier >= 3
              ? 'border-emerald-400 shadow-[0_0_25px_rgba(34,197,94,0.35)]'
              : multiplier >= 2
              ? 'border-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
              : 'border-[#232733] shadow-2xl shadow-black/80'
          }
        `}
      >
        {/* Subtle grid border background glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Shockwave energy pulse on combo streaks */}
        {multiplier >= 2 && !reducedMotion && (
          <div
            key={`shock_${multiplier}`}
            className="absolute inset-0 rounded-3xl border-2 pointer-events-none animate-ping opacity-25"
            style={{
              borderColor:
                multiplier >= 5 ? '#fbbf24' : multiplier >= 3 ? '#22c55e' : '#38bdf8',
            }}
          />
        )}

        {/* Floating Combo Multiplier Badge */}
        {multiplier >= 2 && (
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 z-40 shadow-lg pointer-events-none
              ${reducedMotion ? '' : 'animate-bounce'}
              ${
                multiplier >= 5
                  ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300'
                  : multiplier >= 3
                  ? 'bg-emerald-400 text-black shadow-emerald-400/40 ring-2 ring-emerald-300'
                  : 'bg-sky-400 text-black shadow-sky-400/40 ring-1 ring-sky-200'
              }
            `}
          >
            {multiplier >= 5 ? (
              <Sparkles className="w-3 h-3 fill-black" />
            ) : multiplier >= 3 ? (
              <Flame className="w-3 h-3 fill-black" />
            ) : (
              <Zap className="w-3 h-3 fill-black" />
            )}
            <span>x{multiplier} COMBO!</span>
          </div>
        )}

        {/* Board grid inner area */}
        <div
          className="relative w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {/* Background grid cell tiles (clean empty cells with no tiny dark dots) */}
          {boardCells.map((cell) => {
            const hasArrow = arrowMap.has(`${cell.row},${cell.col}`);
            const isBlockedTarget =
              blockedCoord &&
              blockedCoord.row === cell.row &&
              blockedCoord.col === cell.col;

            return (
              <div
                key={cell.key}
                className="p-0.5 sm:p-1 flex items-center justify-center relative"
              >
                <div
                  className={`w-full h-full rounded-xl md:rounded-2xl transition-all duration-150 border
                    ${
                      isBlockedTarget
                        ? 'border-rose-500/80 bg-rose-950/30 shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                        : hasArrow
                        ? 'border-transparent bg-transparent'
                        : 'border-[#1b1f2b] bg-[#12151d]/35'
                    }
                  `}
                />
              </div>
            );
          })}

          {/* Render Active Arrows in Grid Cells */}
          {arrows.map((arrow) => {
            const isHinted = arrow.id === hintedArrowId;
            const isBlocked = arrow.id === blockedArrowId;
            const isFlying = arrow.id === flyingArrowId;

            return (
              <div
                key={arrow.id}
                style={{
                  gridRowStart: arrow.row + 1,
                  gridColumnStart: arrow.col + 1,
                }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <ArrowTileComponent
                  arrow={arrow}
                  gridSize={gridSize}
                  isHinted={isHinted}
                  isBlocked={isBlocked}
                  isFlying={isFlying}
                  combo={combo}
                  reducedMotion={reducedMotion}
                  onClick={onTileClick}
                />
              </div>
            );
          })}

          {/* Small Glowing Escape Particles */}
          {particles.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
            >
              {particles.map((p) => (
                <circle
                  key={p.id}
                  cx={`${p.x}%`}
                  cy={`${p.y}%`}
                  r={p.size}
                  fill={p.color}
                  className="animate-sparkle"
                  style={{
                    filter: `drop-shadow(0 0 6px ${p.color})`,
                    transform: `translate3d(${p.vx}px, ${p.vy}px, 0)`,
                    transition: 'all 350ms cubic-bezier(0.1, 0.9, 0.2, 1)',
                    opacity: 0,
                  }}
                />
              ))}
            </svg>
          )}

          {/* Blocked Path Line & Obstacle Indicator */}
          {blockedArrow && blockedCoord && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
              style={{ overflow: 'visible' }}
            >
              <line
                x1={`${((blockedArrow.col + 0.5) / gridSize) * 100}%`}
                y1={`${((blockedArrow.row + 0.5) / gridSize) * 100}%`}
                x2={`${((blockedCoord.col + 0.5) / gridSize) * 100}%`}
                y2={`${((blockedCoord.row + 0.5) / gridSize) * 100}%`}
                stroke="#f43f5e"
                strokeWidth="3"
                strokeDasharray="4 3"
                className="animate-pulse"
              />
              {/* Obstacle pulsing red radar ping */}
              <circle
                cx={`${((blockedCoord.col + 0.5) / gridSize) * 100}%`}
                cy={`${((blockedCoord.row + 0.5) / gridSize) * 100}%`}
                r="8"
                fill="#f43f5e"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={`${((blockedCoord.col + 0.5) / gridSize) * 100}%`}
                cy={`${((blockedCoord.row + 0.5) / gridSize) * 100}%`}
                r="4.5"
                fill="#f43f5e"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
