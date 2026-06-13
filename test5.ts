import { bankRatio, fraction } from "./src/lib/masaniello";

let bank = 100;
let events = 8;
let winsNeeded = 2;
let payout = 0.92;

console.log("Expected Final Bank:", bank * bankRatio(events, winsNeeded, payout));

for (let i = 0; i < 8; i++) {
   let f = fraction(events, winsNeeded, payout);
   let stake = bank * f;
   console.log(`Event ${i+1}: Stake=${stake.toFixed(2)}, Bank=${bank.toFixed(2)}, f=${f.toFixed(4)}`);
   
   // simulate win first 2 times
   if (winsNeeded > 0) {
      bank += stake * payout;
      winsNeeded--;
      console.log('WIN');
   } else {
      bank -= stake;
      console.log('LOSS');
   }
   events--;
   if (winsNeeded === 0 && events === 0) break;
}
console.log("Final Bank:", bank.toFixed(2));
