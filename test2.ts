import { bankRatio, fraction } from "./src/lib/masaniello";

const balance = 100;
const masaniello = {
  events: 9,
  winsNeeded: 5,
  payout: 92,
  targetProfit: undefined,  // Wait, maybe targetProfit wasn't in state when they created it?
  sessionStartBalance: 100
};

const targetBankRatio = bankRatio(masaniello.events, masaniello.winsNeeded, masaniello.payout / 100);

// If targetProfit is undefined, it behaves as 0 or undefined.
const targetProfit = masaniello.targetProfit || 8; // OH! wait! `masaniello.targetProfit` fallback is 0?
// Wait, in my code, I wrote: 
// const systemTargetBalance = masaniello.sessionStartBalance + masaniello.targetProfit;
// If targetProfit is undefined, this is NaN!
console.log("systemTargetBalance =", masaniello.sessionStartBalance + masaniello.targetProfit);
