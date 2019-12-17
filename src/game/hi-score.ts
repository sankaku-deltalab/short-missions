const hiScoreKey = "hiScores";

export function initHiScore(): void {
  if (localStorage.getItem(hiScoreKey) === null) {
    const scores = Array(20)
      .fill(0)
      .map((_, i) => [i, -1]);
    localStorage.setItem(
      hiScoreKey,
      JSON.stringify(Object.fromEntries(scores))
    );
  }
}

export function clearHiScore(): void {
  localStorage.removeItem(hiScoreKey);
}

export function loadAllHiScore(): { [key: number]: number } {
  const score = localStorage.getItem(hiScoreKey);
  if (score === null) {
    return loadAllHiScore();
  }
  return JSON.parse(score);
}

export function storeHiScore(missionId: number, hiScore: number): void {
  const score = loadAllHiScore();
  score[missionId] = hiScore;
  localStorage.setItem(hiScoreKey, JSON.stringify(score));
}

export function loadHiScore(missionId: number): number {
  const score = loadAllHiScore();
  return score[missionId];
}
