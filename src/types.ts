/** Shared types for the casino takeover. */

/** Meaningless-but-expensive numbers regenerated on every run. */
export type CasinoStats = {
  valuation: number;
  vibeLevel: number;
  bugMultiplier: number;
  investorConfidence: number;
  productionConfidence: number;
  technicalDebt: number;
  jackpotNumber: number;
};

/** A guaranteed-winning slot outcome. All three reels always match. */
export type SlotSymbol = "777" | "BUG" | "ANY" | "NULL" | "$$$" | "TODO";

export type SlotResult = {
  symbol: SlotSymbol;
  title: string;
  subtitle: string;
};

/** Everything a generator needs to render one run of the casino. */
export type CasinoContext = {
  projectName: string;
  stats: CasinoStats;
  slot: SlotResult;
};

/** Injectable source of randomness so generators stay testable. */
export type RandomSource = () => number;
