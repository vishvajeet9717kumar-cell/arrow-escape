import React, { useState } from 'react';
import { ExternalLink, X, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface BannerAdProps {
  onTapSponsor?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Sponsor Advertisement"
      className="w-full max-w-md mx-auto px-2 pt-1 pb-1 shrink-0 z-10 transition-all duration-200"
    >
      <div className="w-full bg-[#121622]/95 border border-[#232d3f] hover:border-emerald-500/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-lg backdrop-blur-sm">
        {/* Ad Badge & Sponsor Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                AD
              </span>
              <span className="text-[10px] font-bold text-slate-300 truncate">
                Cyber Dash 3D
              </span>
            </div>
            {!isCollapsed && (
              <span className="text-[9px] text-slate-400 truncate">
                Defy neon gravity. Play now free!
              </span>
            )}
          </div>
        </div>

        {/* Action & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => {}}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Install</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand banner ad' : 'Collapse banner ad'}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a2030] transition-colors"
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner ad"
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a2030] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
