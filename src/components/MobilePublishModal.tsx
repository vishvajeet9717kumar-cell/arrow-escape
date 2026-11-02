import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Sparkles,
  X,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobilePublishModalProps {
  onClose: () => void;
}

export const MobilePublishModal: React.FC<MobilePublishModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'INSTANT' | 'APK' | 'PLAYSTORE'>('INSTANT');
  const [copiedLink, setCopiedLink] = useState(false);

  const sharedAppUrl = 'https://ais-pre-dizrxk6dvuwquq4cjvhcyf-476349475614.asia-northeast1.run.app';
  const githubRepoUrl = 'https://github.com/vishvajeet9717kumar-cell/arrow-escape';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0c1017] border border-[#232d3f] rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1d2636] bg-[#101520]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Mobile Launch & Install Hub
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Easy Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">Phone se launch aur install karne ke aasan tareeke</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#18202e] hover:bg-[#222c3f] border border-[#26334a] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#090d14] border-b border-[#1b2333]">
          <button
            type="button"
            onClick={() => setActiveTab('INSTANT')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'INSTANT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b27]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Tap Install</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APK')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'APK'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b27]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Direct APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PLAYSTORE')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'PLAYSTORE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b27]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Play Store & Ads</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {/* TAB 1: INSTANT 1-TAP INSTALL (RECOMMENDED FOR MOBILE) */}
          {activeTab === 'INSTANT' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-white mb-0.5">Sabse Aasan Tareeka (No PC, ₹0 Kharcha, 1-Click):</p>
                  Aapka game live ho chuka hai! Ise apne phone par bina kisi play store fee ke direct install kar sakte hain. Yeh full screen native app jaisa khulta hai aur offline bhi chalta hai.
                </div>
              </div>

              {/* Install Trigger Button if available in browser */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer animate-bounce"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📲 Abhi Phone me Install Karein (1-Click)</span>
                </button>
              )}

              {isInstalled && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  App aapke phone me successfully installed hai!
                </div>
              )}

              {/* Step by Step Mobile Guide */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Android Chrome me 2-Step Install:
                </h4>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#121722] border border-[#1e2636]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <div>
                    Apne phone me Google Chrome kholein aur is link par jayein:
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <input
                        type="text"
                        readOnly
                        value={sharedAppUrl}
                        className="w-full text-[10px] px-2 py-1 rounded bg-[#090d14] border border-[#273247] text-slate-300 select-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0"
                      >
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#121722] border border-[#1e2636]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <div className="text-slate-300">
                    Chrome me upar right side <strong>3 dots (⋮)</strong> dabayein aur <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#121722] border border-[#1e2636]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <div className="text-slate-300">
                    Game ka official logo aapki mobile home screen par aa jayega, aur bina browser bar ke real Android app ki tarah open hoga!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT APK DOWNLOAD VIA GITHUB */}
          {activeTab === 'APK' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 flex items-start gap-3">
                <Download className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-white mb-0.5">Apne Phone par Direct .APK File lena:</p>
                  Humne aapka pura project aur Android configuration aapke GitHub par push kar diya hai. Ab GitHub ke free cloud servers se bina computer ke APK banwaya ja sakta hai.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Mobile se 1-minute me APK kaise download karein:
                </h4>

                <div className="p-3 rounded-xl bg-[#121722] border border-[#1e2636] space-y-2">
                  <p className="text-slate-300">
                    <strong>Step 1:</strong> Apne GitHub Repo par jayein:
                  </p>
                  <a
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hover:bg-cyan-500/30"
                  >
                    Open GitHub Repo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#121722] border border-[#1e2636] space-y-1.5 text-slate-300">
                  <p>
                    <strong>Step 2:</strong> GitHub me <strong>workflows/build-apk.yml</strong> file kholein aur content copy karke <strong>Add file &gt; Create new file</strong> me path daalein:
                  </p>
                  <code className="block p-1.5 rounded bg-[#090d14] font-mono text-[11px] text-emerald-400 border border-[#222c3e]">
                    .github/workflows/build-apk.yml
                  </code>
                  <p className="text-slate-400">
                    Aur "Commit changes" dabayein.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#121722] border border-[#1e2636] space-y-1 text-slate-300">
                  <p>
                    <strong>Step 3:</strong> <strong>"Actions"</strong> tab me jayein, 3 minute me GitHub free me <strong>ArrowEscape.apk</strong> bana dega jise aap direct apne phone me download karke install kar sakte hain!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAY STORE & ADMOB MONETIZATION */}
          {activeTab === 'PLAYSTORE' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-white mb-0.5">Play Store aur Ads ka sach & aasan tareeka:</p>
                  Kya AI ye sab khud kar sakta hai? AI ne <strong>100% code, Android setup, AdMob ads logic, aur 500 levels</strong> sab kuch ready kar diya hai.
                  Lekin Google ki security ke niyam ke anusaar, Play Console account aur bank account setup sirf account ka maalik (Aap) hi kar sakta hai.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Aapko phone se sirf ye 2 steps karne honge:
                </h4>

                <div className="p-3 rounded-xl bg-[#121722] border border-[#1e2636] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1. Google Play Console Account:</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Mobile browser me <a href="https://play.google.com/console/signup" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">play.google.com/console</a> kholein. Google $25 (one-time fee) mangta hai debit/credit card se.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#121722] border border-[#1e2636] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. Google AdMob (Ads se kamai ke liye):</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    <a href="https://admob.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">admob.google.com</a> par apni Gmail se login karein (bilkul Free hai). Wahan se Banner aur Rewarded Ad Unit ID copy karke game me daal dein, har ad view par paise aapke bank account me aayenge.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pro Tip:</strong> Agar aapke paas abhi $25 nahi hain, toh sabse pehle <strong>Method 1 (1-Tap Install)</strong> ka use karke apne dosto ko link share karke game khilayein aur feedback lein!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1d2636] bg-[#090d14] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Arrow Escape v1.0 • Mobile Ready</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1e2738] hover:bg-[#2b374e] text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
