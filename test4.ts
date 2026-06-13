import { bankRatio } from "./src/lib/masaniello";

console.log("0.92:", 100 * bankRatio(8, 2, 0.92) - 100);
console.log("0.85:", 100 * bankRatio(8, 2, 0.85) - 100);
console.log("What yields 3.75?");
for (let p=50; p<=100; p++) {
   const r = 100 * bankRatio(8, 2, p/100) - 100;
   // console.log(p, r);
   if (r > 3.7 && r < 3.8) {
     console.log("FOUND p=", p, "yield=", r);
   }
}
