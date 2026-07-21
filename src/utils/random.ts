import type { CasinoStats, RandomSource, SlotResult, SlotSymbol } from "../types.js";
import { SLOT_OUTCOMES } from "../constants.js";

/** Inclusive integer in [min, max]. Throws on an inverted range. */
export function randomInteger(min: number, max: number, random: RandomSource = Math.random): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError("randomInteger requires finite bounds");
  }
  if (min > max) {
    throw new RangeError(`randomInteger requires min <= max (got ${min} > ${max})`);
  }
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  // Math.random() can theoretically return values arbitrarily close to 1.
  const roll = Math.min(Math.max(random(), 0), 0.999_999_999_9);
  return lower + Math.floor(roll * (upper - lower + 1));
}

/** Picks one element. Throws on an empty list rather than returning undefined. */
export function randomPick<T>(items: readonly T[], random: RandomSource = Math.random): T {
  if (items.length === 0) {
    throw new RangeError("randomPick requires a non-empty array");
  }
  const item = items[randomInteger(0, items.length - 1, random)];
  if (item === undefined) {
    throw new RangeError("randomPick produced an out-of-range index");
  }
  return item;
}

/** Rolls the fake financials. Every number is lucky, none of them are real. */
export function createCasinoStats(random: RandomSource = Math.random): CasinoStats {
  return {
    // Multiples of 7,777,777 so the valuation is mostly sevens.
    valuation: randomInteger(100, 999, random) * 7_777_777,
    vibeLevel: randomInteger(7_000, 9_999, random),
    bugMultiplier: randomInteger(77, 777, random),
    investorConfidence: randomInteger(120, 400, random),
    productionConfidence: randomInteger(1, 17, random),
    technicalDebt: randomInteger(7, 99, random) * 777_000,
    jackpotNumber: 777,
  };
}

/** Picks a winning line. The house never lets you lose here. */
export function createSlotResult(random: RandomSource = Math.random): SlotResult {
  return randomPick(SLOT_OUTCOMES, random);
}

export type { SlotSymbol };
