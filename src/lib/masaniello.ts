// Dynamic programming approach to calculate Masaniello sequence values
export function bankRatio(n: number, k: number, p: number): number {
  if (k === 0) return 1;
  if (k > n || n <= 0 || p <= 0) return 0;
  if (n === k) return Math.pow(1 + p, k);
  
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(k + 1).fill(0));
  
  for (let i = 0; i <= n; i++) dp[i][0] = 1;
  for (let j = 1; j <= k; j++) dp[j][j] = Math.pow(1 + p, j);
  
  for (let i = 2; i <= n; i++) {
    for (let j = 1; j < i && j <= k; j++) {
      const hWin = dp[i - 1][j - 1];
      const hLoss = dp[i - 1][j];
      
      if (hWin === 0 || hLoss === 0) continue;
      
      const frac = (hLoss - hWin) / (hLoss + p * hWin);
      dp[i][j] = hLoss * (1 - frac);
    }
  }
  return dp[n][k];
}

export function fraction(n: number, k: number, p: number): number {
  if (k === 0 || n < k) return 0;
  if (n === k) return 1;
  
  const hWin = bankRatio(n - 1, k - 1, p);
  const hLoss = bankRatio(n - 1, k, p);
  
  if (hWin === 0 || hLoss === 0) return 0;
  
  const divider = hLoss + p * hWin;
  if (divider === 0) return 0;
  
  return (hLoss - hWin) / divider;
}
