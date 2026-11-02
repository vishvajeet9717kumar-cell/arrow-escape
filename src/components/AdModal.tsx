import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AdType, RewardReason } from '../types/game';
import { REWARD_CONFIGS, adManager } from '../utils/adManager';
import { sounds } from '../utils/audio';

interface AdModalProps {
  type: AdType;
  rewardReason?: RewardReason;
  onReward?: (reason: RewardReason) => void;
  onClose: () => void;
}

// Engaging mock sponsor campaigns for high-tech aesthetic
const SPONSOR_CAMPAIGNS = [
  {
    title: 'CYBER RUNNER 2088',
    category: 'Cyberpunk Hyper-Speed 3D',
    tagline: 'Defy gravity. Hack the neon grid in real-time.',
    accentColor: '#10b981', // Neon emerald
    badge: '★ 4.9 · 10M+ Downloads',
    actionText: 'INSTALL FREE',
  },
  {
    title: 'QUANTUM PULSE RPG',
    category: 'Sci-Fi Spatial Adventure',
    tagline: 'Forge your hyper-suit. Battle rogue AI cores.',
    accentColor: '#38bdf8', // Neon cyan
    badge: '★ 4.8 · Editor Choice',
    actionText: 'PLAY NOW',
  },
  {
    title: 'SYNTHWAVE DRIFT',
    category: 'Retro Arcade Racing',
    tagline: 'Night drive through eternal retrowave cities.',
    accentColor: '#a855f7', // Neon purple
    badge: '★ 4.9 · Top Free 2026',
    actionText: 'GET APP',
  },
];

