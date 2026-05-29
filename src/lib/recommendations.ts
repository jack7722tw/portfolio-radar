import type { Recommendation, RecommendationOutcome, RecommendationStats } from './types';

const STORAGE_KEY = 'portfolio-radar-recommendations';

export function getRecommendations(): Recommendation[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveRecommendations(recs: Recommendation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
}

export function addRecommendation(rec: Omit<Recommendation, 'id' | 'timestamp' | 'outcome'>): Recommendation {
  const full: Recommendation = {
    ...rec,
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    outcome: null,
  };
  const all = getRecommendations();
  all.unshift(full);
  saveRecommendations(all);
  return full;
}

export function evaluateRecommendation(
  id: string,
  currentPrice: number,
  followed: boolean
): Recommendation | null {
  const all = getRecommendations();
  const rec = all.find(r => r.id === id);
  if (!rec) return null;

  const returnPercent = ((currentPrice - rec.priceAtRecommendation) / rec.priceAtRecommendation) * 100;
  rec.outcome = {
    evaluatedAt: new Date().toISOString(),
    priceAtEvaluation: currentPrice,
    returnPercent,
    followed,
  };
  saveRecommendations(all);
  return rec;
}

export function calcRecommendationStats(recs: Recommendation[]): RecommendationStats {
  const evaluated = recs.filter(r => r.outcome !== null);
  const wins = evaluated.filter(r => r.outcome!.returnPercent > 0);
  const followed = evaluated.filter(r => r.outcome!.followed);
  const unfollowed = evaluated.filter(r => !r.outcome!.followed);

  const followedWins = followed.filter(r => r.outcome!.returnPercent > 0);
  const unfollowedWins = unfollowed.filter(r => r.outcome!.returnPercent > 0);

  return {
    total: recs.length,
    evaluated: evaluated.length,
    wins: wins.length,
    winRate: evaluated.length > 0 ? (wins.length / evaluated.length) * 100 : 0,
    avgReturn: evaluated.length > 0
      ? evaluated.reduce((s, r) => s + r.outcome!.returnPercent, 0) / evaluated.length
      : 0,
    followedWinRate: followed.length > 0 ? (followedWins.length / followed.length) * 100 : 0,
    unfollowedWinRate: unfollowed.length > 0 ? (unfollowedWins.length / unfollowed.length) * 100 : 0,
    followedAvgReturn: followed.length > 0
      ? followed.reduce((s, r) => s + r.outcome!.returnPercent, 0) / followed.length
      : 0,
    unfollowedAvgReturn: unfollowed.length > 0
      ? unfollowed.reduce((s, r) => s + r.outcome!.returnPercent, 0) / unfollowed.length
      : 0,
  };
}
