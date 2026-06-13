import { fraction } from "./src/lib/masaniello";

let bank = 100;
let events = 15;
let wins = 10;
let p = 0.92;

for(let i=0; i<6; i++) {
  let f = fraction(events, wins, p);
  let stake = bank * f;
  console.log(`Event ${15-events+1}: Bank: ${bank.toFixed(2)}, Stake: ${stake.toFixed(2)}`);
  bank -= stake;
  events--;
}