export const AdModal: React.FC<AdModalProps> = ({
  type,
  rewardReason,
  onReward,
  onClose,
}) => {
  const isRewarded = type === 'rewarded';
  const totalDuration = isRewarded ? 6 : 5; // 6s for rewarded, 5s for interstitial
  const skipAllowedAt = isRewarded ? 5 : 3;

  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [canSkip, setCanSkip] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [interactScore, setInteractScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const campaign = useRef(
    SPONSOR_CAMPAIGNS[Math.floor(Math.random() * SPONSOR_CAMPAIGNS.length)]
  ).current;

  const rewardConfig = rewardReason ? REWARD_CONFIGS[rewardReason] : null;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          if (isRewarded && !rewardGranted) {
            setRewardGranted(true);
            sounds.playAdReward();
            adManager.recordRewardedWatched(rewardConfig?.rewardValue || 0);
          } else if (!isRewarded) {
            adManager.markInterstitialShown();
          }
          return 0;
        }

        const nextVal = prev - 1;
        if (nextVal <= totalDuration - skipAllowedAt) {
          setCanSkip(true);
        }

        if (!isMuted) {
          sounds.playAdTick();
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRewarded, rewardConfig, rewardGranted, isMuted, totalDuration, skipAllowedAt]);

  // Video Canvas Simulation (Futuristic Neon Tunnel & Particle Grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800,
        size: 1 + Math.random() * 2,
      });
    }

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Dark background with animated gradient
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, w, h);

      // Cyber Grid / Tunnel
      ctx.save();
      ctx.strokeStyle = `${campaign.accentColor}33`;
      ctx.lineWidth = 1.5;

      const tunnelCount = 5;
      for (let i = 0; i < tunnelCount; i++) {
        const progress = ((frame * 2 + i * 80) % 400) / 400;
        const size = progress * Math.min(w, h) * 0.95;
        if (size > 10) {
          ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        }
      }

      // Connecting perspective lines
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(0, 0);
      ctx.moveTo(cx, cy);
      ctx.lineTo(w, 0);
      ctx.moveTo(cx, cy);
      ctx.lineTo(w, h);
      ctx.moveTo(cx, cy);
      ctx.lineTo(0, h);
      ctx.stroke();

      // Starfield warp
      ctx.fillStyle = '#ffffff';
      for (const s of stars) {
        s.z -= 6;
        if (s.z <= 0) {
          s.z = 800;
          s.x = (Math.random() - 0.5) * 800;
          s.y = (Math.random() - 0.5) * 800;
        }
        const k = 200 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px < w && py >= 0 && py < h) {
          const sz = Math.min(4, s.size * k * 1.5);
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fillStyle = campaign.accentColor;
          ctx.fill();
        }
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [campaign]);

  const handleInteractiveTap = () => {
    sounds.playTap();
    setInteractScore((s) => s + 100);
  };

  const handleSkipOrClose = () => {
    if (isRewarded && !rewardGranted && timeLeft > 0) {
      setShowExitConfirm(true);
      return;
    }

    if (isRewarded && rewardGranted && rewardReason && onReward) {
      onReward(rewardReason);
    }
    onClose();
  };

  const handleClaim = () => {
    if (rewardReason && onReward) {
      onReward(rewardReason);
    }
    onClose();
  };

  const progressPercent = Math.min(
    100,
    Math.round(((totalDuration - timeLeft) / totalDuration) * 100)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#0f131c] border border-[#263044] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#141924] border-b border-[#21293a] z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {isRewarded ? 'Rewarded Sponsor' : 'Ad Break'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Arrow Network</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'Unmute ad audio' : 'Mute ad audio'}
              className="w-7 h-7 rounded-lg bg-[#1c2333] hover:bg-[#252e42] flex items-center justify-center text-slate-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Skip / Close Button */}
            <button
              type="button"
              onClick={handleSkipOrClose}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer
                ${
                  canSkip || rewardGranted
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#1c2333] text-slate-400 hover:text-white cursor-pointer'
                }
              `}
            >
              {rewardGranted ? (
                <>
                  <span>Claim</span>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              ) : canSkip ? (
                <>
                  <span>Skip</span>
                  <X className="w-3.5 h-3.5" />
                </>
              ) : (
                <span className="tabular-nums text-[11px] text-slate-400 font-semibold">
                  {timeLeft}s
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="w-full h-1 bg-[#1a2130]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="w-full h-full object-cover"
          />

          {/* Interactive Playable Mini-Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                {campaign.badge}
              </span>

              {isRewarded && (
                <div
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-lg transition-all ${
                    rewardGranted
                      ? 'bg-emerald-500 text-slate-950 font-black scale-105 animate-bounce'
                      : 'bg-black/70 text-amber-300 border border-amber-500/40 backdrop-blur-sm'
                  }`}
                >
                  {rewardGranted ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reward Ready!</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reward in {timeLeft}s</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Playable interactive prompt */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <button
                type="button"
                onClick={handleInteractiveTap}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 hover:border-emerald-400/60 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-lg backdrop-blur-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Tap for Nitro: {interactScore}</span>
              </button>

              <div className="flex items-center gap-1 text-[10px] text-slate-300 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>Sponsored Video</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor Creative Content */}
        <div className="p-3.5 sm:p-4 flex flex-col gap-3 bg-[#0f131c]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {campaign.category}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {campaign.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                {campaign.tagline}
              </p>
            </div>

            <button
              type="button"
              onClick={handleInteractiveTap}
              className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#1c2436] hover:bg-[#253047] border border-[#2d3a54] flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <span>{campaign.actionText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Reward Status Card for Rewarded Ads */}
          {isRewarded && rewardConfig && (
            <div
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                rewardGranted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-[#151a26] border-[#222b3d] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    rewardGranted
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {rewardGranted ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Award className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {rewardConfig.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {rewardGranted
                      ? 'Reward unlocked! Click Claim to receive your bonus.'
                      : rewardConfig.description}
                  </div>
                </div>
              </div>

              {rewardGranted && (
                <button
                  type="button"
                  onClick={handleClaim}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/25 cursor-pointer shrink-0"
                >
                  CLAIM
                </button>
              )}
            </div>
          )}

          {/* Interstitial Bottom Action */}
          {!isRewarded && (
            <button
              type="button"
              onClick={handleSkipOrClose}
              disabled={!canSkip}
              className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                canSkip
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#181f2e] text-slate-500 border border-[#232c40] cursor-not-allowed'
              }`}
            >
              {canSkip ? (
                <>
                  <span>Continue Game</span>
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              ) : (
                <span>Ad finishes in {timeLeft}s...</span>
              )}
            </button>
          )}
        </div>

        {/* Exit Early Warning Confirmation Modal */}
        {showExitConfirm && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#151a26] border border-[#2d384d] rounded-2xl p-4 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white mb-1">
                Discard Reward?
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Watch just {timeLeft} more seconds to receive your {rewardConfig?.title || 'reward'}!
              </p>
              <div className="w-full flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="flex-1 h-9 rounded-xl bg-[#202738] hover:bg-[#283248] text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Exit Early
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
