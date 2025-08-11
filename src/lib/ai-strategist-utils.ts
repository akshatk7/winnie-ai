export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as <= be && bs <= ae; // inclusive overlap
}

export function fatigueScore(
  channels: Array<'email'|'push'|'sms'|'inapp'|'discount'>,
  colliders: { dailyTouches: number; segments: string[] }[]
): 'low'|'medium'|'high' {
  const touchWeights: Record<string, number> = { email: 0.5, push: 1, sms: 1, inapp: 0.5, discount: 0 };
  const plannedPerDay = channels.reduce((n, c) => n + (touchWeights[c] ?? 0), 0);
  const maxColliderTouches = colliders.reduce((m, c) => Math.max(m, c.dailyTouches), 0);
  const score = plannedPerDay + maxColliderTouches;
  if (score <= 1.5) return 'low';
  if (score <= 2.5) return 'medium';
  return 'high';
}

export function projectedImprovement(
  channels: Array<'email'|'push'|'sms'|'inapp'|'discount'>,
  channelLiftTable: Record<'email'|'push'|'sms'|'inapp'|'discount', number>,
  discountAllowed: boolean
): number {
  const sum = channels.reduce((acc, ch) => {
    if (ch === 'discount' && !discountAllowed) return acc + 0;
    return acc + (channelLiftTable[ch] || 0);
  }, 0);
  return Math.min(Number(sum.toFixed(1)), 9.9);
}
