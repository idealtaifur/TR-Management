const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf8');

code = code.replace(/dayStartBalance: 228.35,/g, 'dayStartBalance: 228.35, resetCount: 0, blockedUntil: null,');
code = code.replace(/dayStartBalance: 0,/g, 'dayStartBalance: 0, resetCount: 0, blockedUntil: null,');

fs.writeFileSync('src/store/useStore.ts', code);
