import { bankRatio } from "./src/lib/masaniello";

console.log("8,2,0.85:", (bankRatio(8, 2, 0.85)-1)*100);
console.log("8,3,0.92:", (bankRatio(8, 3, 0.92)-1)*100);
console.log("8,2,0.92:", (bankRatio(8, 2, 0.92)-1)*100);
