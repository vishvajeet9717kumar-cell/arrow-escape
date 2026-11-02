import React, { useEffect, useRef } from 'react';
import { Star, Coins, ArrowRight, RotateCcw, Grid } from 'lucide-react';
import { sounds } from '../utils/audio';

interface VictoryModalProps {
  levelNumber: number;
  archetype?: string;
  stars: number;
  coinsEarned: number;
  movesCount: number;
  parMoves: number;
  hintsUsed: number;
  undoCount: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  archetype,
  stars,
  coinsEarned,
  movesCount,
  parMoves,
  hintsUsed,
  undoCount,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    sounds.playVictory();

    // Sequence celebratory audio chimes
    const timer1 = setTimeout(() => sounds.playStar(0), 280);
    const timer2 = setTimeout(() => {
      if (stars >= 2) sounds.playStar(1);
    }, 520);
    const timer3 = setTimeout(() => {
      if (stars >= 3) sounds.playStar(2);
    }, 760);
    const timer4 = setTimeout(() => sounds.playCoin(), 1020);

    // Particle Burst Animation on Canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvas.parentElement?.clientWidth || 360;
        canvas.height = canvas.parentElement?.clientHeight || 480;

        interface Particle {
          x: number;
          y: number;
          vx: number;
          vy: number;
          radius: number;
          color: string;
          alpha: number;
          decay: number;
          rotation: number;
          vRot: number;
        }

        const colors = ['#22c55e', '#34d399', '#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'];
        const particles: Particle[] = [];
        const count = 45;
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.35;

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 5.5;
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            radius: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: 0.012 + Math.random() * 0.015,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.2,
          });
        }

        let animFrameId: number;
        const render = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;

          for (const p of particles) {
            if (p.alpha <= 0) continue;
            alive = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12; // Gravity
            p.vx *= 0.98;
            p.alpha = Math.max(0, p.alpha - p.decay);
            p.rotation += p.vRot;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (alive) {
            animFrameId = requestAnimationFrame(render);
          }
        };

        animFrameId = requestAnimationFrame(render);

        return () => {
          cancelAnimationFrame(animFrameId);
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      }
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-sm bg-[#131720] border border-[#2b3345] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 flex flex-col items-center text-center overflow-hidden">
        {/* Confetti & Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
          {archetype ? `${archetype} Cleared` : 'Puzzle Solved'}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
          Level {levelNumber} Complete!
        </h2>

        {/* 3 Stars Award with bounce */}
        <div className="flex items-center justify-center gap-2.5 mb-4 z-20">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-300 transform
                  ${
                    isEarned
                      ? 'scale-100 text-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.7)] animate-[bounce_0.6s_ease-out]'
                      : 'scale-90 text-slate-700'
                  }
                `}
              >
                <Star
                  className={`w-9 h-9 sm:w-10 sm:h-10 ${
                    isEarned ? 'fill-amber-400 stroke-amber-400' : 'fill-slate-800 stroke-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Coins Reward Card */}
        <div className="w-full bg-[#181d28] border border-[#262e3e] rounded-2xl p-2.5 sm:p-3 mb-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">Reward</div>
              <div className="text-xs sm:text-sm font-bold text-white">Level Bonus</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-300 tabular-nums">
            +{coinsEarned}🪙
          </div>
        </div>

        {/* Stats Summary */}
        <div className="w-full grid grid-cols-3 gap-2 py-2.5 px-2 mb-4 border-y border-[#1f2635] text-[11px] z-20">
          <div>
            <div className="text-slate-400 mb-0.5">Moves</div>
            <div className="font-bold text-white tabular-nums">
              {movesCount} / {parMoves}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Undos</div>
            <div className="font-bold text-white tabular-nums">{undoCount}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Hints</div>
            <div className="font-bold text-white tabular-nums">{hintsUsed}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 z-20">
          <button
            type="button"
            onClick={onNextLevel}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            <span>Next Level</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="h-10 rounded-xl bg-[#181d28] hover:bg-[#202736] border border-[#283244] text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={onLevelSelect}
              className="h-10 rounded-xl bg-[#181d28] hover:bg-[#202736] border border-[#283244] text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
