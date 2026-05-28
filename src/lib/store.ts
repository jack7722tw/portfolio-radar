// Client-side localStorage store for MVP
// Can be migrated to a database later

import type { Position, Trade, WeeklyReport } from './types';

const KEYS = {
  POSITIONS: 'portfolio-radar-positions',
  TRADES: 'portfolio-radar-trades',
  REPORTS: 'portfolio-radar-reports',
} as const;

export function getPositions(): Position[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEYS.POSITIONS);
  return raw ? JSON.parse(raw) : [];
}

export function savePositions(positions: Position[]) {
  localStorage.setItem(KEYS.POSITIONS, JSON.stringify(positions));
}

export function getTrades(): Trade[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEYS.TRADES);
  return raw ? JSON.parse(raw) : [];
}

export function saveTrades(trades: Trade[]) {
  localStorage.setItem(KEYS.TRADES, JSON.stringify(trades));
}

export function getReports(): WeeklyReport[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEYS.REPORTS);
  return raw ? JSON.parse(raw) : [];
}

export function saveReports(reports: WeeklyReport[]) {
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
}
