export const alignWords = (expected: string[], transcribed: string[]) => {
  if (expected.length === 0) return [];
  if (transcribed.length === 0) {
    return expected.map(word => ({ type: 'missing', expected: word, got: null }));
  }

  const dp = Array(expected.length + 1).fill(null).map(() =>
    Array(transcribed.length + 1).fill(null).map(() => ({ cost: Infinity, ops: [] }))
  );

  dp[0][0] = { cost: 0, ops: [] };

  for (let i = 1; i <= expected.length; i++) {
    dp[i][0] = {
      cost: i,
      ops: [...dp[i - 1][0].ops, { type: 'missing', expected: expected[i - 1], got: null }]
    };
  }

  for (let j = 1; j <= transcribed.length; j++) {
    dp[0][j] = {
      cost: j,
      ops: [...dp[0][j - 1].ops, { type: 'extra', expected: null, got: transcribed[j - 1] }]
    };
  }

  for (let i = 1; i <= expected.length; i++) {
    for (let j = 1; j <= transcribed.length; j++) {
      const match = expected[i - 1] === transcribed[j - 1];
      const matchCost = match ? 0 : 1;

      const candidates = [
        {
          cost: dp[i - 1][j - 1].cost + matchCost,
          ops: [...dp[i - 1][j - 1].ops, {
            type: match ? 'correct' : 'wrong',
            expected: expected[i - 1],
            got: transcribed[j - 1]
          }]
        },
        {
          cost: dp[i - 1][j].cost + 1,
          ops: [...dp[i - 1][j].ops, { type: 'missing', expected: expected[i - 1], got: null }]
        },
        {
          cost: dp[i][j - 1].cost + 1,
          ops: [...dp[i][j - 1].ops, { type: 'extra', expected: null, got: transcribed[j - 1] }]
        }
      ];

      dp[i][j] = candidates.reduce((best, curr) => curr.cost < best.cost ? curr : best);
    }
  }

  return dp[expected.length][transcribed.length].ops;
};

export const clearSentencePunctuation = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^\p{L}\s']+/gu, '')