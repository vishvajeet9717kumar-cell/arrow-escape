/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ad Management & Monetization Architecture for Arrow Escape.
 * Manages rewarded video ads, interstitial triggers, and ad statistics.
 * Ready for drop-in Google AdMob (mobile web / applet) or AdSense for Games (H5).
 */

import { AdType, RewardReason, AdRewardConfig } from '../types/game';

const AD_STATS_KEY = 'arrow_escape_ad_stats_v1';
const INTERSTITIAL_FREQUENCY = 4; // Show interstitial every 4 levels cleared

export interface AdStats {
  totalAdsWatched: number;
  rewardedAdsWatched: number;
  interstitialsShown: number;
  coinsEarnedFromAds: number;
  lastAdTimestamp: number;
  levelsClearedSinceInterstitial: number;
}

export const REWARD_CONFIGS: Record<RewardReason, AdRewardConfig> = {
  coins_50: {
    reason: 'coins_50',
    title: '+50 Free Coins',
    description: 'Watch a short sponsor video to instantly claim 50 gold coins!',
    rewardValue: 50,
  },
  free_hint: {
    reason: 'free_hint',
    title: 'Free Solution Hint',
    description: 'Watch a short sponsor video to reveal a free unblocked arrow hint without spending coins!',
    rewardValue: 1,
  },
  double_victory_coins: {
    reason: 'double_victory_coins',
    title: 'Double Level Coins (2x)',
    description: 'Watch a short sponsor video to double all the coins earned from this level victory!',
  },
  rush_second_chance: {
    reason: 'rush_second_chance',
    title: 'Second Chance (+15s)',
    description: 'Watch a short sponsor video to gain +15 seconds and continue your Rush Blitz streak!',
    rewardValue: 15,
  },
};

export function loadAdStats(): AdStats {
  if (typeof window === 'undefined') {
    return {
      totalAdsWatched: 0,
      rewardedAdsWatched: 0,
      interstitialsShown: 0,
      coinsEarnedFromAds: 0,
      lastAdTimestamp: 0,
      levelsClearedSinceInterstitial: 0,
    };
  }

  try {
    const raw = localStorage.getItem(AD_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        totalAdsWatched: Number(parsed.totalAdsWatched) || 0,
        rewardedAdsWatched: Number(parsed.rewardedAdsWatched) || 0,
        interstitialsShown: Number(parsed.interstitialsShown) || 0,
        coinsEarnedFromAds: Number(parsed.coinsEarnedFromAds) || 0,
        lastAdTimestamp: Number(parsed.lastAdTimestamp) || 0,
        levelsClearedSinceInterstitial: Number(parsed.levelsClearedSinceInterstitial) || 0,
      };
    }
  } catch {
    // Ignore JSON error
  }

  return {
    totalAdsWatched: 0,
    rewardedAdsWatched: 0,
    interstitialsShown: 0,
    coinsEarnedFromAds: 0,
    lastAdTimestamp: 0,
    levelsClearedSinceInterstitial: 0,
  };
}

export function saveAdStats(stats: AdStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AD_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage error
  }
}

class AdManagerService {
  private stats: AdStats = loadAdStats();

  public getStats(): AdStats {
    return { ...this.stats };
  }

  /**
   * Called when a player completes a level in Classic mode.
   * Returns true if an interstitial ad should be triggered.
   * Only triggers starting after level 3 (so beginner players enjoy smooth onboarding).
   */
  public onLevelCompleted(levelNumber: number): boolean {
    if (levelNumber < 3) {
      return false;
    }

    this.stats.levelsClearedSinceInterstitial += 1;
    saveAdStats(this.stats);

    if (this.stats.levelsClearedSinceInterstitial >= INTERSTITIAL_FREQUENCY) {
      return true;
    }

    return false;
  }

  /**
   * Resets the counter once an interstitial is shown or dismissed.
   */
  public markInterstitialShown(): void {
    this.stats.interstitialsShown += 1;
    this.stats.totalAdsWatched += 1;
    this.stats.levelsClearedSinceInterstitial = 0;
    this.stats.lastAdTimestamp = Date.now();
    saveAdStats(this.stats);
  }

  /**
   * Records a watched rewarded video ad and updates coins/stats.
   */
  public recordRewardedWatched(coinsEarned: number = 0): void {
    this.stats.rewardedAdsWatched += 1;
    this.stats.totalAdsWatched += 1;
    this.stats.coinsEarnedFromAds += coinsEarned;
    this.stats.lastAdTimestamp = Date.now();
    saveAdStats(this.stats);
  }

  /**
   * Cooldown check: ensures minimum time between back-to-back ads.
   */
  public canShowAd(minCooldownSeconds: number = 3): boolean {
    const elapsed = (Date.now() - this.stats.lastAdTimestamp) / 1000;
    return elapsed >= minCooldownSeconds;
  }
}

export const adManager = new AdManagerService();
