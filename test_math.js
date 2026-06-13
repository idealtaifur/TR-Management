const combinations = (n, k) => {
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - i + 1) / i;
    }
    return result;
}

const payout = 0.92;
const n = 8;
const k = 2;
const balance = 100;

// some common formulas
console.log('formula 1', balance * (Math.pow(1 + payout, k) - 1));
console.log('formula 2', balance / combinations(n,k));
